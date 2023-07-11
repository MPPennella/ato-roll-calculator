import { DieInfo } from "../types/DieInfo";
import { PowerDieFace } from "../types/PowerDieFace";
import bubbleSort from "./bubblesort";

// Compares two faces, and returns
// - true : if first is greater
// - false : if second is greater or equal
// Only works for Red and Black dice, White can't be sorted this way
function compareFaces( dieA:DieInfo, dieB:DieInfo ) : Boolean {
    const {power:powA, potential:potA} = dieA.face
    const {power:powB, potential:potB} = dieB.face

    // If Power is higher, is always better regardless of potential
    if ( powA > powB ) {
        return true
    }
    // If Power is equal, tiebreaker goes to potential, only considered better if greater (not equal)
    if ( powA === powB && potA > potB ) {
        return true
    }
    return false
}

// Returns a sorted array in increasing value of the faces of the Power Dice provided
// WARNING: Can only work if all Power Dice are the same color, cross-color comparisons are invalid
// WARNING: Doesn't work with White Power Dice, only works with Red and Black Power Dice
// WARNING: In previous two cases, will return an unsorted list with logging when detected
export default function sortPowerDice ( diceToSort : Array<DieInfo> ) : Array<DieInfo> {
    // If one or fewer items in provided array, return the input as it is already sorted
    if (diceToSort.length <= 1 ) return diceToSort

    // Error-checking to make sure die types all match and exclude white dice, which are not currently sortable
    // Get color of first die to compare rest to
    const firstColor = diceToSort[0].color

    // First check for non-matching dice
    for ( const die of diceToSort ) {
        // If any die does not match with the first, not all dice are of same type and return unsorted list with logging
        if ( die.color !== firstColor ) {
            console.log("ERROR: Not all die colors matched initial color of "+firstColor)
            console.log("Returning unsorted list")
            return diceToSort
        }
    }

    // If all dice match, check if they are White
    if ( firstColor === "white" ) {
        console.log("ERROR: Contained White Power Dice which are unsortable at this time")
        console.log("Returning unsorted list")
        return diceToSort
    }
   
    // Now that we have ensured compliance, run the sort using info and our comparison function and return
    return bubbleSort( diceToSort, compareFaces )
}
