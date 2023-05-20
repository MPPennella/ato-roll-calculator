import { PowerDieFace } from "../types/PowerDieFace"

export default function dieOutcomes ( faceSetList:PowerDieFace[][]) : Array<PowerDieFace> {

    // SPECIAL CASE: If no data, return array with single outcome with all values zeroed
    if (faceSetList.length === 0) return [{power: 0, potential: 0, dot: 0}]

    // SPECIAL CASE: If only one set of faces, return that
    if (faceSetList.length === 1) return faceSetList[0]
    
    // Otherwise, determine outcomes
    // Array for storing outcomes
    let outcomeList:Array<PowerDieFace> = []
    
    // Pull last element off list
    let currFaceSet = faceSetList.pop()

    if (currFaceSet !== undefined){
        // Default is array with single zero-equivalent PowerDieFace object
        let otherOutcomes:Array<PowerDieFace> = [{power: 0, potential: 0, dot: 0}]

        // Use recursion to get outcomes from remaining dice
        if (faceSetList.length>0) otherOutcomes = dieOutcomes(faceSetList)    

        // Iterate over the current set of faces to add values to those of other outcomes
        outcomeList = currFaceSet.map( (currFace:PowerDieFace) => {

            // Add values of current face to values of all other possible Face Totals
            let addedOutcomes:PowerDieFace[] = otherOutcomes.map( (priorOutcome:PowerDieFace)=> {
                let newFaceTotal:PowerDieFace = {
                    power:     priorOutcome.power     + currFace.power,
                    potential: priorOutcome.potential + currFace.potential,
                    dot:       priorOutcome.dot       + currFace.dot
                }
                return newFaceTotal
            })
            
            return addedOutcomes
        // Flatten to get flat array of outcomes
        }).flat()
    }

    return outcomeList
}
