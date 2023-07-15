import { PowerDieTracker } from "../types/";
import bubbleSort from "./bubblesort";

// Compares two colors, and returns
// - true : if first is greater
// - false : if second is greater or equal
// Order of colors is "white" > "black" > "red"
function compareColors( trackerA:PowerDieTracker, trackerB:PowerDieTracker ) : Boolean {
    const colorA = trackerA.die.color
    const colorB = trackerB.die.color

    if ( colorA === "red" ) {
        // If A is Red, can't be greater than any option for B
        return false
    } else if ( colorB === "red" ) {
        // If B is Red, is less than remaining options for A
        return true
    } else if ( colorA === "black" ) {
        // Now if A is Black, can't be greater than any remaining option for B
        return false
    } else if ( colorB === "black" ) {
        // Now if B is Black, is less than remaining options for A
        return true
    } 
    // Only remaining option is both must be White if we reached here, which is equal, not greater
    return false
}

// Returns a sorted array in increasing value of color of the Power Dice provided
export default function sortDieColors ( diceToSort : Array<PowerDieTracker> ) : Array<PowerDieTracker> {
    // If one or fewer items in provided array, return the input as it is already sorted
    if (diceToSort.length <= 1 ) return diceToSort
    
    // Using a bubble sort, performance not an issue since lists are small
    return bubbleSort( diceToSort, compareColors )
}
