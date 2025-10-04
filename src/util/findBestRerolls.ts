// Function imports
import sortPowerDice from "./sortPowerDice"
import dieOutcomes from "./dieOutcomes"
import thresholdCheck from "./thresholdCheck"
import makeBlacked from "./makeBlacked"
// Type imports
import { DieInfo, PowerDieFace } from "../types/"
// Data import
import {RED_DIE, BLACK_DIE, WHITE_DIE, MORTAL_DIE} from '../data/PowerDiceData'


// Type Definitions
type BestRerollReturn = {
    success: number,
    ids: {
        regular: Array<number>,
        blacked: Array<number>
    }
}

// Holds the number each type of dice we want to reroll
// r/b/w/m are short for Red/Black/White/Mortal
type RerollDice = {
    red: number,
    black: number,
    white: number,
    mortal: number
}

/**
 * Finds which specific Power Dice are best to reroll in a given situation based on AT Threshold to hit, breaks available, 
 * rerolls available, and what faces were rolled on the dice
 * 
 * @param thresholdValue Integer number of target AT threshold to hit
 * @param breakValue Integer number of Break Tokens available
 * @param hopeValue Integer number of Hope Tokens available
 * @param rerolls Integer number of Power Die rerolls available
 * @param blacks Integer number of Black Token rerolls available
 * @param diceInfo Array of DieInfo of dice/faces that are candidates for rerolls
 * @returns `{ success: number, ids: Array<number>}` Object with `success` (as percent) and `ids` containing array of id numbers of best set of dice to reroll
 */
export default function findBestRerolls ( thresholdValue:number, breakValue:number, hopeValue:number, rerolls:number, blacks:number, diceInfo:Array<DieInfo> ) : BestRerollReturn {
    const numDice = diceInfo.length
    
    // Check if already succeeding, if so no need to reroll
    const successCheck:boolean = ( 100 === thresholdCheck( thresholdValue, breakValue, dieOutcomes( diceInfo.map( (die)=>[die.face]) ), hopeValue ) )

    if ( successCheck ) return {success: 100, ids: {regular: [], blacked: []}}


    // If no dice or no rerolls, then no further processing needed, and return empty array indicating no dice to reroll
    if ( numDice === 0 || rerolls+blacks <= 0 ) return {success: 0, ids: {regular: [], blacked: []}}


    // Otherwise call recursive function to calculate best reroll targets
    const result = findBestRerollsRecur( thresholdValue, breakValue, hopeValue, rerolls, blacks, diceInfo )

    // console.log("OVERALL BEST:")
    // console.log(result.success.toFixed(3)+"%")
    // console.log(result.ids)

    return result
}

// Recursive function to find results
function findBestRerollsRecur ( thresholdValue:number, breakValue:number, hopeValue:number, rerolls:number, blacks:number, diceInfo:Array<DieInfo> ) : BestRerollReturn {
    // console.log("WITH REROLLS AVAILBLE: "+rerolls)
    let totalRerolls = rerolls+blacks
    // If no rerolls/blacks, just find chance of success as-is and return with no reroll targets
    if ( totalRerolls <= 0 ) {
        
        const dieFaces = diceInfo.map(die => [die.face])
        const success = thresholdCheck( thresholdValue, breakValue, dieOutcomes(dieFaces), hopeValue)

        return {
            success: success,
            ids:{regular: [], blacked: []}
        }
    }

    const numDice = diceInfo.length

    // If more rerolls than dice, set max rerolls to number of dice, and adjust reroll/blacks values to not exceed new cap, prioritizing removing regular rerolls
    // This prevents excessive iteration down the line
    if ( totalRerolls > numDice ) {
        totalRerolls = numDice
        if (blacks >= totalRerolls) {
            blacks = totalRerolls
            rerolls = 0
        } else {
            rerolls = totalRerolls - blacks
        }
    }
    
    // Find best single die to reroll
    // - Look at each color of die and find the worst face among them to limit search
    // - This works for Red/Black dice as dice of those colors have a series of progressively strictly-better faces, 
    // - However, White dice have some faces that are only conditionally better depending on usable breaks

    // Separate out lists of dice by color
    const redList : Array<DieInfo> = sortPowerDice(filterDiceByColor(diceInfo, "red"))
    const blackList : Array<DieInfo> = sortPowerDice(filterDiceByColor(diceInfo, "black"))
    const whiteList : Array<DieInfo> = filterDiceByColor(diceInfo, "white")
    const mortalList : Array<DieInfo> = filterDiceByColor(diceInfo, "mortal")

    // Create reference for maximum number of each color that could be rerolled
    const redMax : number = redList.length
    const blackMax : number = blackList.length
    const whiteMax : number = whiteList.length
    const mortalMax : number = mortalList.length
    
    // Choose best dice to reroll by trying different combinations of lowest dice from each color pool to reroll (for White all must be considered)
    
    // Find each different combination of dice to reroll with available number of rerolls
    const rerollCombos = generateRerollCombos(totalRerolls, redMax, blackMax, whiteMax, mortalMax)

    // Check each combination to see how good the result is and compare

    // Make trackers for best success and what combination produced it
    let bestSuccessChance:number = 0
    let bestSets = {
        regular:{red:0, black:0, white:0, mortal: 0},
        blacked:{red:0, black:0, white:0, mortal: 0} 
    }
    let bestWhiteIndexset : Array<number> = []

    // Go through each eligible combination and test
    for ( const rerollSet of rerollCombos ) {
        const { red:redRerolls, black:blackRerolls, white:whiteRerolls, mortal:mortalRerolls } = rerollSet

        // Find split of normal/blacked rerolls to use on the set of dice being rerolled. 
        // Black Tokens are always prioritized on dice in order Mortal = White > Black > Red due to higher-tier dice having a greater chance of rolling a face with >0 Potentials

        let regRerollSet:RerollDice = {red:0, black:0, white:0, mortal: 0}
        let blackedRerollSet:RerollDice = {red:0, black:0, white:0, mortal: 0}
        let remBlacks = blacks

        if (mortalRerolls > 0) {
            if (remBlacks >= mortalRerolls) {
                blackedRerollSet.mortal = mortalRerolls
                remBlacks -= mortalRerolls
            } else {
                regRerollSet.mortal = mortalRerolls - remBlacks
                blackedRerollSet.mortal = remBlacks
                remBlacks = 0
            }
        }
        if (whiteRerolls > 0) {
            if (remBlacks >= whiteRerolls) {
                blackedRerollSet.white = whiteRerolls
                remBlacks -= whiteRerolls
            } else {
                regRerollSet.white = whiteRerolls - remBlacks
                blackedRerollSet.white = remBlacks
                remBlacks = 0
            }
        }
        if (blackRerolls > 0) {
            if (remBlacks >= blackRerolls) {
                blackedRerollSet.black = blackRerolls
                remBlacks -= blackRerolls
            } else {
                regRerollSet.black = blackRerolls - remBlacks
                blackedRerollSet.black = remBlacks
                remBlacks = 0
            }
        }
        if (redRerolls > 0) {
            if (remBlacks >= redRerolls) {
                blackedRerollSet.red = redRerolls
            } else {
                regRerollSet.red = redRerolls - remBlacks
                blackedRerollSet.red = remBlacks
            }
        }

        // BLACK and RED face sets

        // Create list of static/randomized faces of Red dice
        // Start with list of dice faces that are not being rerolled, extracting just the face info from each die
        const indexToSliceRed = (redRerolls < redList.length) ? redRerolls - redList.length : redList.length
        const redFaceSetList:Array<PowerDieFace[]> = redList.slice( indexToSliceRed  ).map( die => [die.face])
        // Create list of static/randomized faces of Black dice
        // Start with list of dice faces that are not being rerolled, extracting just the face info from each die
        const indexToSliceBlack = (blackRerolls < blackList.length) ? blackRerolls - blackList.length : blackList.length
        const blackFaceSetList:Array<PowerDieFace[]> = blackList.slice( indexToSliceBlack ).map( die => [die.face])
        
        // Add appropriate sets of regular/blacked reroll faces for Red/Black dice that are being rerolled
        // RED
        for (let i=0; i<regRerollSet.red; i++) {
            redFaceSetList.push( RED_DIE.faces )
        }
        for (let i=0; i<blackedRerollSet.red; i++) {
            redFaceSetList.push( makeBlacked(RED_DIE.faces) )
        }

        // BLACK
        for (let i=0; i<regRerollSet.black; i++) {
            blackFaceSetList.push( BLACK_DIE.faces )
        }
        for (let i=0; i<blackedRerollSet.black; i++) {
            blackFaceSetList.push( makeBlacked(BLACK_DIE.faces) )
        }


        // WHITE face sets
        
        // As White Power Die faces can't be strictly ordered, need to find every combination of N faces to reroll and try them all
        let whiteFaceSetListCombos: Array< Array< PowerDieFace[] > >= []
        let indexCombinationList : Array< Array< number > > = []

        if (whiteList.length>0) {
            // If none are being rerolled, just give current faces
            if (whiteRerolls === 0) {
                whiteFaceSetListCombos.push( whiteList.map( die => [die.face] ) )
                indexCombinationList = [[]]

            // If all are being rerolled, fill list with randomized faces
            } else if ( whiteRerolls === whiteList.length ) {
                const tempFaceSetList = []
                // Push a number that are blacked based on the reroll set, the rest regular
                for (let i=0; i<whiteRerolls; i++) { tempFaceSetList.push( i<blackedRerollSet.white ? makeBlacked( WHITE_DIE.faces) : WHITE_DIE.faces ) }
                whiteFaceSetListCombos.push( tempFaceSetList )
                indexCombinationList = [ whiteList.map( (e, i:number) => i) ]

            // If somewhere in between, need to find the possible combos of static/re-rolled faces
            } else {
                
                // Recursive function to generate combinations of indices
                function findIndCombins ( startIndex:number, endIndex:number, choices:number ) : Array< Array<number> >  {
                    // ERROR CHECKING:
                    // If more to be choosen than indices available, give error
                    if ( choices > endIndex-startIndex+1 ) {
                        // TODO: Add better error handling
                        console.error("ERROR: More choices to be selected than number of indices available")
                    }

                    // SPECIAL CASES:

                    // If nothing to be chosen, list of indices is null set
                    if ( choices===0 ) {
                        return []
                    }

                    const indexArrays : Array< Array<number> > = []

                    // If just one to choose, sets are just an array of a single index, one for each index in range
                    if ( choices===1 ) {
                        for (let i=startIndex; i<=endIndex; i++) {
                            indexArrays.push( [i] )
                        }
                        return indexArrays
                    }

                    // If number to choose is equal to all the possible indices, is single set of all possible indices
                    if ( choices === endIndex-startIndex+1 ) {
                        let allIndices : Array<number> = []
                        for (let i=startIndex; i<=endIndex; i++) {
                            allIndices.push(i)                        
                        }
                        return [allIndices]

                    }

                    // STANDARD CASE:

                    // Iterate through all possible first digits to be chosen
                    // Iterate down from highest index, as will be appended to end of recursively found sequences
                    for (let i = endIndex; i >= startIndex+choices-1; i--) {

                        // Recursively find options for remaining part of combination
                        const recurList = findIndCombins( startIndex, i-1, choices-1)
                        
                        // Merge lists with first digit
                        recurList.forEach( (list:number[])=> {
                            list.push(i)
                            indexArrays.push(list)
                        })
                    }

                    return indexArrays
                }

                const {length: wLength} = whiteList
                
                // Find all the combinations of indices that will be rerolled
                indexCombinationList = findIndCombins(0, wLength-1, whiteRerolls)

                // Iterate through and create the Face Set Lists from the indices
                whiteFaceSetListCombos = indexCombinationList.map( (list:Array<number>) : Array<Array<PowerDieFace>> => {
                    const newFaceSetList : Array<Array<PowerDieFace>> = []
                    let count = 0
                    for ( let i=0; i<wLength; i++) {
                        if (list.includes(i) ) {
                            // Add a full set of faces if ID was on list, blacking them if available
                            newFaceSetList.push( (count < blackedRerollSet.white ) ? makeBlacked(WHITE_DIE.faces) : WHITE_DIE.faces )
                            count++
                        } else {
                            // Otherwise, add the existing face as the only option
                            newFaceSetList.push( [whiteList[i].face] )
                        }
                    }

                    return newFaceSetList
                })

            }
        }


        // MORTAL face sets
        // As Mortal Power Die faces can't be strictly ordered, need to find every combination of N faces to reroll and try them all
        // However, there should be at most one Mortal die
        // ******USING ASSUMPTION THAT ONLY 0 OR 1 MORTAL DIE EXISTS******

        const indexToSliceMortal = (mortalRerolls < mortalList.length) ? mortalRerolls - mortalList.length : mortalList.length
        const mortalFaceSetList:Array<PowerDieFace[]> = mortalList.slice( indexToSliceMortal  ).map( die => [die.face])
        // const mortalFaceSetList:  Array< PowerDieFace[] >= []
        for (let i=0; i<regRerollSet.mortal; i++) {
            mortalFaceSetList.push( MORTAL_DIE.faces )
        }
        for (let i=0; i<blackedRerollSet.mortal; i++) {
            mortalFaceSetList.push( makeBlacked(MORTAL_DIE.faces) )
        }


        // Get list of just Red/Black/Mortal Face Set Lists
        // ******USING ASSUMPTION THAT ONLY 0 OR 1 MORTAL DIE EXISTS******
        const inputRBM:Array<PowerDieFace[]> = redFaceSetList.concat(blackFaceSetList).concat(mortalFaceSetList)
        

        // If no White Face Set Lists, ignore and use only Red/Black/Mortal
        if (whiteFaceSetListCombos.length === 0) {  
            const outcomes = dieOutcomes(inputRBM)
            const successPcnt = thresholdCheck(thresholdValue, breakValue, outcomes, hopeValue)

            // Compare to previous best and update if better
            if ( successPcnt > bestSuccessChance ) {
                bestSuccessChance = successPcnt
                bestSets = {regular: regRerollSet, blacked: blackedRerollSet}
            }
        } else {
            // If White, then iterate through list of combinations
            for (let i=0; i<whiteFaceSetListCombos.length; i++) {
                const fullInput = inputRBM.concat( whiteFaceSetListCombos[i] )
                const outcomes = dieOutcomes(fullInput)
                const successPcnt = thresholdCheck(thresholdValue, breakValue, outcomes, hopeValue)
                
                // Compare to previous best and update if better
                if ( successPcnt > bestSuccessChance ) {
                    bestSuccessChance = successPcnt
                    bestSets = {regular: regRerollSet, blacked: blackedRerollSet}
                    bestWhiteIndexset = indexCombinationList[i]
                }
            }
        }
    }

    // console.log("BEST RESULT: "+ bestSuccessChance)
    // console.log(bestSet)


    // Recursively call with n-1 rerolls available and compare to check if better to reroll fewer dice
    // NOTE: Prioritizes the recursion result (i.e. rerolling fewer dice) if returns equal chance of success

    // Find rerolls for next iteration, prioritze removing a regular Power Reroll before Blacks
    const nextRerolls = rerolls > 0 ? (totalRerolls - blacks - 1) : 0
    const nextBlacks  = rerolls > 0 ? blacks                      : totalRerolls-1

    const recurResults = findBestRerollsRecur( thresholdValue, breakValue, hopeValue, nextRerolls, nextBlacks, diceInfo)
    if ( recurResults.success >= bestSuccessChance ) {
        // Return recursion results if equal or better
        return recurResults
    }



    // When not using the recusion result, build final return data

    // Use final results to determine IDs of best dice to reroll
    let idsToRerollRegular:Array<number> = []
    let idsToRerollBlacked:Array<number> = []

    if ( blacks > 0 ) {
        // Add Red dice ids starting from bottom of list
        for ( let i=0; i < (bestSets.regular.red+bestSets.blacked.red); i++ ) {
            i<bestSets.blacked.red ? idsToRerollBlacked.push( redList[i].id ) :  idsToRerollRegular.push( redList[i].id )
        }

        // Add Black dice ids starting from bottom of list
        for ( let i=0; i < (bestSets.regular.black+bestSets.blacked.black); i++ ) {
            i<bestSets.blacked.black ? idsToRerollBlacked.push( blackList[i].id ) : idsToRerollRegular.push( blackList[i].id )
        }

        // Add Mortal dice ids starting from bottom of list
        for ( let i=0; i < (bestSets.regular.mortal+bestSets.blacked.mortal); i++ ) {
            i<bestSets.blacked.mortal ? idsToRerollBlacked.push( mortalList[i].id ) :  idsToRerollRegular.push( mortalList[i].id )
        }

    } else {
        // Add Red dice ids starting from bottom of list
        for ( let i=0; i<bestSets.regular.red; i++ ) {
            idsToRerollRegular.push( redList[i].id )
        }

        // Add Black dice ids starting from bottom of list
        for ( let i=0; i<bestSets.regular.black; i++ ) {
            idsToRerollRegular.push( blackList[i].id )
        }

        // Add Mortal dice ids starting from bottom of list
        for ( let i=0; i<bestSets.regular.mortal; i++ ) {
            idsToRerollRegular.push( mortalList[i].id )
        }
    }

    // Add White dice ids starting from bottom of list
    for ( let i=0; i<bestWhiteIndexset.length; i++ ) {
        const typeToReroll = (i<bestSets.blacked.white) ? idsToRerollBlacked : idsToRerollRegular
        typeToReroll.push(  whiteList[bestWhiteIndexset[i]].id )
    }

    
    // Make sure number of returned dice don't exceed available rerolls
    if ( idsToRerollRegular.length + idsToRerollBlacked.length > totalRerolls ) {
        // TODO: Add better error handling
        console.error("ERROR: Rerolls suggested exceed number available")
        console.error( `REROLLS: ${rerolls}` )
        console.error( `BLACKS: ${blacks}` )
        console.error("ID LIST GIVEN:")
        console.error( idsToRerollRegular.concat(idsToRerollBlacked) )
        console.error( `LENGTH: ${idsToRerollRegular.length + idsToRerollBlacked.length}` )
        
    } 
    
    const finalResults:BestRerollReturn = {
        success: bestSuccessChance,
        ids: {
            regular: idsToRerollRegular, 
            blacked: idsToRerollBlacked
        }
    }

    return finalResults
}

// Simple function to find all DieInfo only for a particular color of die
function filterDiceByColor( diceInfo:Array<DieInfo>, filterColor:string ) :Array<DieInfo>{
    return diceInfo.filter((die) => {
        return die.color === filterColor ? true : false
    })
}


/**
 * Function to generate all possible combinations of dice types to reroll for a given number of rerolls 
 * and distribution of different colored dice available.
 * 
 * @param rerolls Integer, total number of rerolls to be allocated.
 * @param redMax Integer, maximum number of rerolls that can be allocated to red dice.
 * @param blackMax Integer, maximum number of rerolls that can be allocated to black dice.
 * @param whiteMax Integer, maximum number of rerolls that can be allocated to white dice.
 * @param mortalMax Integer, maximum number of rerolls that can be allocated to Mortal dice.
 * @returns Array<RerollDice>, each element is a different combination of values of dice to reroll.
 */
function generateRerollCombos( rerolls:number, redMax:number, blackMax:number, whiteMax:number, mortalMax:number) : Array<RerollDice> {
    // If enough rerolls to reroll all dice, simply return array with single RerollDice object with maxed values
    if ( rerolls >= (redMax+blackMax+whiteMax+mortalMax)) {
        return [{
            red: redMax,
            black: blackMax,
            white: whiteMax,
            mortal: mortalMax
        }]
    }

    // Array to store the different combinations of rerolling dice we want to try
    const rerollCombos:Array<RerollDice> = []

    // Iterate over number of Red Dice to reroll, capped at maximum number of total rerolls or maximum number of red dice available
    for (let redsToReroll = 0; redsToReroll <= rerolls && redsToReroll <= redMax; redsToReroll++) {  

        // Check if more to allocate and proceed to next color (black)
        let remAfterRed = rerolls - redsToReroll
        if ( !(remAfterRed > 0) ) {
            // No more rerolls to allocate, (only red are non-zero in this condition)
            const newReroll:RerollDice = {
                red: redsToReroll,
                black: 0,
                white: 0,
                mortal: 0
            }

            // Add to list of reroll combos to investigate
            rerollCombos.push(newReroll) 
        } else {
            // More rerolls to allocate, proceed to next color (black)
            // Iterate over number of Black Dice to reroll, capped at maximum number of remaining rerolls or maximum number of black dice available
            for ( let blacksToReroll = 0; blacksToReroll <= remAfterRed && blacksToReroll <= blackMax; blacksToReroll++ ) {

                let remAfterBlack = remAfterRed - blacksToReroll
                if ( !(remAfterBlack > 0) ) {
                    // No more rerolls to allocate, (only red and black are non-zero in this condition)
                    const newReroll:RerollDice = {
                        red: redsToReroll,
                        black: blacksToReroll,
                        white: 0,
                        mortal: 0
                    }

                    // Add to list of reroll combos to investigate
                    rerollCombos.push(newReroll) 
                } else {
                    // More rerolls to allocate, proceed to next color (white)
                    // Iterate over number of White Dice to reroll, capped at maximum number of remaining rerolls or maximum number of white dice available
                    for ( let whitesToReroll = 0; whitesToReroll <= remAfterBlack && whitesToReroll <= whiteMax; whitesToReroll++ ) {
                        let mortalsToReroll = remAfterBlack - whitesToReroll

                        // Stop iteration if not enough Mortal dice to use remaining rerolls
                        if ( mortalMax < mortalsToReroll ) continue

                        // Allocate reroll counts if valid result
                        const newReroll:RerollDice = {
                            red: redsToReroll,
                            black: blacksToReroll,
                            white: whitesToReroll,
                            mortal: mortalsToReroll
                        }
                        
                        // Add to list of reroll combos to investigate
                        rerollCombos.push(newReroll)     
                    }     
                }          
            }
        }
    }

    return rerollCombos
}