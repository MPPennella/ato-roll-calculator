import type {PowerDieTotal} from "../types/"
import calcPower from "./calcPower"

// Finds the average Power generated from the list of possible Face totals while factoring in the number of Breaks available
export default function averageResult ( outcomeList:Array<PowerDieTotal>, breakValue:number, hopeValue?:number ) : number {
    const numTerms:number = outcomeList.length

    // SPECIAL CASE: Average of zero terms will be set as zero
    if (numTerms === 0 ) return 0

    // Find total amount of power from adding all the possible outcomes
    // Initial value for sum
    const initVal = 0

    const totalPower:number = outcomeList.reduce( (totalPower:number, currentSummary:PowerDieTotal) => {
        // Add calculated Power from current Power summary to accumulated total Power
        return totalPower + calcPower(currentSummary, breakValue, hopeValue)
    }, initVal)

    // Divide total by number of terms to get average
    const average:number = totalPower/numTerms

    return average
}