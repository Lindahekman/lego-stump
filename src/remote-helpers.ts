import * as PIXI from "pixi.js"
import { HUB_COMMANDS } from "./stores/legohub"

export interface CarRemoteData {
    sprite: PIXI.Sprite
    gridPosition: [number, number]
    rotation: number
}

export const detectCommand = (clickPoint: PIXI.Point, car: CarRemoteData): HUB_COMMANDS | null => {
    if (car.rotation != car.sprite.angle) return null
    const carSprite = car.sprite
    const carBounds = carSprite.getBounds()
    let rotation = car.rotation
    while (rotation < 0) {
        rotation += 360
    }
    let forwardRect, backwardRect, leftRect, rightRect, hornRect, lightRect: PIXI.Rectangle
    if (rotation % 360 == 0) {
        forwardRect = new PIXI.Rectangle(
            carBounds.left + (forwardXRel * carBounds.width), 
            carBounds.top + (forwardYRel * carBounds.height),
            butWRel * carBounds.width, butHRel * carBounds.height)
        backwardRect = new PIXI.Rectangle(
            carBounds.left + (backwardXRel * carBounds.width),
            carBounds.top + (backwardYRel * carBounds.height),
            butWRel * carBounds.width, butHRel * carBounds.height)
        leftRect = new PIXI.Rectangle(
            carBounds.left + (leftXRel * carBounds.width),
            carBounds.top + (leftYRel * carBounds.height),
            butWRel * carBounds.width, butHRel * carBounds.height)
        rightRect = new PIXI.Rectangle(
            carBounds.left + (rightXRel * carBounds.width),
            carBounds.top + (rightYRel * carBounds.height),
            butWRel * carBounds.width, butHRel * carBounds.height)
        hornRect = new PIXI.Rectangle(
            carBounds.left + (hornXRel * carBounds.width),
            carBounds.top + (hornYRel * carBounds.height),
            smallButWRel * carBounds.width, smallButHRel * carBounds.height)
        lightRect = new PIXI.Rectangle(
            carBounds.left + (lightXRel * carBounds.width),
            carBounds.top + (lightYRel * carBounds.height),
            smallButWRel * carBounds.width, smallButHRel * carBounds.height)
    } else if (rotation % 360 == 90) { // measuring from bottom of car
        forwardRect = new PIXI.Rectangle(
            carBounds.left + carBounds.width - (forwardYRel * carBounds.width) - (butHRel * carBounds.width), 
            carBounds.top + (forwardXRel * carBounds.height),
            butHRel * carBounds.width, butWRel * carBounds.height)
        backwardRect = new PIXI.Rectangle(
            carBounds.left + carBounds.width - (backwardYRel * carBounds.width) - (butHRel * carBounds.width),
            carBounds.top + (backwardXRel * carBounds.height),
            butHRel * carBounds.width, butWRel * carBounds.height)
        leftRect = new PIXI.Rectangle(
            carBounds.left + carBounds.width - (leftYRel * carBounds.width) - (butHRel * carBounds.width),
            carBounds.top + (leftXRel * carBounds.height),
            butHRel * carBounds.width, butWRel * carBounds.height)
        rightRect = new PIXI.Rectangle(
            carBounds.left + carBounds.width - (rightYRel * carBounds.width) - (butHRel * carBounds.width),
            carBounds.top + (rightXRel * carBounds.height),
            butHRel * carBounds.width, butWRel * carBounds.height)
        hornRect = new PIXI.Rectangle(
            carBounds.left + carBounds.width - (hornYRel * carBounds.width) - (smallButHRel * carBounds.width),
            carBounds.top + (hornXRel * carBounds.height),
            smallButHRel * carBounds.width, smallButWRel * carBounds.height)
        lightRect = new PIXI.Rectangle(
            carBounds.left + carBounds.width - (lightYRel * carBounds.width) - (smallButHRel * carBounds.width),
            carBounds.top + (lightXRel * carBounds.height),
            smallButHRel * carBounds.width, smallButWRel * carBounds.height)
    } else if (rotation % 360 == 180) {
        forwardRect = new PIXI.Rectangle(
            carBounds.left + carBounds.width - (forwardXRel * carBounds.width) - (butWRel * carBounds.width), 
            carBounds.top + carBounds.height - (forwardYRel * carBounds.height) - (butHRel * carBounds.height),
            butWRel * carBounds.width, butHRel * carBounds.height)
        backwardRect = new PIXI.Rectangle(
            carBounds.left + carBounds.width - (backwardXRel * carBounds.width) - (butWRel * carBounds.width),
            carBounds.top + carBounds.height - (backwardYRel * carBounds.height) - (butHRel * carBounds.height),
            butWRel * carBounds.width, butHRel * carBounds.height)
        leftRect = new PIXI.Rectangle(
            carBounds.left + carBounds.width - (leftXRel * carBounds.width) - (butWRel * carBounds.width),
            carBounds.top + carBounds.height - (leftYRel * carBounds.height) - (butHRel * carBounds.height),
            butWRel * carBounds.width, butHRel * carBounds.height)
        rightRect = new PIXI.Rectangle(
            carBounds.left + carBounds.width - (rightXRel * carBounds.width) - (butWRel * carBounds.width),
            carBounds.top + carBounds.height - (rightYRel * carBounds.height) - (butHRel * carBounds.height),
            butWRel * carBounds.width, butHRel * carBounds.height)
        hornRect = new PIXI.Rectangle(
            carBounds.left + carBounds.width - (hornXRel * carBounds.width) - (smallButWRel * carBounds.width),
            carBounds.top + carBounds.height - (hornYRel * carBounds.height) - (smallButHRel * carBounds.height),
            smallButWRel * carBounds.width, smallButHRel * carBounds.height)
        lightRect = new PIXI.Rectangle(
            carBounds.left + carBounds.width - (lightXRel * carBounds.width) - (smallButWRel * carBounds.width),
            carBounds.top + carBounds.height - (lightYRel * carBounds.height) - (smallButHRel * carBounds.height),
            smallButWRel * carBounds.width, smallButHRel * carBounds.height)
    } else if (rotation % 360 == 270) {
        forwardRect = new PIXI.Rectangle(
            carBounds.left + (forwardYRel * carBounds.height), 
            carBounds.top + carBounds.height - (forwardXRel * carBounds.width) - (butHRel * carBounds.height),
            butWRel * carBounds.width, butHRel * carBounds.height)
        backwardRect = new PIXI.Rectangle(
            carBounds.left + (backwardYRel * carBounds.height),
            carBounds.top + carBounds.height - (backwardXRel * carBounds.width) - (butHRel * carBounds.height),
            butWRel * carBounds.width, butHRel * carBounds.height)
        leftRect = new PIXI.Rectangle(
            carBounds.left + (leftYRel * carBounds.height),
            carBounds.top + carBounds.height - (leftXRel * carBounds.width) - (butHRel * carBounds.height),
            butWRel * carBounds.width, butHRel * carBounds.height)
        rightRect = new PIXI.Rectangle(
            carBounds.left + (rightYRel * carBounds.height),
            carBounds.top + carBounds.height - (rightXRel * carBounds.width) - (butHRel * carBounds.height),
            butWRel * carBounds.width, butHRel * carBounds.height)
        hornRect = new PIXI.Rectangle(
            carBounds.left + (hornYRel * carBounds.height),
            carBounds.top + carBounds.height - (hornXRel * carBounds.width) - (smallButHRel * carBounds.height),
            smallButWRel * carBounds.width, smallButHRel * carBounds.height)
        lightRect = new PIXI.Rectangle(
            carBounds.left + (lightYRel * carBounds.height),
            carBounds.top + carBounds.height - (lightXRel * carBounds.width) - (smallButHRel * carBounds.height),
            smallButWRel * carBounds.width, smallButHRel * carBounds.height)
    } else {
        return null
    }
    /* console.log("click point", clickPoint)
    console.log("car bounds", carBounds)
    console.log("rotation", rotation)
    console.log("forward rect", forwardRect)
    console.log("backward rect", backwardRect)
    console.log("right rect", rightRect)
    console.log("left rect", leftRect) */
    if (forwardRect.contains(clickPoint.x, clickPoint.y)) {
        return HUB_COMMANDS.FORWARD
    } else if (backwardRect.contains(clickPoint.x, clickPoint.y)) {
        return HUB_COMMANDS.BACKWARD
    } else if (leftRect.contains(clickPoint.x, clickPoint.y)) {
        return HUB_COMMANDS.LEFT
    } else if (rightRect.contains(clickPoint.x, clickPoint.y)) {
        return HUB_COMMANDS.RIGHT
    } else if (hornRect.contains(clickPoint.x, clickPoint.y)) {
        return HUB_COMMANDS.HORN
    } else if (lightRect.contains(clickPoint.x, clickPoint.y)) {
        return HUB_COMMANDS.LIGHT
    }
    return null
}

/* const butWRel = 372 / 1287
const butHRel = 372 / 1515
const forwardXRel = 450 / 1287
const forwardYRel = 306 / 1515
const backwardXRel = 450 / 1287
const backwardYRel = 1034 / 1515
const leftXRel = 248 / 1287
const leftYRel = 678 / 1515
const rightXRel = 660 / 1287
const rightYRel = 678 / 1515 */

const butWRel = 296 / 1264
const butHRel = 296 / 1494
const forwardXRel = 480 / 1264
const forwardYRel = 284 / 1494
const backwardXRel = 480 / 1264
const backwardYRel = 872 / 1494
const leftXRel = 268 / 1264
const leftYRel = 584 / 1494
const rightXRel = 698 / 1264
const rightYRel = 584 / 1494
const smallButWRel = 206 / 1264
const smallButHRel = 206 / 1494
const hornXRel = 260 / 1264
const hornYRel = 1194 / 1494
const lightXRel = 806 / 1264
const lightYRel = 1194 / 1494