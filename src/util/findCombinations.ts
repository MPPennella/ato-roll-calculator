import factorial from './factorial'
import findBestRerolls from './findBestRerolls'
// Data and types
import { DieInfo, PowerDieTracker } from '../types'
import { RED_DIE, BLACK_DIE, WHITE_DIE, MORTAL_DIE } from '../data/PowerDiceData';


type CombinationMap = {
    combination: Array<number>,
    weight: number
}

/**
 * Finds all possible (unique) combinations of die faces from the die objects passed and the weights of occurence of each
 * 
 * @param atThreshold Integer number of target AT threshold to hit
 * @param breaks Integer number of Break Tokens available
 * @param rerolls Integer number of Power Die rerolls available
 * @param blacks Integer number of Black Token rerolls available
 * @param diceTrackRef Array containing the die objects
 * @return Percentage chance of succeeding after rerolls with given paramters
 */
// Find all *unique* combinations of faces, then weight them by appearance and run reroll check only on unique combinations
//
// Worst case ~O(n^15) [polynomial] if a mix of all three colors of dice are used
// Best case O(n^5) [polynomial] if only a single color of dice is used
// 
// Theoretical worst case ~O(n^13) [polynomial] when a mix of all three colors of dice are used, pending implementation of duplicate-face accounting
// Theoretical best  case O(n^4) [polynomial] if using only Red or only Black dice, pending implementation of duplicate-face accounting
export default function findCombinations (atThreshold:number, breaks:number, rerolls:number, blacks:number, diceTrackRef : Array< PowerDieTracker >, hopeValue:number) : number {
    
    // Extract relevant info for dice
    const diceList = diceTrackRef.map( (dieTracker) => {
        return {
            id: dieTracker.id, 
            color: dieTracker.die.color, 
        }
    })

    // Find count of each color of die
    const redCount:number = diceList.filter((die) =>  die.color === "red" ? true : false ).length
    const blackCount:number = diceList.filter((die) =>  die.color === "black" ? true : false ).length
    const whiteCount:number = diceList.filter((die) =>  die.color === "white" ? true : false ).length
    const mortalCount:number = diceList.filter((die) => die.color === "mortal" ? true : false ).length
    
    // Find unique combinations and weight of each combination

    // All dice are six-sided
    const DIE_SIDES = 6

    const totalWeight = Math.pow(DIE_SIDES, redCount) * Math.pow(DIE_SIDES, blackCount) * Math.pow(DIE_SIDES, whiteCount) * Math.pow(DIE_SIDES, mortalCount)
    
    // Generate lists separately for each color of die
    const redList : CombinationMap[] = generateCombinationList(redCount)
    const blackList : CombinationMap[] = generateCombinationList(blackCount)
    const whiteList : CombinationMap[] = generateCombinationList(whiteCount)
    const mortalList : CombinationMap[] = generateCombinationList(mortalCount)

    
    let weightSum:number = redList.reduce( (p,cur) => p + cur.weight, 0) 
        * blackList.reduce( (p,cur) => p + cur.weight, 0) 
        * whiteList.reduce( (p,cur) => p + cur.weight, 0)
        * mortalList.reduce( (p,cur) => p + cur.weight, 0)
   
    // Then combine lists together to create master list, then turn list of die combinations and weights into chance of succeeding with rerolls

    const weightedChanceList : Array<number> = []

    for (let rMap of redList) {
        const rDice:Array<DieInfo> = rMap.combination.map( (number, i) => {
            return {
                id: i,
                color: "red",
                face: RED_DIE.faces[number]
            }
        })

        for (let bMap of blackList) {
            const bDice:Array<DieInfo> = bMap.combination.map( (number, j) => {
                return {
                    id: j+10000,
                    color: "black",
                    face: BLACK_DIE.faces[number]
                }
            })
    

            for (let wMap of whiteList) {

                const wDice:Array<DieInfo> = wMap.combination.map( (number, k) => {
                    return {
                        id: k+100000000,
                        color: "white",
                        face: WHITE_DIE.faces[number]
                    }
                })
                

                for (let mMap of mortalList) {

                    const mDice:Array<DieInfo> = mMap.combination.map( (number, l) => {
                        return {
                            id: l+1000000000000,
                            color: "mortal",
                            face: MORTAL_DIE.faces[number]
                        }
                    })
                    

                    weightedChanceList.push( findBestRerolls(atThreshold, breaks, hopeValue, rerolls, blacks, rDice.concat(bDice).concat(wDice).concat(mDice) ).success * (rMap.weight*bMap.weight*wMap.weight*mMap.weight ) )

                }

            }
        }
    }

    // Find average of chance of success
    const rrResult = weightedChanceList.reduce( (acc,val) => acc+val, 0) / totalWeight

    console.log("------------")
    console.log(`COMBINATIONS: ${ redList.length*blackList.length*whiteList.length*mortalList.length }`)
    console.log(`WEIGHT SUM: ${weightSum}`)
    // console.log(`THEORETICAL WEIGHT: ${totalWeight}`)  
    console.log(`WEIGHTED AVG: ${ rrResult}`)
    console.log("------------")

    return rrResult
}

/**
 * For a given number of dice, generates all the possible combinations of faces of those dice and the weight of those combinations appearing when rolled
 * 
 * @param dieCount Integer number of dice of the same color
 * @param color Optional: accepts strings `"red"`, `"black"`, `"white"`, and `"mortal"`. Used to speed up processing of dice with repeated faces (not yet implemented)
 * @returns `CombinationMap[]` with each map object containing a unique combination and the weight of that combination's appearance.
 */
function generateCombinationList(dieCount:number, color?:string) : Array<CombinationMap> {
	// Start with Red dice combinations
	    
    let combinList : Array<CombinationMap> = [] as Array<CombinationMap>

    // Min and Max values to combine
    // Die faces are indexed from 0 to 5
    let minVal:number = 0
    const maxVal = 5

    // Initialize with array of length equal to die count with all minimized faces
    let currentCombination:Array<number> = []
    
    for (let i=0; i<dieCount; i++) {
        currentCombination[i] = minVal
    }
    const maxIndex = currentCombination.length - 1
    addCombination([...currentCombination])

    
    // Stop when last value is maxed - that means whole array is maxed and all combinations are found
    while (currentCombination[maxIndex] < maxVal) {
    
        // Increment the value in the first index until it reaches max
        for (let v=minVal+1; v<=maxVal; v++) {
            currentCombination[0] = v
            addCombination([...currentCombination])
            
            // When value reaches max, find first non-maxed index, increment it, then set all preceding indices to that new value
            if ( v === maxVal ) {
                for (let i=1; i<= maxIndex; i++) {
                    if (currentCombination[i] < maxVal ) {
                    minVal = currentCombination[i] + 1

                    for (let j=0; j<=i; j++) {
                        currentCombination[j]=minVal
                    }

                    addCombination([...currentCombination])
                    
                    // If didn't max out value, break out to go back to incrementing first index
                    // Otherwise, need to go another iteration to find next low value
                    if (minVal !== maxVal) break
                    }
                }
            }
        }     
    }

    return combinList



    /**
     * Function to find correct weighting for a particular combination and the resulting `CombinationMap` to the `combinList` array
     * 
     * @param combiToAdd Array containing a specific combination to be added
     */
     function addCombination( combiToAdd:Array<number>):void {
        const size = combiToAdd.length
        const maxIndex = size-1

        // Find weight
        // If not the same, must calculate the weight
        // For set of length n, weight is
        //
        // n! / ( c_1! * c_2! * ... * c_x!)
        //
        // Where each c value is the count of a different repeated digit
        //
        // Example: 
        // [1,1,3,4,4,4,5]
        // n=7, c_1 = 2, c_3 = 1, c_4 = 3, c_5 = 1
        // weight = 7! / (2!*1!*3!*1!) = 5040 / 12 = 420
        // 
        // If all digits are different, simplifies to:  n!  ( n! / (1! * ... * 1!) )
        // If all digts are the same, simplifies to:    1   ( n! / n! )
        
        let weight:number = 1

        // All numbers are same if first and last values in array are same, in that case weight is 1
        if (combiToAdd[0] !== combiToAdd[maxIndex]) {
            let dupeCount:number = 1
            const dupes:Array<number> = []

            // Push values of each count of repeated digits to array
            for (let i = 1; i<combiToAdd.length; i++) {
                // As digits will be ordered, only need to detect changes of digits from previous index
                if ( combiToAdd[i] === combiToAdd[i-1]) {
                    dupeCount++
                    // Push any counted dupes on last iteration
                    if ( i === (maxIndex) ) {
                    dupes.push(dupeCount)
                    }
                } else {
                    // If current index doesn't match last one, push count of last set of dupes and reset counter
                    dupes.push(dupeCount)
                    dupeCount = 1
                }
            }

            // 
            weight = factorial(size)
            for ( let count of dupes ) {
                weight /= factorial(count)
            }
            
        }

        const newCombi:CombinationMap = {
            combination: combiToAdd,
            weight: weight
        }
        combinList.push(newCombi)
    }

}