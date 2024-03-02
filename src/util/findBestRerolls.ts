// Function imports
import sortPowerDice from "./sortPowerDice"
import dieOutcomes from "./dieOutcomes"
import thresholdCheck from "./thresholdCheck"
import makeBlacked from "./makeBlacked"
// Type imports
import { DieInfo, PowerDieFace } from "../types/"
// Data import
import {RED_DIE, BLACK_DIE, WHITE_DIE} from '../data/PowerDiceData'


// Type Definitions
type BestRerollReturn = {
    success: number,
    ids: {
        regular: Array<number>,
        blacked: Array<number>
    }
}

// Holds the number each type of dice we want to reroll
// r/b/w are short for Red/Black/White
type RerollDice = {
    r: number,
    b: number,
    w: number
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

    // If more rerolls than dice, set rerolls to number of dice
    if ( totalRerolls > numDice ) totalRerolls = numDice
    
    // Find best single die to reroll
    // - Look at each color of die and find the worst face among them to limit search
    // - This works for Red/Black dice as dice of those colors have a series of progressively strictly-better faces, 
    // - However, White dice have some faces that are only conditionally better depending on usable breaks

    // Separate out lists of dice by color
    const redList : Array<DieInfo> = sortPowerDice(filterDiceByColor(diceInfo, "red"))
    const blackList : Array<DieInfo> = sortPowerDice(filterDiceByColor(diceInfo, "black"))
    const whiteList : Array<DieInfo> = filterDiceByColor(diceInfo, "white")

    // Create reference for maximum number of each color that could be rerolled
    const redMax : number = redList.length
    const blackMax : number = blackList.length
    const whiteMax : number = whiteList.length
    
    // Choose best dice to reroll by trying different combinations of lowest dice from each color pool to reroll (for White all must be considered)
    
    // Find each different combination of dice to reroll with available number of rerolls
    const rerollCombos = generateRerollCombos(totalRerolls, redMax, blackMax, whiteMax)

    // Check each combination to see how good the result is and compare

    // Make trackers for best success and what combination produced it
    let bestSuccessChance:number = 0
    let bestSet:RerollDice = {r:0, b:0, w:0}
    let bestWhiteIndexset : Array<number> = []

    // Go through each eligible combination and test
    for ( const rerollSet of rerollCombos ) {
        const { r:redRerolls, b:blackRerolls, w:whiteRerolls } = rerollSet

        // BLACK and RED face sets

        // Create list of static/randomized faces of Red dice
        // Start with list of dice faces that are not being rerolled, extracting just the face info from each die
        const indexToSliceRed = (redRerolls < redList.length) ? redRerolls - redList.length : redList.length
        const redFaceSetList:Array<PowerDieFace[]> = redList.slice( indexToSliceRed  ).map( die => [die.face])
        // Create list of static/randomized faces of Black dice
        // Start with list of dice faces that are not being rerolled, extracting just the face info from each die
        const indexToSliceBlack = (blackRerolls < blackList.length) ? blackRerolls - blackList.length : blackList.length
        const blackFaceSetList:Array<PowerDieFace[]> = blackList.slice( indexToSliceBlack ).map( die => [die.face])
        
        // Simpler case where have all of one type of Token or more enough Blacks to cover all dice
        if ( !(rerolls > 0 && blacks > 0) || blacks >= redRerolls+blackRerolls ) {
            // Add full set of randomized faces for each rerolling Red die
            for (let i=0; i<redRerolls; i++) { 
                redFaceSetList.push( blacks>0 ? makeBlacked(RED_DIE.faces) : RED_DIE.faces )
            }
    
            
            // Add full set of randomized faces for each rerolling black die
            for (let i=0; i<blackRerolls; i++) {
                blackFaceSetList.push( blacks>0 ? makeBlacked(BLACK_DIE.faces) :BLACK_DIE.faces)
            }
        // More complex case with both types of tokens
        } else {
            // TODO: Implement for case of mixed rerolls
            const leftovers = redRerolls + blackRerolls - blacks
            for ( let i = 0; i<= leftovers; i++ ) {
                const rbl = redRerolls - i
                const bbl = blackRerolls - (leftovers - i)

                console.log("----")
                console.log(`INITIAL: Red ${redRerolls}   Blk ${blackRerolls}`)
                console.log(`RED:   Reg ${redRerolls-rbl}   Blk ${rbl}`)
                console.log(`BLACK: Reg ${blackRerolls-bbl}   Blk ${bbl}`)
            }

        }

        // WHITE face sets
        // TODO: Implement Black Tokens for White dice

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
                for (let i=0; i<whiteRerolls; i++) { tempFaceSetList.push( WHITE_DIE.faces ) }
                whiteFaceSetListCombos.push( tempFaceSetList )
                indexCombinationList = [ whiteList.map( (e, i:number) => i) ]

            // If somewhere in between, need to find the possible combos of static/re-rolled faces
            } else {
                const {length} = whiteList
                
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

                // Find all the combinations of indices that will be rerolled
                indexCombinationList = findIndCombins(0, length-1, whiteRerolls)

                // Iterate through and create the Face Set Lists from the indices
                whiteFaceSetListCombos = indexCombinationList.map( (list:Array<number>) : Array<Array<PowerDieFace>> => {
                    const newFaceSetList : Array<Array<PowerDieFace>> = []
                    for ( let i=0; i<whiteList.length; i++) {
                        if (list.includes(i) ) {
                            newFaceSetList.push( WHITE_DIE.faces )
                        } else {
                            newFaceSetList.push( [whiteList[i].face] )
                        }
                    }

                    return newFaceSetList
                })

            }
        }

        // Get list of just Red/Black Face Set Lists
        const inputRB:Array<PowerDieFace[]> = redFaceSetList.concat(blackFaceSetList)
        

        // If no White Face Set Lists, ignore and use only Red/Black
        if (whiteFaceSetListCombos.length === 0) {  
            const outcomes = dieOutcomes(inputRB)
            const successPcnt = thresholdCheck(thresholdValue, breakValue, outcomes, hopeValue)

            // Compare to previous best and update if better
            if ( successPcnt > bestSuccessChance ) {
                bestSuccessChance = successPcnt
                bestSet = rerollSet
            }
        } else {
            // If White, then iterate through list of combinations
            for (let i=0; i<whiteFaceSetListCombos.length; i++) {
                const fullInput = inputRB.concat( whiteFaceSetListCombos[i] )
                const outcomes = dieOutcomes(fullInput)
                const successPcnt = thresholdCheck(thresholdValue, breakValue, outcomes, hopeValue)
                
                // Compare to previous best and update if better
                if ( successPcnt > bestSuccessChance ) {
                    bestSuccessChance = successPcnt
                    bestSet = rerollSet
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
        for ( let i=0; i<bestSet.r; i++ ) {
            idsToRerollBlacked.push( redList[i].id )
        }

        // Add Black dice ids starting from bottom of list
        for ( let i=0; i<bestSet.b; i++ ) {
            idsToRerollBlacked.push( blackList[i].id )
        }
    } else {
        // Add Red dice ids starting from bottom of list
        for ( let i=0; i<bestSet.r; i++ ) {
            idsToRerollRegular.push( redList[i].id )
        }

        // Add Black dice ids starting from bottom of list
        for ( let i=0; i<bestSet.b; i++ ) {
            idsToRerollRegular.push( blackList[i].id )
        }
    }

    // TODO: Make White dice recognize Black Tokens
    // Add White dice ids starting from bottom of list
    for ( let i=0; i<bestWhiteIndexset.length; i++ ) {
        idsToRerollRegular.push( whiteList[bestWhiteIndexset[i]].id )
    }

    
    // Make sure number of returned dice don't exceed available rerolls
    if ( idsToRerollRegular.length > totalRerolls ) {
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
 * @returns Array<RerollDice>, each element is a different combination of values of dice to reroll.
 */
function generateRerollCombos( rerolls:number, redMax:number, blackMax:number, whiteMax:number) : Array<RerollDice> {
    // Array to store the different combinations of rerolling dice we want to try
    const rerollCombos:Array<RerollDice> = []

    // *r* counts rerolls being assigned to Red
    for (let redsToReroll = 0; redsToReroll <= rerolls; redsToReroll++) {
        
        // If *r* exceeds available dice, not enough to use all rerolls: terminate current iteration
        if ( redsToReroll > redMax ) continue

        // Check if more to allocate and proceed to next color (black)
        let remAfterRed = rerolls - redsToReroll
        if (remAfterRed > 0 ) {
            // *b* counts rerolls being assigned to Black
            for ( let blacksToReroll = 0; blacksToReroll <= remAfterRed; blacksToReroll++ ) {
                // If *b* exceeds available dice, not enough to use all rerolls: terminate current iteration
                if ( blacksToReroll > blackMax ) continue

                // Check if more to allocate and proceed to next color (white)
                let whitesToReroll = remAfterRed - blacksToReroll

                // If *w* exceeds available dice, not enough to use all rerolls: terminate current iteration
                if ( whitesToReroll > whiteMax ) continue

                // Allocate reroll counts
                const newReroll:RerollDice = {
                    r: redsToReroll,
                    b: blacksToReroll,
                    w: whitesToReroll
                }
                
                // Add to list of reroll combos to investigate
                rerollCombos.push(newReroll)                    
            }
        } else { 
            // Allocate reroll counts (only red are non-zero in this condition)
            const newReroll:RerollDice = {
                r: redsToReroll,
                b: 0,
                w: 0
            }

            // Add to list of reroll combos to investigate
            rerollCombos.push(newReroll) 
        }
    }

    return rerollCombos
}