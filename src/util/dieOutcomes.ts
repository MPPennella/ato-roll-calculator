import { PowerDieFace } from "../types/PowerDieFace"

// const BLACK_DIE : PowerDie = {
//     sides: [
//         [0,1,1],
//         [1,1,0],
//         [2,0,1],
//         // [0,0,0], //unknown values for this side
//         [2,1,0],
//         [2,2,0],
//     ]
// }

// const WHITE_DIE : PowerDie = {
//     sides: [
//         [1,2,1],
//         // [0,0,0], //unknown values for this side
//         // [0,0,0], //unknown values for this side
//         // [0,0,0], //unknown values for this side
//         [1,3,0],
//         [3,2,1],
//     ]
// }

export default function dieOutcomes ( faceSetList:PowerDieFace[][]) : Array<PowerDieFace> {

    // SPECIAL CASE: If no data, return array with single outcome with all values zeroed
    if (faceSetList.length === 0) return [{power: 0, potential: 0, dot: 0}]

    // SPECIAL CASE: If only one set of faces, return that
    if (faceSetList.length === 1) return faceSetList[0]
    
    // Otherwise, determine outcomes
    let outcomeList:Array<PowerDieFace> = []
    
    // Pull last element off list
    let currFaceSet = faceSetList.pop()

    // Use recursion to get outcomes from remaining dice
    let otherOutcomes:Array<PowerDieFace> = [{power: 0, potential: 0, dot: 0}]
    if (faceSetList.length>0) otherOutcomes = dieOutcomes(faceSetList)    

    // Iterate over the current set of faces to add values to those of other outcomes
    if (currFaceSet !== undefined){
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
