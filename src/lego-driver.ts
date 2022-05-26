export const SERVICE_UUID = "00001623-1212-efde-1623-785feabcd123"
export const CHARACTERISTIC_UUID = "00001624-1212-efde-1623-785feabcd123"
export const COMPANY_IDENTIFIER = 0x0397
export const HUB_ID = 0x00

export enum MESSAGE_OFFSETS {
    LENGTH = 0,
    HUB_ID = 1,
    TYPE = 2,
}

export enum MESSAGE_TYPES { // https://lego.github.io/lego-ble-wireless-protocol-docs/index.html#message-types
    HUB_PROPERTIES = 0x01,
    HUB_ACTIONS = 0x02,
    HUB_ALERTS = 0x03,
    HUB_ATTACHED_IO = 0x04,
    GENERIC_ERRORS = 0x05,
    VIRTUAL_PORT_SETUP = 0x61,
    PORT_OUTPUT = 0x81,
    PORT_OUTPUT_FEEDBACK = 0x82,
}

export enum IO_TYPES { // https://lego.github.io/lego-ble-wireless-protocol-docs/index.html#io-type-id
    MOTOR = 0x0001,
    SYSTEM_TRAIN_MOTOR = 0x0002,
    BUTTON = 0x0005,
    LED_LIGHT = 0x0008,
    VOLTAGE = 0x0014,
    CURRENT = 0x0015,
    PIEZO_TONE = 0x0016,
    RGB_LIGHT = 0x0017,
    EXTERNAL_TILT_SENSOR = 0x0022,
    MOTION_SENSOR = 0x0023,
    VISION_SENSOR = 0x0025,
    EXTERNAL_MOTOR_TACHO = 0x0026,
    INTERNAL_MOTOR_TACHO = 0x0027,
    INTERNAL_TILT = 0x0028,
}

export enum MSG_HUB_ATTACHED_IO_EVENT {
    DETACHED = 0x00,
    ATTACHED = 0x01,
    ATTACHED_VIRTUAL = 0x02,
}

export interface MSG_HUB_ATTACHED_IO_PAYLOAD {
    port: number,
    event: MSG_HUB_ATTACHED_IO_EVENT,
    virtualA?: number,
    virtualB?: number
}

export const parseMsgHubAttachedIO = (msg: DataView): MSG_HUB_ATTACHED_IO_PAYLOAD => {
    if (msg.getUint8(MESSAGE_OFFSETS.TYPE) !== MESSAGE_TYPES.HUB_ATTACHED_IO) throw 'wrong message type (hub attached IO)'
    const evt = msg.getUint8(4)
    return {
        port: msg.getUint8(3),
        event: evt,
        virtualA: evt == MSG_HUB_ATTACHED_IO_EVENT.ATTACHED_VIRTUAL ? msg.getUint8(7) : undefined,
        virtualB: evt == MSG_HUB_ATTACHED_IO_EVENT.ATTACHED_VIRTUAL ? msg.getUint8(8) : undefined,
    }
}

export enum MSG_PORT_OUTPUT_FEEDBACK_MSG {
    BUFFER_EMPTY_CMD_IN_PROGRESS = 0x01,
    BUFFER_EMPTY_CMD_COMPLETED = 0x02,
    CMD_DISCARDED = 0x04,
    IDLE = 0x08,
    DONE = 0x0A, // docs state this as "Busy/FULL"
}

export interface MSG_PORT_OUTPUT_FEEDBACK_PAYLOAD {
    port: number,
    status: MSG_PORT_OUTPUT_FEEDBACK_MSG
}

export const parseMsgPortOutputFeedback = (msg: DataView): MSG_PORT_OUTPUT_FEEDBACK_PAYLOAD => {
    if (msg.getUint8(MESSAGE_OFFSETS.TYPE) !== MESSAGE_TYPES.PORT_OUTPUT_FEEDBACK) throw 'wrong message type (port output feedback)'
    return {
        port: msg.getUint8(3),
        status: msg.getUint8(4) as MSG_PORT_OUTPUT_FEEDBACK_MSG
    }
}

export class Driver extends EventTarget {
    public char: BluetoothRemoteGATTCharacteristic
    private hasMotorOne: boolean
    private hasMotorTwo: boolean
    private synchronizing: boolean
    private synchronized: number
    
    constructor(hub: BluetoothRemoteGATTCharacteristic) {
        super()
        this.char = hub
        this.hasMotorOne = false
        this.hasMotorTwo = false
        this.synchronizing = false
        this.synchronized = -1
    }

    public get ready() {
        return this.synchronized > -1
    }

    async init() {
        await this.char.startNotifications()
        this.char.addEventListener("characteristicvaluechanged", (evt) => this.handleEvent(evt))
    }

    async deinit() {
        this.char.removeEventListener("characteristicvaluechanged", (evt) => this.handleEvent(evt))
        await this.char.stopNotifications()
    }

    async writeMessage(msg: Int8Array) {
        const final = new Int8Array([msg.byteLength + 1, ...msg])
        console.log("writing message", Array.from(final))
        await this.char.writeValueWithResponse(final)
    }

    async drive(degrees: number, speedL: number, speedR: number) {
        const degreesArr = new Int8Array(Int32Array.of(degrees).buffer)
        const msg = Int8Array.of(HUB_ID, MESSAGE_TYPES.PORT_OUTPUT, this.synchronized, 0x00000001, 0x0C, ...degreesArr, speedL, speedR, 100, 127)
        this.writeMessage(msg)
    }

    handlePortOutputFeedback(payload: MSG_PORT_OUTPUT_FEEDBACK_PAYLOAD): void {
        if (payload.port == this.synchronized && payload.status == MSG_PORT_OUTPUT_FEEDBACK_MSG.DONE) {
            console.log("motor action done", this.synchronized)
            this.dispatchEvent(new Event("DONE"))
        } else {
            console.log("MSG_PORT_OUTPUT_FEEDBACK", payload)
        }
    }

    handleHubAttachedIO(payload: MSG_HUB_ATTACHED_IO_PAYLOAD): void {
        if (this.synchronizing && payload.event == MSG_HUB_ATTACHED_IO_EVENT.ATTACHED_VIRTUAL) {
            if (payload.virtualA !== payload.virtualB &&
                (payload.virtualA == 0 || payload.virtualA == 1) &&
                (payload.virtualB == 0 || payload.virtualB == 1)) {
                    this.synchronizing = false
                    console.log("got synchronizing port", payload.port)
                    this.synchronized = payload.port
                    this.dispatchEvent(new Event("READY"))
                    return
                } else {
                    console.log(payload)
                }
            return
        }
        const wasReady = this.hasMotorOne && this.hasMotorTwo
        if (payload.event == MSG_HUB_ATTACHED_IO_EVENT.ATTACHED) {
            if (payload.port == 0) this.hasMotorOne = true
            if (payload.port == 1) this.hasMotorTwo = true
        } else if (payload.event == MSG_HUB_ATTACHED_IO_EVENT.DETACHED) {
            if (payload.port == 0) this.hasMotorOne = false
            if (payload.port == 1) this.hasMotorTwo = false
        }
        const nowReady = this.hasMotorOne && this.hasMotorTwo
        if (!wasReady && nowReady) {
            console.log("setting up virtual IO")
            this.synchronizing = true
            this.writeMessage(Int8Array.of(HUB_ID, MESSAGE_TYPES.VIRTUAL_PORT_SETUP, 1, 0, 1))
        }
    }

    handleEvent(event: Event) {
        // console.log("Lego Driver handleEvent", typeof event, event)
        if (event.target == null) return
        const target: BluetoothRemoteGATTCharacteristic = event.target as BluetoothRemoteGATTCharacteristic
        if (target.value == null) return
        const value: DataView = target.value
        const msgType = value.getUint8(MESSAGE_OFFSETS.TYPE)
        if (msgType == MESSAGE_TYPES.HUB_ATTACHED_IO) {
            this.handleHubAttachedIO(parseMsgHubAttachedIO(value))
        } else if (msgType == MESSAGE_TYPES.PORT_OUTPUT_FEEDBACK)  {
            this.handlePortOutputFeedback(parseMsgPortOutputFeedback(value))
        } else {
            console.log(`0x${msgType.toString(16).padStart(2, '0')}`, value)
        }
    }
}