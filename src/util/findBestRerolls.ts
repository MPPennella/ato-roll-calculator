// Function imports
import sortPowerDice from "./sortPowerDice"
import dieOutcomes from "./dieOutcomes"
import thresholdCheck from "./thresholdCheck"
// Type imports
import { DieInfo, PowerDieFace } from "../types/"
// Data import
import {RED_DIE, BLACK_DIE, WHITE_DIE} from '../data/PowerDiceData'


function filterDiceByColor( diceInfo:Array<DieInfo>, filterColor:string ) :Array<DieInfo>{
    return diceInfo.filter((die) => {
        return die.color === filterColor ? true : false
    })
}

// Finds which specific Power Dice are best to reroll in a given situation based on AT Threshold to hit, breaks available, rerolls available, and what faces were rolled on the dice
export default function findBestRerolls ( thresholdValue:number, breakValue:number, rerolls:number, diceInfo:Array<DieInfo> ) : Array<number> {
    const numDice = diceInfo.length
    console.log(`INPUT\tAT: ${thresholdValue}\tBREAKS: ${breakValue}`)

    // If no dice or no rerolls, then no further processing needed, and return empty array indicating no dice to reroll
    if (numDice === 0 || rerolls === 0) return []

    // Otherwise call recursive function to calculate best reroll targets
    const result = findBestRerollsRecur( thresholdValue, breakValue, rerolls, diceInfo )

    console.log("OVERALL BEST:")
    console.log(result.success.toFixed(3)+"%")
    console.log(result.ids)

    return result.ids
}

// Recursive function to find results
function findBestRerollsRecur ( thresholdValue:number, breakValue:number, rerolls:number, diceInfo:Array<DieInfo> ) : {success: number, ids: Array<number>} {
    // If no rerolls, just find chance of success as-is and return with no reroll targets
    if ( rerolls === 0 ) {
        
        const dieFaces = diceInfo.map(die => [die.face])
        const success = thresholdCheck( thresholdValue, breakValue, dieOutcomes(dieFaces))

        return {
            success: success,
            ids:[]
        }
    }

    const numDice = diceInfo.length

    // If more rerolls than dice, set rerolls to number of dice
    if ( rerolls > numDice ) rerolls = numDice
    
    // Find best single die to reroll
    // - Look at each color of die and find the worst face among them to limit search
    // - This works for Red/Black dice as dice of those colors have a series of progressively strictly-better faces, 
    // - However, White dice have some faces that are only conditionally better depending on usable breaks
    // Separate out lists of dice by color
    const redList : Array<DieInfo> = sortPowerDice(filterDiceByColor(diceInfo, "red"))
    const blackList : Array<DieInfo> = sortPowerDice(filterDiceByColor(diceInfo, "black"))
    const whiteList : Array<DieInfo> = filterDiceByColor(diceInfo, "white")
    // console.log("RED:")
    // console.log(redList)
    // console.log("BLACK:")
    // console.log(blackList)
    // console.log("WHITE:")
    // console.log(whiteList)

    // Choose best dice to reroll by trying different combinations of lowest dice from each color pool to reroll (for White all must be considered)

    // Holds the number each type of dice we want to reroll
    // r/b/w are short for Red/Black/White
    type RerollDice = {
        r: number,
        b: number,
        w: number
    }

    // Array to store the different combinations of rerolling dice we want to try
    let rerollCombos:Array<RerollDice> = []

    // Find each different combination of dice to reroll with available number of rerolls
    const redMax : number = redList.length
    const blackMax : number = blackList.length
    const whiteMax : number = whiteList.length

    for (let r = 0; r <= rerolls; r++) {
        let newReroll:RerollDice = { r:0, b:0, w:0 }
        
        // If r exceeds available dice, terminate iteration
        if ( r > redMax ) continue

        // Allocate *r* rerolls to Red
        newReroll.r = r

        // Check if more to allocate and proceed to next color (black)
        let remAfterRed = rerolls - r
        if (remAfterRed > 0 ) {
            for ( let b = 0; b <= remAfterRed; b++ ) {
                // If b exceeds available dice, terminate iteration
                if ( b > blackMax ) continue

                // Allocate *b* rerolls to Black
                newReroll.b = b

                // Check if more to allocate and proceed to next color (white)
                let remAfterBlack = remAfterRed - b
                if (remAfterBlack > 0 ) {                    
                    // If w exceeds available dice, terminate iteration
                    if ( remAfterBlack > whiteMax ) continue

                    // Allocate *w* rerolls to White
                    newReroll.w = remAfterBlack

                    rerollCombos.push(newReroll)
                    
                } else { rerollCombos.push(newReroll) }
            }
        } else { rerollCombos.push(newReroll) }
    }

    // console.log("REROLLS AVAILBLE: "+rerolls)
    // console.log("CALCULATED REROLL COMBOS:")
    // console.log(rerollCombos)

    // Check each combination to see how good the result is and compare

    // Make trackers for best success and what combination produced it
    let bestSuccessChance:number = 0
    let bestSet:RerollDice = {r:0, b:0, w:0}

    // Go through each eligible combination and test
    for ( const rerollSet of rerollCombos ) {
        const { r:redRerolls, b:blackRerolls, w:whiteRerolls } = rerollSet

        // Create list of static/randomized faces of Red dice
        // Start with list of dice faces that are not being rerolled, extracting just the face info from each die
        const indexToSliceRed = (redRerolls < redList.length) ? redRerolls - redList.length : redList.length
        const redFaceSetList:Array<PowerDieFace[]> = redList.slice( indexToSliceRed  ).map( die => [die.face])
        // Add full set of randomized faces for each rerolling Red die
        for (let i=0; i<redRerolls; i++) { redFaceSetList.push( RED_DIE.faces) }
 
        
        // Create list of static/randomized faces of Black dice
        // Start with list of dice faces that are not being rerolled, extracting just the face info from each die
        const indexToSliceBlack = (blackRerolls < blackList.length) ? blackRerolls - blackList.length : blackList.length
        const blackFaceSetList:Array<PowerDieFace[]> = blackList.slice( indexToSliceBlack ).map( die => [die.face])
        // Add full set of randomized faces for each rerolling black die
        for (let i=0; i<blackRerolls; i++) { blackFaceSetList.push( BLACK_DIE.faces) }

        // TODO: Implement later, for now treat as no White dice being rerolled
        const whiteFaceSetList:Array<PowerDieFace[]> = whiteList.map( die => [die.face] )

        // console.log("RED FACES")
        // console.log(redFaceSetList)
        // console.log("BLACK FACES")
        // console.log(blackFaceSetList)
        // console.log("WHITE FACES")
        // console.log(whiteFaceSetList)

        const input:Array<PowerDieFace[]> = redFaceSetList.concat(blackFaceSetList).concat(whiteFaceSetList)
        const outcomes = dieOutcomes(input)
        const successPcnt = thresholdCheck(thresholdValue, breakValue, outcomes)

        // console.log("REROLL TRIAL SUCCESS:")
        // console.log( successPcnt )

        // Compare to previous best and update if better
        if ( successPcnt > bestSuccessChance ) {
            bestSuccessChance = successPcnt
            bestSet = rerollSet
        }
    }

    console.log("BEST RESULT: "+ bestSuccessChance)
    console.log(bestSet)

    // IGNORE: Possibly fallacious approach, could not guarantee correct results with such an algorithm
    // Possibly able to refine in future
    // // Simulate rerolling worst of each color and compare results
    // // Best result is optimal reroll candidate, add it to list of dice to reroll
    // // If more rerolls and dice available, recursively find best rerolls among remaining dice
    // // - Remove the best dice to reroll from the list, then call on remaining list with n-1 rerolls

    // Recursively call with n-1 rerolls available and compare to check if better to reroll fewer dice
    // NOTE: Prioritizes the recursion result if returns equal chance of success
    const recurResults = findBestRerollsRecur( thresholdValue, breakValue, rerolls-1, diceInfo)
    if ( recurResults.success >= bestSuccessChance ) {
        // Return recursion results if equal or better
        return recurResults
    }

    // When not using the recusion result, build final return data

    // Use final results to determine IDs of best dice to reroll
    let idsToReroll:Array<number> = []

    // Add Red dice ids starting from bottom of list
    for ( let i=0; i<bestSet.r; i++ ) {
        idsToReroll.push( redList[i].id )
    }

    // Add Black dice ids starting from bottom of list
    for ( let i=0; i<bestSet.b; i++ ) {
        idsToReroll.push( blackList[i].id )
    }

    // TODO: Add White dice ids

    
    // Make sure number of returned dice don't exceed available rerolls
    if ( idsToReroll.length > rerolls ) {
        // TODO: Add better error handling
        console.error("ERROR: Rerolls suggested exceed number available")
    } 

    const finalResults = {
        success: bestSuccessChance,
        ids: idsToReroll
    }

    return finalResults
}
