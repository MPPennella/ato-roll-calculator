import type {PowerDieFace} from "../types/"

// Returns the percentage of outcomes that meet or exceed the AT Threshold, factoring in the given number of breaks
export default function thresholdCheck ( thresholdValue:number, breakValue:number, outcomeList:Array<PowerDieFace>) : number {
    // SPECIAL CASE: if no outcome data passed, treat as being all zeroes and return 0% successful if postive AT value, or 100% if zero (can't fail against no resistance)
    if (outcomeList.length === 0 ) return (thresholdValue > 0) ? 0 : 100
    
    // Find how many outcomes are successful given AT/Break conditions
    let initVal = 0 // Initial value
    let numSuccesses = outcomeList.reduce( (totalSuccesses, currentFace) => {
        // Get Power and Potential values from current face
        const {power: pow, potential:pot} = currentFace

        // Generate extra Power for each Potential up to the amount of Breaks
        const extraPower = pot > breakValue ? breakValue : pot

        // Increase accumulator if total power is greater than or equal to target threshold
        return pow + extraPower >= thresholdValue ? totalSuccesses+1 : totalSuccesses
    }, initVal)

    // Divide successes by number of outcomes submitted to find percent successful
    const successPcnt = 100 * numSuccesses/outcomeList.length

    return successPcnt
}