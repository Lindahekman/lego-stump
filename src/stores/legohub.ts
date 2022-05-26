import { defineStore } from 'pinia'
import * as Lego from '../lego-driver'

export enum HUB_COMMANDS {
    LEFT = 1,
    RIGHT = 2,
    FORWARD = 3,
    BACKWARD = 4,
    NUDGE_FORWARD = 5,
    NUDGE_BACKWARD = 6
}

export interface HubCommand {
    cmd: HUB_COMMANDS
    rotationContext: number
}

interface LegoHubStoreState {
    hub: Lego.Driver | null
    commands: HubCommand[]
    immediateCommand: HUB_COMMANDS | null
    ready: boolean
    sequentialMode: boolean
    driveSpeed: number
    driveDegrees: number
    turnDegrees: number
}

export const useLegoHubStore = defineStore('legohub', {
    state: (): LegoHubStoreState => ({
        hub: null,
        commands: [],
        immediateCommand: null,
        sequentialMode: false,
        ready: false,
        driveSpeed: 20,
        driveDegrees: 360,
        turnDegrees: 180,
    }),
    getters: {
        hasHub: (state): boolean => state.hub != null
    },
    actions: {
        async clearCommands(): Promise<void> {
            this.commands = []
        },
        async addCommand(cmd: HubCommand): Promise<void> {
            if (this.hub == null) throw 'addCommand on null hub'
            if (!this.ready) throw 'addCommand when not ready'
            this.commands.push(cmd)
            if (!this.sequentialMode) this.nextCommand()
        },
        async doCommand(cmd: HUB_COMMANDS): Promise<void> {
            console.info("doCommand()", cmd)
            if (this.hub == null) throw 'doCommand on null hub'
            if (!this.ready) throw 'doCommand when not ready'
            if (cmd == HUB_COMMANDS.LEFT) {
                this.hub.drive(this.turnDegrees, this.driveSpeed, this.driveSpeed)
            } else if (cmd == HUB_COMMANDS.RIGHT) {
                this.hub.drive(this.turnDegrees, -this.driveSpeed, -this.driveSpeed)
            } else if (cmd == HUB_COMMANDS.FORWARD) {
                this.hub.drive(this.driveDegrees, -this.driveSpeed, this.driveSpeed)
            } else if (cmd == HUB_COMMANDS.BACKWARD) {
                this.hub.drive(this.driveDegrees, this.driveSpeed, -this.driveSpeed)
            } else if (cmd == HUB_COMMANDS.NUDGE_FORWARD) {
                this.hub.drive(this.driveDegrees / 3, -this.driveSpeed, this.driveSpeed)
            } else if (cmd == HUB_COMMANDS.NUDGE_BACKWARD) {
                this.hub.drive(this.driveDegrees / 3, this.driveSpeed, -this.driveSpeed)
            }
        },
        async nextCommand(): Promise<void> {
            console.info("nextCommand()", Array.from(this.commands))
            if (this.hub == null) return
            if (!this.ready) return
            const next = this.commands.shift()
            if (next) {
                if (next.cmd == HUB_COMMANDS.LEFT || next.cmd == HUB_COMMANDS.RIGHT) {
                    this.immediateCommand = next.cmd
                    await this.doCommand(HUB_COMMANDS.NUDGE_FORWARD)
                } else {
                    await this.doCommand(next.cmd as HUB_COMMANDS)
                }
            }
        },
        async doneHandler(): Promise<void> {
            if (this.immediateCommand) {
                await this.doCommand(this.immediateCommand)
                if (this.immediateCommand == HUB_COMMANDS.LEFT || this.immediateCommand == HUB_COMMANDS.RIGHT) {
                    this.immediateCommand = HUB_COMMANDS.NUDGE_BACKWARD
                } else {
                    this.immediateCommand = null
                }
                return
            }
            await this.nextCommand()
        },
        async readyHandler(): Promise<void> {
            this.ready = this.hub ? this.hub.ready : false
        },
        async setHub(newHub: BluetoothRemoteGATTCharacteristic | null) {
            if (this.hub != null) {
                await this.hub.deinit()
            }
            if (newHub == null) {
                this.hub = null
                return
            }
            this.hub = new Lego.Driver(newHub)
            this.hub.addEventListener("READY", this.readyHandler)
            this.hub.addEventListener("DONE", this.doneHandler)
            await this.hub.init()
        },
        async newHub(): Promise<void> {
            const device = await navigator.bluetooth.requestDevice(legoHubRequestOptions)
            const characteristic = await getCharacteristicFromDevice(device)
            this.setHub(characteristic)
        },
        async existingHub(): Promise<void> {
            const devices = await navigator.bluetooth.getDevices()
            if (!(devices) || devices.length < 1) return
            const device = devices[0]
            if (!(device)) return
            const characteristic = await getCharacteristicFromDevice(device)
            this.setHub(characteristic)
        },
    }
})

const getCharacteristicFromDevice = (device: BluetoothDevice): Promise<BluetoothRemoteGATTCharacteristic> => {
    if (device.gatt) {
        return device.gatt.connect()
            .then(server => server.getPrimaryService(Lego.SERVICE_UUID))
            .then(service => service.getCharacteristic(Lego.CHARACTERISTIC_UUID))
    }
    return Promise.reject("device had no gatt")
}

const legoHubRequestOptions: RequestDeviceOptions = {
    filters: [{
        manufacturerData: [{
            companyIdentifier: Lego.COMPANY_IDENTIFIER
        }],
        services: [Lego.SERVICE_UUID]
    }]
}