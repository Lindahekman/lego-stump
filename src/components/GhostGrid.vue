<template>
    <div class="h-100 w-100 d-flex flex-row justify-center align-center">
        <div class="h-100 w-100 flex-grow-1" ref="gridContainer"></div>
        <div class="flex-grow-0">
            <v-btn v-show="reachedGoal > 0"
                color="primary"
                icon="mdi-chevron-right"
                size="x-large"
                to="/sequential-remote"></v-btn>
        </div>
        <v-dialog v-model="crashDialog">
            <v-card>
                <v-card-title>Åh nej! Køre-Karl kørte galt!</v-card-title>
                <v-card-text>
                    <v-img :src="stopUrl"></v-img>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="primary" block @click="crashDialog = false">Luk</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="goalDialog">
            <v-card>
                <v-card-title>Køre-Karl kom i mål!</v-card-title>
                <v-card-text>
                    <v-img :src="goalUrl"></v-img>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="primary" block @click="goalDialog = false">Luk</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { defineComponent } from 'vue'
import * as PIXI from "pixi.js"
import { sound } from '@pixi/sound';
import carRemoteUrl from '@/assets/car-remote.png'
import carGhostUrl from '@/assets/car-ghost.png'
import type { InteractionEvent } from 'pixi.js'
import { HUB_COMMANDS, useLegoHubStore } from '@/stores/legohub'
import type { CarRemoteData } from '@/remote-helpers'
import { detectCommand } from '@/remote-helpers'
import crashUrl from '@/assets/crash.wav'
import cheerUrl from '@/assets/cheer.wav'
import grid2Url from '@/assets/grids/grid2.png'
import goalUrl from '@/assets/goal.jpg'
import stopUrl from '@/assets/stop.png'

export default defineComponent({
    name: "GhostGrid",
    setup () {
        const legoHubStore = useLegoHubStore()
        legoHubStore.sequentialMode = true
        legoHubStore.clearCommands()
        return {
            carRemoteUrl,
            goalUrl,
            stopUrl,
            legoHubStore,
            HUB_COMMANDS
        }
    },
    data (): GridData {
        return {
            resizeInterval: null,
            gridNumber: 2,
            reachedGoal: 0,
            pixiApp: null,
            grid: new PIXI.Sprite(PIXI.Texture.EMPTY),
            carRemote: {
                sprite: new PIXI.Sprite(PIXI.Texture.EMPTY),
                gridPosition: [0, 2],
                rotation: 90
            },
            carGhost: {
                sprite: new PIXI.Sprite(PIXI.Texture.EMPTY),
                gridPosition: [0, 2],
                rotation: 90
            },
            crashDialog: false,
            goalDialog: false
        }
    },
    created () {
        this.legoHubStore.$subscribe((mutation, state) => {
            if (state.commands.length < 1) {
                const curPos: GridPosition = [[...this.carGhost.gridPosition].slice()[0], [...this.carGhost.gridPosition].slice()[1]]
                let goalPos: GridPosition = [0,0]
                if (this.gridNumber == 2) goalPos = [...grid2Allows].slice()[grid2Allows.length - 1]
                console.log("curPos", curPos, "goalPos", goalPos)
                if (curPos[0] == goalPos[0] && curPos[1] == goalPos[1]) this.goal()
                let startPosition: GridPosition = [0,0]
                if (this.gridNumber == 2) startPosition = [...grid2Allows].slice()[0]
                this.carGhost.gridPosition = [startPosition.slice()[0], startPosition.slice()[1]] // weird copying
                this.carRemote.rotation = 90
                this.carGhost.rotation = 90
            }
        })
    },
    mounted () {
        this.initPixi()
        this.resizeInterval = setInterval(() => {
            this.pixiApp?.resize()
        }, 2000)
    },
    unmounted () {
        PIXI.Loader.shared.resources['grid'].texture?.destroy(true)
        PIXI.Loader.shared.resources['carRemote'].texture?.destroy(true)
        PIXI.Loader.shared.reset()
        this.carRemote.sprite.destroy(true)
        this.pixiApp?.destroy(true)
        if (this.resizeInterval) clearInterval(this.resizeInterval)
    },
    methods: {
        tick() {
            800 / (500 * 6 / 5)
            const gridScale = Math.min(this.pixiApp!.renderer.width / (this.grid.texture.baseTexture.width * 6 / 5), this.pixiApp!.renderer.height / this.grid.texture.baseTexture.height)
            this.grid.width = this.grid.texture.width * gridScale
            this.grid.height = this.grid.texture.height * gridScale
            const carGhostScale = Math.min((this.grid.width / 5) / this.carGhost.sprite.texture.baseTexture.width, (this.grid.height / 3) / this.carGhost.sprite.texture.baseTexture.height)
            const carRemoteScale = Math.min((this.grid.width / 5) / this.carRemote.sprite.texture.baseTexture.width, (this.grid.height / 3) / this.carRemote.sprite.texture.baseTexture.height)
            this.carGhost.sprite.width = this.carGhost.sprite.texture.width * carGhostScale
            this.carGhost.sprite.height = this.carGhost.sprite.texture.height * carGhostScale
            this.carRemote.sprite.width = this.carRemote.sprite.texture.width * carRemoteScale
            this.carRemote.sprite.height = this.carRemote.sprite.texture.height * carRemoteScale
            // grid offsets
            const cellSize = this.grid.width / 5
            this.grid.x = cellSize
            this.carRemote.sprite.x = cellSize / 2
            this.carRemote.sprite.y = cellSize + (cellSize / 2)
            const baseOffset = cellSize / 2
            const targetX = (baseOffset + ((this.carGhost.gridPosition[0] + 1) * cellSize))
            const targetY = (baseOffset + (this.carGhost.gridPosition[1] * cellSize))
            const speed = 4
            if (this.carGhost.sprite.x < targetX) {
                this.carGhost.sprite.x += speed
                if (this.carGhost.sprite.x > targetX) this.carGhost.sprite.x = targetX
            } else if (this.carGhost.sprite.x > targetX) {
                this.carGhost.sprite.x -= speed
                if (this.carGhost.sprite.x < targetX) this.carGhost.sprite.x = targetX
            }
            if (this.carGhost.sprite.y < targetY) {
                this.carGhost.sprite.y += speed
                if (this.carGhost.sprite.y > targetY) this.carGhost.sprite.y = targetY
            } else if (this.carGhost.sprite.y > targetY) {
                this.carGhost.sprite.y -= speed
                if (this.carGhost.sprite.y < targetY) this.carGhost.sprite.y = targetY
            }
            this.carGhost.rotation = this.carRemote.rotation
            if (this.carRemote.sprite.angle < this.carRemote.rotation) {
                this.carRemote.sprite.angle += 2
                if (this.carRemote.sprite.angle >= this.carRemote.rotation) this.carRemote.sprite.angle = this.carRemote.rotation
            } else if (this.carRemote.sprite.angle > this.carRemote.rotation) {
                this.carRemote.sprite.angle -= 2
                if (this.carRemote.sprite.angle <= this.carRemote.rotation) this.carRemote.sprite.angle = this.carRemote.rotation
            }
            this.carGhost.sprite.angle = this.carRemote.sprite.angle
        },
        initPixi() {
            const container = this.$refs.gridContainer as HTMLDivElement
            this.pixiApp = new PIXI.Application({resizeTo: this.$refs.gridContainer as HTMLDivElement, backgroundAlpha: 0})
            container.appendChild(this.pixiApp!.view)
            PIXI.Loader.shared.add('grid', grid2Url).add('carRemote', carRemoteUrl).add('carGhost', carGhostUrl).load((loader, resources) => {
                this.grid = new PIXI.Sprite(resources.grid.texture)
                this.pixiApp!.stage.addChild(this.grid as PIXI.Sprite)
                const cellSize = Math.min(this.pixiApp!.renderer.width / 6, this.pixiApp!.renderer.height / 3)
                this.grid.x = cellSize
                this.carGhost.sprite = new PIXI.Sprite(resources.carGhost.texture)
                this.carGhost.sprite.alpha = 0.75
                this.carGhost.sprite.anchor.set(0.5)
                this.carGhost.sprite.x = cellSize + (cellSize / 2)
                this.carGhost.sprite.y = cellSize * this.carGhost.gridPosition[1] + (cellSize / 2)
                this.carGhost.sprite.angle = this.carGhost.rotation
                this.carRemote.sprite = new PIXI.Sprite(resources.carRemote.texture)
                this.carRemote.sprite.anchor.set(0.5)
                this.carRemote.sprite.x = cellSize / 2
                this.carRemote.sprite.y = cellSize + (cellSize / 2)
                this.carRemote.sprite.angle = this.carRemote.rotation
                this.carRemote.sprite.interactive = true
                this.carRemote.sprite.on("mousedown", this.handleClick)
                this.carRemote.sprite.on("touchstart", this.handleClick)
                this.pixiApp!.stage.addChild(this.carGhost.sprite as PIXI.Sprite)
                this.pixiApp!.stage.addChild(this.carRemote.sprite as PIXI.Sprite)
                this.pixiApp!.ticker.add(this.tick)
            })
            sound.add('crash', crashUrl)
            sound.add('cheer', cheerUrl)
        },
        crash() {
            console.error("CRASH")
            sound.play("crash")
            this.crashDialog = true
            this.legoHubStore.clearCommands()
        },
        goal() {
            console.log("GOAL")
            sound.play("cheer")
            this.goalDialog = true
            this.reachedGoal++
        },
        handleClick(evt: InteractionEvent) {
            const cmd = detectCommand(evt.data.global, this.carRemote as CarRemoteData)
            let rotation = this.carRemote.rotation
            while (rotation < 0) {
                rotation += 360
            }
            rotation = rotation % 360
            if (cmd && cmd == HUB_COMMANDS.FORWARD) {
                this.legoHubStore.addCommand({cmd: HUB_COMMANDS.FORWARD, rotationContext: this.carRemote.rotation})
                if (rotation == 0) this.carGhost.gridPosition[1]--
                else if (rotation == 90) this.carGhost.gridPosition[0]++
                else if (rotation == 180) this.carGhost.gridPosition[1]++
                else if (rotation == 270) this.carGhost.gridPosition[0]--
            } else if (cmd && cmd == HUB_COMMANDS.BACKWARD) {
                this.legoHubStore.addCommand({cmd: HUB_COMMANDS.BACKWARD, rotationContext: this.carRemote.rotation})
                if (rotation == 0) this.carGhost.gridPosition[1]++
                else if (rotation == 90) this.carGhost.gridPosition[0]--
                else if (rotation == 180) this.carGhost.gridPosition[1]--
                else if (rotation == 270) this.carGhost.gridPosition[0]++
            } else if (cmd && cmd == HUB_COMMANDS.LEFT) {
                this.legoHubStore.addCommand({cmd: HUB_COMMANDS.LEFT, rotationContext: this.carRemote.rotation})
                this.carRemote.rotation -= 90
            } else if (cmd && cmd == HUB_COMMANDS.RIGHT) {
                this.legoHubStore.addCommand({cmd: HUB_COMMANDS.RIGHT, rotationContext: this.carRemote.rotation})
                this.carRemote.rotation += 90
            } else {
                console.log("not detected")
            }
            const curPos: [number, number] = [[...this.carGhost.gridPosition].slice()[0], [...this.carGhost.gridPosition].slice()[1]]
            let allowsArr: GridPosition[] = []
            if (this.gridNumber == 2) allowsArr = [...grid2Allows].slice()
            if (!allowsArr.some((a) => a[0] === curPos[0] && a[1] === curPos[1])) this.crash()
        }
    }
})

type GridPosition = [number, number]

const grid2Allows: GridPosition[] = [
    [0,2],
    [1,2],
    [1,1],
    [1,0],
    [2,0],
    [3,0],
    [3,1],
    [3,2],
    [4,2]
]

interface GridData {
    resizeInterval: ReturnType<typeof setInterval> | null
    gridNumber: number
    reachedGoal: number
    pixiApp: PIXI.Application | null
    grid: PIXI.Sprite
    carRemote: CarRemoteData
    carGhost: CarRemoteData
    crashDialog: boolean
    goalDialog: boolean
}

</script>

<style>
.w-100 {
    width: 100% !important;
    max-width: 100% !important;
}

.remote-image {
    max-height: 84vh;
}
</style>