import factorial from './factorial'
import findBestRerolls from './findBestRerolls'
// Data and types
import { DieInfo, PowerDieTracker } from '../types'
import { RED_DIE, BLACK_DIE, WHITE_DIE } from '../data/PowerDiceData';


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
 * @param diceTrackRef Array containing the die objects
 * @return Percentage chance of succeeding after rerolls with given paramters
 */
// Find all *unique* combinations of faces, then weight them by appearance and run reroll check only on unique combinations
//
// Worst case ~O(n^13), best O(n^4) [polynomial]
export default function findCombinations (atThreshold:number, breaks:number, rerolls:number, diceTrackRef : Array< PowerDieTracker >) : number {
    const diceList = diceTrackRef.map( (dieTracker) => {
        return {
            id: dieTracker.id, 
            color: dieTracker.die.color, 
            // faces: dieTracker.die.faces 
        }
    })

    // Find count of each color of die
    const redCount:number = diceList.filter((die) =>  die.color === "red" ? true : false ).length
    const blackCount:number = diceList.filter((die) =>  die.color === "black" ? true : false ).length
    const whiteCount:number = diceList.filter((die) =>  die.color === "white" ? true : false ).length
    
    // Find unique combinations and weight of each combination

    // Start with Red dice combinations
    const DIE_SIDES = 6
    const TEST_NUM = redCount //5

    const totalWeight = Math.pow(DIE_SIDES, TEST_NUM)
    
    // Min and Max values to combine
    let minVal = 0
    let maxVal = DIE_SIDES-1

    let combinList = [] as Array<CombinationMap>

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
    
    // Initialize with array of all minimum faces
    let currentCombination:Array<number> = []
    
    for (let i=0; i<TEST_NUM; i++) {
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
    
    let weightSum:number = combinList.reduce( (p,cur) => p + cur.weight, 0)
    
    console.log("------------")
    // console.log(combinList)
    console.log(`Combinations: ${combinList.length}`)
    console.log(`Weight Sum: ${weightSum}`)
    console.log(`Theoretical: ${totalWeight}`)
    console.log("------------")

    
    // Turn list of die combinations and weights into chance of succeeding with rerolls

    const weightedChanceList = combinList.map( (combinMap) => {
        const dice:Array<DieInfo> = combinMap.combination.map( (number, i) => {
            return {
            id: i,
            color: "red",
            face: RED_DIE.faces[number]
            }
        })
        
        return findBestRerolls(atThreshold, breaks, rerolls, dice).success * combinMap.weight 
    })

    console.log(weightedChanceList)

    // Find average of chance of success
    const rrResult = weightedChanceList.reduce( (acc,val) => acc+val, 0) / totalWeight

    console.log("WEIGHTED AVG")
    console.log(rrResult)

    return rrResult
}