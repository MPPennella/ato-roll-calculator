import type {PowerDieFace} from "../types/PowerDieFace"

// Returns the percentage of outcomes that meet or exceed the AT Threshold, factoring in the given number of breaks
export default function thresholdCheck ( thresholdValue:number, breakValue:number, outcomeList:Array<PowerDieFace>) : number {
    // Prototype code for determining how many outcomes meet a target threshold

    let initVal = 0 // Initial value
    let numSuccesses = outcomeList.reduce( (totalSuccesses, currentFace) => {
        // Get Power and Potential values from current face
        let {power: pow, potential:pot} = currentFace

        // Generate extra Power for each Potential up to the amount of Breaks
        let extraPower = pot > breakValue ? breakValue : pot

        // Increase accumulator if total power is greater than or equal to target threshold
        return pow + extraPower >= thresholdValue ? totalSuccesses+1 : totalSuccesses
    }, initVal)

    let successPcnt = 100 * numSuccesses/outcomeList.length

    return successPcnt
}