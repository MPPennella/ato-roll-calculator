import type {PowerDieFace} from "../types/PowerDieFace"

// Finds the average Power generated from the list of possible Face totals while factoring in the number of Breaks available
export default function averageResult ( outcomeList:Array<PowerDieFace>, breakValue:number ) : number {
    const numTerms:number = outcomeList.length

    // Average of zero terms will be set as zero
    if (numTerms === 0 ) return 0

    let initVal = 0 // Initial value
    let totalPower:number = outcomeList.reduce( (totalPower:number, currentFace:PowerDieFace) => {
        // Get Power and Potential values from current face
        let {power: pow, potential:pot} = currentFace
        let extraPower = pot > breakValue ? breakValue : pot
        return totalPower + pow + extraPower
    }, initVal)

    let average:number = totalPower/numTerms

    console.log(average)

    return average
}