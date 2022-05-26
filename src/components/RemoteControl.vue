<template>
    <div class="h-100 w-100 d-flex flex-row justify-center align-center">
        <div class="h-100 flex-grow-1" ref="remoteContainer"></div>
        <div class="flex-grow-0">
            <v-btn v-show="commandsIssued > 2"
                color="primary"
                icon="mdi-chevron-right"
                size="x-large"
                to="/direct-grid"></v-btn>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { defineComponent } from 'vue'
import * as PIXI from "pixi.js"
import carRemoteUrl from '@/assets/car-remote.png'
import type { InteractionEvent } from 'pixi.js'
import { HUB_COMMANDS, useLegoHubStore } from '@/stores/legohub'
import type { CarRemoteData } from '@/remote-helpers'
import { detectCommand } from '@/remote-helpers'

export default defineComponent({
    name: "RemoteControl",
    setup () {
        const legoHubStore = useLegoHubStore()
        legoHubStore.sequentialMode = false
        legoHubStore.clearCommands()
        return {
            carRemoteUrl,
            legoHubStore,
            HUB_COMMANDS
        }
    },
    data (): RemoteControlData {
        return {
            commandsIssued: 0,
            pixiApp: null,
            carRemote: {
                sprite: new PIXI.Sprite(PIXI.Texture.EMPTY),
                gridPosition: [0, 0],
                rotation: 0
            },
        }
    },
    mounted () {
        this.initPixi()
    },
    unmounted () {
        PIXI.Loader.shared.resources['carRemote'].texture?.destroy(true)
        PIXI.Loader.shared.reset()
        this.carRemote.sprite.destroy(true)
        this.pixiApp?.destroy(true)
    },
    methods: {
        tick() {
            const scale = Math.min(this.pixiApp!.renderer.width / this.carRemote.sprite.texture.width, this.pixiApp!.renderer.height / this.carRemote.sprite.texture.height)
            this.carRemote.sprite.width = this.carRemote.sprite.texture.width * scale
            this.carRemote.sprite.height = this.carRemote.sprite.texture.height * scale
            this.carRemote.sprite.x = this.pixiApp!.renderer.width / 2
            this.carRemote.sprite.y = this.pixiApp!.renderer.height / 2
            if (this.carRemote.sprite.angle < this.carRemote.rotation) {
                this.carRemote.sprite.angle += 2
                if (this.carRemote.sprite.angle > this.carRemote.rotation) this.carRemote.sprite.angle = this.carRemote.rotation
            } else if (this.carRemote.sprite.angle > this.carRemote.rotation) {
                this.carRemote.sprite.angle -= 2
                if (this.carRemote.sprite.angle < this.carRemote.rotation) this.carRemote.sprite.angle = this.carRemote.rotation
            }
        },
        initPixi() {
            const container = this.$refs.remoteContainer as HTMLDivElement
            this.pixiApp = new PIXI.Application({resizeTo: container, backgroundAlpha: 0})
            container.appendChild(this.pixiApp!.view)
            PIXI.Loader.shared.add('carRemote', carRemoteUrl).load((loader, resources) => {
                this.carRemote.sprite = new PIXI.Sprite(resources.carRemote.texture)
                this.carRemote.sprite.anchor.set(0.5)
                this.carRemote.sprite.interactive = true
                this.carRemote.sprite.on("mousedown", this.handleClick)
                this.carRemote.sprite.on("touchstart", this.handleClick)
                this.pixiApp!.stage.addChild(this.carRemote.sprite as PIXI.Sprite)
                this.pixiApp!.ticker.add(this.tick)
            })
        },
        handleClick(evt: InteractionEvent) {
            const cmd = detectCommand(evt.data.global, this.carRemote as CarRemoteData)
            if (cmd && cmd == HUB_COMMANDS.FORWARD) {
                this.commandsIssued++
                this.legoHubStore.addCommand({cmd: HUB_COMMANDS.FORWARD, rotationContext: this.carRemote.rotation})
            } else if (cmd && cmd == HUB_COMMANDS.BACKWARD) {
                this.commandsIssued++
                this.legoHubStore.addCommand({cmd: HUB_COMMANDS.BACKWARD, rotationContext: this.carRemote.rotation})
            } else if (cmd && cmd == HUB_COMMANDS.LEFT) {
                this.commandsIssued++
                this.carRemote.rotation -= 90
                this.legoHubStore.addCommand({cmd: HUB_COMMANDS.LEFT, rotationContext: this.carRemote.rotation})
            } else if (cmd && cmd == HUB_COMMANDS.RIGHT) {
                this.commandsIssued++
                this.carRemote.rotation += 90
                this.legoHubStore.addCommand({cmd: HUB_COMMANDS.RIGHT, rotationContext: this.carRemote.rotation})
            } else {
                console.log("not detected")
            }
        }
    }
})

interface RemoteControlData {
    commandsIssued: number
    pixiApp: PIXI.Application | null
    carRemote: CarRemoteData
}

</script>

<style>
.w-100 {
    width: 100%;
}
.remote-image {
    max-height: 84vh;
}
</style>