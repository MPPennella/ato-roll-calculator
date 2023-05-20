import type {PowerDieFace} from "../types/PowerDie"

export default function averageResults ( outcomeList:Array<PowerDieFace>, breakValue:number ) : number|undefined {
    const numTerms:number = outcomeList.length

    // Average of zero terms is undefined
    if (numTerms === 0 ) return undefined

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