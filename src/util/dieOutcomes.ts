import { PowerDieFace, PowerDieTotal } from "../types/"

/**
 * Takes a list of the sets of faces from different dice being rolled together and creates a list of all possible outcome totals and returns that as an Array of PowerDieTotals.
 * 
 * @param faceSetList Array containing Arrays of PowerDieFaces. Each subarray represents a die to be combined with the others, and should contain the possible faces of that die (as PowerDieFaces).
 * @returns Array of PowerDieTotals with an entry for each possible combination of faces.
 */
export default function dieOutcomes ( faceSetList:Array< Array<PowerDieFace> > ) : Array<PowerDieTotal> {
    // Default is array with single zero-equivalent PowerDieFace object
    const defaultTotals : Array<PowerDieTotal> = [{power: 0, potential: 0, dot: 0}]

    // SPECIAL CASE: If no data, return array with single outcome with all values zeroed
    if (faceSetList.length === 0) return defaultTotals

    // SPECIAL CASE: If only one set of faces, return that, as each face is one of the outcome totals
    if (faceSetList.length === 1) return faceSetList[0] as Array<PowerDieTotal>
    
    // Otherwise, determine outcomes
    // Array for storing outcomes
    let outcomeList:Array<PowerDieTotal> = []
    
    // Pull last element off list
    let currFaceSet = faceSetList.pop()

    if (currFaceSet !== undefined){
        // Default is array with single zero-equivalent PowerDieFace object
        let otherOutcomes:Array<PowerDieTotal> = defaultTotals

        // Use recursion to get outcomes from remaining dice
        if (faceSetList.length>0) otherOutcomes = dieOutcomes(faceSetList)    

        // Iterate over the current set of faces to add values to those of other outcomes
        outcomeList = currFaceSet.map( (currFace:PowerDieFace) => {

            // Add values of current face to values of all other possible Face Totals
            let addedOutcomes:PowerDieTotal[] = otherOutcomes.map( (priorOutcome:PowerDieFace)=> {
                let newFaceTotal:PowerDieTotal = {
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
