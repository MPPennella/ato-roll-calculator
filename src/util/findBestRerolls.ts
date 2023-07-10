// Function imports
import sortPowerDice from "./sortPowerDice"
import dieOutcomes from "./dieOutcomes"
import thresholdCheck from "./thresholdCheck"
// Type imports
import { DieInfo } from "../types/DieInfo"
import { PowerDieFace } from "../types/PowerDieFace"
// Data import
import {RED_DIE, BLACK_DIE, WHITE_DIE} from '../data/PowerDiceData'


function filterDiceByColor( diceInfo:Array<DieInfo>, filterColor:string ) :Array<DieInfo>{
    return diceInfo.filter((die) => {
        return die.color === filterColor ? true : false
    })
}

export default function findBestRerolls ( thresholdValue:number, breakValue:number, rerolls:number, diceInfo:Array<DieInfo> ) : Array<number> {
    const numDice = diceInfo.length

    // If no dice or no rerolls, then no further processing needed, and return empty array indicating no dice to reroll
    if (numDice === 0 || rerolls === 0) return []

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
    console.log("RED:")
    console.log(redList)
    console.log("BLACK:")
    console.log(blackList)
    console.log("WHITE:")
    console.log(whiteList)

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
    //TEST, assumption rerolls=3
    rerollCombos.push( {r:2,b:1,w:0} )
    rerollCombos.push( {r:1,b:2,w:0} )


    // Check each combination to see how good the result is and compare

    // Make trackers for best success and what combination produced it
    let bestSuccessChance:number = 0
    let bestSet:RerollDice = {r:0, b:0, w:0}

    // Go through each eligible combination and test
    for ( const rerollSet of rerollCombos ) {
        const { r:redRerolls, b:blackRerolls, w:whiteRerolls } = rerollSet

        // Create list of static/randomized faces of Red dice
        // Start with list of dice faces that are not being rerolled, extracting just the face info from each die
        const redFaceSetList:Array<PowerDieFace[]> = redList.slice( redRerolls - redList.length  ).map( die => [die.face])
        // Add full set of randomized faces for each rerolling Red die
        for (let i=0; i<redRerolls; i++) { redFaceSetList.push( RED_DIE.faces) }
 
        console.log("RED FACES")
        console.log(redFaceSetList)

        // Create list of static/randomized faces of Black dice
        // Start with list of dice faces that are not being rerolled, extracting just the face info from each die
        const blackFaceSetList:Array<PowerDieFace[]> = blackList.slice( (blackRerolls < blackList.length) ? blackRerolls - blackList.length : blackList.length ).map( die => [die.face])
        // Add full set of randomized faces for each rerolling black die
        for (let i=0; i<blackRerolls; i++) { blackFaceSetList.push( BLACK_DIE.faces) }

        console.log("BLACK FACES")
        console.log(blackFaceSetList)

        // TODO: Implement later, for now treat as no White dice
        const whiteFaceSetList:Array<PowerDieFace[]> = []

        const input:Array<PowerDieFace[]> = redFaceSetList.concat(blackFaceSetList).concat(whiteFaceSetList)
        const outcomes = dieOutcomes(input)
        const successPcnt = thresholdCheck(thresholdValue, breakValue, outcomes)

        console.log("REROLL TRIAL SUCCESS:")
        console.log( successPcnt )

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

    // Make sure number of returned dice don't exceed available rerolls

    // For testing purposes only
    const DUMMY_RETURN : Array<number> = [2,3,5]

    return DUMMY_RETURN
}