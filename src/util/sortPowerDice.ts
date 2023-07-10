import { DieInfo } from "../types/DieInfo";
import { PowerDieFace } from "../types/PowerDieFace";

// Compares two faces, and returns
// - true : if first is greater
// - false : if second is greater or equal
// Only works for Red and Black dice, White can't be sorted this way
function compareFaces( faceA:PowerDieFace, faceB:PowerDieFace ) : Boolean {
    const {power:powA, potential:potA} = faceA
    const {power:powB, potential:potB} = faceB

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
// WARNING: Only works if all Power Dice are the same color
// WARNING: Doesn't work with White Power Dice, only works with Red and Black Power Dice
// WARNING: Currently doesn't error on previous two issues, and will return sensible-looking output
export default function sortPowerDice ( diceToSort : Array<DieInfo> ) : Array<DieInfo> {
    // If one or fewer items in provided array, return the input as it is already sorted
    if (diceToSort.length <= 1 ) return diceToSort

    // TODO: Should include error-checking to make sure die types all match and exclude white dice
    
    
    // Bubble sort algorithm
    let sortedArray = diceToSort
    let lastSwap:number
    
    // Create tracker for how far we need to check on each pass (progressively shrinks as passes bubble highest values to top)
    // First pass must check up through the final element of the array
    // Keep running as long as maxIndex is second element or greater
    // On subsequentpasses, only need to check up to the first element of the last swap that was made in previous pass, everything beyond must already be sorted
    for ( let maxIndex = diceToSort.length-1 ; maxIndex >= 1 ; maxIndex = lastSwap ) {
        // Track where last swap was, default 0 means no swaps, but also means only fist two elements were swapped - either way array is sorted
        lastSwap = 0

        // Create iterator for parsing array up to max index being considered on current pass
        for (let x = 0; x < maxIndex; x++ ) {
            // x is current index, y is next index
            let y = x+1

            // Compare and swap adjacent values that are not in lesser -> greater ordering        
            if ( compareFaces( sortedArray[x].face, sortedArray[y].face )) {
                let temp = sortedArray[x]
                sortedArray[x] = sortedArray[y]
                sortedArray[y] = temp
                // Update last index swapped at
                lastSwap = x
            }            
        }
    }

    return sortedArray
}
