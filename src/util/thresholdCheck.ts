import type {PowerDieTotal} from "../types/"
import calcPower from "./calcPower"


/**
 * Returns the percentage of outcomes that meet or exceed the AT Threshold, factoring in the given number of breaks
 * 
 * @param thresholdValue Integer, target AT value that must be met or exceeded for success.
 * @param breakValue Integer, number of Break/Fire tokens available.
 * @param outcomeList Array of PowerDieTotals, representing the different possibilities to check.
 * @param hopeValue Optional parameter. Integer, number of Hope tokens available.
 * @returns 
 */
export default function thresholdCheck ( thresholdValue:number, breakValue:number, outcomeList:Array<PowerDieTotal>, hopeValue:number) : number {
    // SPECIAL CASE: if no outcome data passed, treat as being all zeroes and return 0% successful if postive AT value, or 100% if zero (can't fail against no resistance)
    if (outcomeList.length === 0 ) return (thresholdValue > 0) ? 0 : 100
    
    // Find how many outcomes are successful given AT/Break conditions
    let initVal = 0 // Initial value
    let numSuccesses = outcomeList.reduce( (totalSuccesses, currentTotal) => {
        // Increase accumulator if total power is greater than or equal to target threshold
        return calcPower(currentTotal, breakValue, hopeValue) >= thresholdValue ? totalSuccesses+1 : totalSuccesses
    }, initVal)

    // Divide successes by number of outcomes submitted to find percent successful
    const successPcnt = 100 * numSuccesses/outcomeList.length

    return successPcnt
}