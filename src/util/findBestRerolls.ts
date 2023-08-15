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
    console.log(`INPUT\tAT: ${thresholdValue}\tBREAKS: ${breakValue}\t REROLLS: ${rerolls}`)

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
    const rerollCombos:Array<RerollDice> = []

    // Find each different combination of dice to reroll with available number of rerolls
    const redMax : number = redList.length
    const blackMax : number = blackList.length
    const whiteMax : number = whiteList.length

    // *r* counts rerolls being assigned to Red
    for (let r = 0; r <= rerolls; r++) {
        
        // If *r* exceeds available dice, not enough to use all rerolls: terminate current iteration
        if ( r > redMax ) continue

        // Check if more to allocate and proceed to next color (black)
        let remAfterRed = rerolls - r
        if (remAfterRed > 0 ) {
            // *b* counts rerolls being assigned to Black
            for ( let b = 0; b <= remAfterRed; b++ ) {
                // If *b* exceeds available dice, not enough to use all rerolls: terminate current iteration
                if ( b > blackMax ) continue

                // Check if more to allocate and proceed to next color (white)
                let w = remAfterRed - b

                // If *w* exceeds available dice, not enough to use all rerolls: terminate current iteration
                if ( w > whiteMax ) continue

                // Allocate reroll counts
                const newReroll:RerollDice = {
                    r: r,
                    b: b,
                    w: w
                }
                
                // Add to list of reroll combos to investigate
                rerollCombos.push(newReroll)                    
            }
        } else { 
            // Allocate reroll counts (only red are non-zero in this condition)
            const newReroll:RerollDice = {
                r: r,
                b: 0,
                w: 0
            }

            // Add to list of reroll combos to investigate
            rerollCombos.push(newReroll) 
        }
    }

    console.log("REROLLS AVAILBLE: "+rerolls)
    console.log("CALCULATED REROLL COMBOS:")
    console.log(rerollCombos)

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
        // Add full set of randomized faces for each rerolling Red die
        for (let i=0; i<redRerolls; i++) { redFaceSetList.push( RED_DIE.faces) }
 
        
        // Create list of static/randomized faces of Black dice
        // Start with list of dice faces that are not being rerolled, extracting just the face info from each die
        const indexToSliceBlack = (blackRerolls < blackList.length) ? blackRerolls - blackList.length : blackList.length
        const blackFaceSetList:Array<PowerDieFace[]> = blackList.slice( indexToSliceBlack ).map( die => [die.face])
        // Add full set of randomized faces for each rerolling black die
        for (let i=0; i<blackRerolls; i++) { blackFaceSetList.push( BLACK_DIE.faces) }


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
                for (let i=0; i<whiteRerolls; i++) { tempFaceSetList.push( WHITE_DIE.faces ) }
                whiteFaceSetListCombos.push( tempFaceSetList )
                indexCombinationList = [ whiteList.map( (e, i:number) => i) ]

            // If somewhere in between, need to find the possible combos of static/re-rolled faces
            } else {
                const {length} = whiteList
                const tempList : Array< Array<number> > = []

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

        // const whiteFaceSetList:Array<PowerDieFace[]> = whiteList.map( die => [die.face] )

        // Get list of just Red/Black Face Set Lists
        const inputRB:Array<PowerDieFace[]> = redFaceSetList.concat(blackFaceSetList)
        

        // If no White Face Set Lists, ignore and use only Red/Black
        if (whiteFaceSetListCombos.length === 0) {        
            console.log("CALLED")
            const outcomes = dieOutcomes(inputRB)
            const successPcnt = thresholdCheck(thresholdValue, breakValue, outcomes)

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
                const successPcnt = thresholdCheck(thresholdValue, breakValue, outcomes)
                
                // Compare to previous best and update if better
                if ( successPcnt > bestSuccessChance ) {
                    bestSuccessChance = successPcnt
                    bestSet = rerollSet
                    // console.log("WHITE DIE REROLL INFO")
                    // console.log(whiteFaceSetListCombos)
                    // console.log(whiteFaceSetListCombos.length)
                    // console.log(indexCombinationList)
                    // console.log(indexCombinationList.length)
                    bestWhiteIndexset = indexCombinationList[i]
                }
            }
        }
    }

    console.log("BEST RESULT: "+ bestSuccessChance)
    console.log(bestSet)


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

    // Add White dice ids starting from bottom of list
    for ( let i=0; i<bestWhiteIndexset.length; i++ ) {
        idsToReroll.push( whiteList[bestWhiteIndexset[i]].id )
        console.log("WHITE DIE PUSHED")
        console.log(whiteList[bestWhiteIndexset[i]].id)
    }

    
    // Make sure number of returned dice don't exceed available rerolls
    if ( idsToReroll.length > rerolls ) {
        // TODO: Add better error handling
        console.error("ERROR: Rerolls suggested exceed number available")
        console.error( `REROLLS: ${rerolls}` )
        console.error("ID LIST GIVEN:")
        console.error( idsToReroll )
        console.error( `LENGTH: ${idsToReroll.length}` )
        
    } 
    
    const finalResults = {
        success: bestSuccessChance,
        ids: idsToReroll
    }

    return finalResults
}
