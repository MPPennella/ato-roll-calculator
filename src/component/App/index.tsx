import React from 'react';
import './App.css';
// Components
import ActiveDie from '../ActiveDie';
import ConditionSelectPanel from '../ConditionSelectPanel';
import DieSelectPanel from '../DieSelectPanel';
import ResultDisplayPanel from '../ResultDisplayPanel';
// Types
import { DieInfo, PowerDie, PowerDieFace, PowerDieTracker } from '../../types';
// Data and processing utilities
import { RED_DIE, BLACK_DIE, WHITE_DIE } from '../../data/PowerDiceData';
import dieOutcomes from '../../util/dieOutcomes';
import thresholdCheck from '../../util/thresholdCheck';
import averageResult from '../../util/averageResult';
import sortDieColors from '../../util/sortDieColors';
import findBestRerolls from '../../util/findBestRerolls';


// Main component which controls all app function and tracks necessary states
function App() {

  // State variables

  // State to track the target AT Threshold and Breaks available
  const [atThreshold, setATThreshold] = React.useState(1)
  const [breaks, setBreaks] = React.useState(0)
  const [rerolls, setRerolls] = React.useState(0)
  const [allRerollSuccess, setAllRerollSuccess] = React.useState(0)
  const [rerollSuccess, setRerollSuccess] = React.useState(0)

  // State to track the various dice and a mutable reference to such
  const [diceTracker, setDiceTracker] = React.useState(Array<PowerDieTracker>)
  const diceTrackRef = React.useRef() as React.MutableRefObject< PowerDieTracker[] >
  diceTrackRef.current = diceTracker

  // Holds the calculated outcomes for reference
  const [outcomes, setOutcomes] = React.useState([{power:0, potential:0, dot:0}] as PowerDieFace[])

  // Updates the states related to tracked dice objects
  function updateDice( newDiceTracker:Array<PowerDieTracker> ) : void {
    // Overall die tracker
    setDiceTracker(newDiceTracker)

    // List of face outcomes generated from active faces of dice
    setOutcomes(
      dieOutcomes(
        newDiceTracker.map( (tracker:PowerDieTracker) => tracker.activeFaceSet)
      )
    )
  }

  // For generating keys for dynamically generated elements
  const [latestKey, setLatestKey] = React.useState(0)

  // Keys are sequentially generated integers
  // Should eventually be updated to guard against running out of keys by recycling unused
  function genNewKey():number {
    let newKey = latestKey+1
    setLatestKey(newKey)
    return newKey
  }


  // CALLBACKS

  // Callback to update AT state
  function handleUpdateAT( newAT:number ) : void {
    setATThreshold(newAT)
  }

  // Callback to update Break state
  function handleUpdateBreaks( newBreaks:number ) : void {
    setBreaks(newBreaks)
  }

  // Callback to update Reroll state
  function handleUpdateRerolls( newRerolls:number ) : void {
    setRerolls(newRerolls)
  }

  // Adds a new die to the pool, handling input of which type (color) to add
  function handleAddNewDie( color:string ) : void {
    // Maximum number of dice to render
    const DICE_LIMIT = 8;
    const diceList = diceTrackRef.current
    
    // Don't add dice if already at limit in pool
    // Guard against performance issues with lots of dice
    if (diceList.length>=DICE_LIMIT) return

    // Try to find die info in data matching color specified
    let newDie:PowerDie|undefined = undefined
    // for (const die of PowerDiceData.data as Array<PowerDie> ) {
    //   if (die.color === color.toLowerCase()) {
    //     newDie = die
    //   }
    // }

    switch (color) {
      case "Red": newDie = RED_DIE; break;
      case "Black": newDie = BLACK_DIE; break;
      case "White": newDie = WHITE_DIE; break;
      default: break;
    }
    
    // Make sure applicable die data was found, otherwise do not proceed with creating new entry
    if (newDie !== undefined) {
    
      const newKey = genNewKey()

      const newTracker:PowerDieTracker = {
          id: newKey,
          die: newDie,
          activeFaceSet: newDie.faces,
          activeFaceOptId: "rand",
          highlight: false
      }

      // Add new die and resort list, then update state
      const updatedDiceTracker = sortDieColors(diceList.concat( newTracker))
      updateDice( updatedDiceTracker )

    }
  }

  // Changes highlighting of dice objects - highlights specified IDs, de-highlights any others
  function handleUpdateDieHighlights (dieIDs:Array<number>) : void {
    const updatedDiceTracker = diceTrackRef.current as Array<PowerDieTracker>

    // Check each tracked die to find matches
    for (const tracker of updatedDiceTracker) {
      // No highlight unless specified by ID in array
      let highlightStatus = false

      // Check if ID of current die matches a targeted ID
      for (const targetID of dieIDs) {
        if (tracker.id === targetID) {
          highlightStatus = true
          break
        }
      }

      // Only need to change if different status from before
      if (tracker.highlight!== highlightStatus) {
        // TODO: Issue - React does not immediately update highlight (on or off) if only one die in list, but does track as updates when another added
        tracker.highlight = highlightStatus
      }
    }

    updateDice( updatedDiceTracker )
  }


  // Removes the selected die from the pool, and updates calculations accordingly
  function handleRemoveDie( idToRemove:number ) : void {
    const remaining = diceTrackRef.current.filter( (item:PowerDieTracker) => (item.id !== idToRemove))
    updateDice(remaining)
  }


  // Updates the active faces on a die
  function handleUpdateActiveFaces( componentId:number, newActiveFace:string, newFaces:Array<PowerDieFace> ) : void {
    
    // Remap dice objects and update matching ID with new active faces
    const updatedDiceTracker = diceTrackRef.current.map( (tracker:PowerDieTracker) => {
      // Search for correct component id and update face set
      if (tracker.id === componentId) {
          tracker.activeFaceSet = newFaces
          tracker.activeFaceOptId = newActiveFace
      }
      return tracker
    })

    updateDice(updatedDiceTracker)
  }


  // Use die faces and other selections to find which dice are best to reroll to reach target values
  function findBestRerollandUpdate () {
    console.log("FIND REROLL CALLED")
    // Use die information and number of rerolls to find best dice combination to reroll and chance of success
    let diceInfo:Array<DieInfo> = []
    
    // Generate array of DieInfo objects by pulling info from DiceTrackers
    for (const dieTracker of diceTrackRef.current as PowerDieTracker[]) {
      const { color } : {color:string} = dieTracker.die
      diceInfo.push({
        id: dieTracker.id,
        color: color.toLowerCase(), 
        face: dieTracker.activeFaceSet[0]
      }) 
    }

    const bestRerolls = findBestRerolls( atThreshold, breaks, rerolls, diceInfo)

    // Update view with results
    handleUpdateDieHighlights( bestRerolls.ids )
    setRerollSuccess(bestRerolls.success)
  }

  // Find chance of success with given dice pool including using rerolls and update display
  function handleUpdateAllRerollDisplay () : void {
    // Find average result of all possible reroll scenarios

    // Extract relevant info for dice
    const diceList = diceTrackRef.current.map( (dieTracker) => {
      return {
        id: dieTracker.id, 
        color: dieTracker.die.color, 
        faces: dieTracker.die.faces 
      }
    })


    // Brute force method, slows dramatically with higher numbers of dice 
    // Always O(6^n) [exponential]

    // Simply find all possible combinations of faces, then check success after rerolls for each
    let tempList = [] as DieInfo[][]
    while (diceList.length > 0) {
      const currDie = diceList.pop()
      if (currDie === undefined) break

      const {id, color, faces} = currDie
      
      let tempList2 = [] as DieInfo[][]
      for ( const face of faces) {
        // Create new DieInfo for each possible face on die
        const newDieInfo: DieInfo = {id:id, color:color, face:face}

        // Combine with each existing combination of faces
        // For first die processed, just push its DieInfo
        if (tempList.length === 0) {
          tempList2.push( [newDieInfo] )
          continue
        }
        // Once there are entries in the list, combine with each already there
        for (const dieList of tempList ) {
          tempList2.push( dieList.concat(newDieInfo))
        }
      }

      // Update tempList with latest round
      tempList = tempList2

    }

    // Store finalized list of die face combinations
    const fullList = tempList

    // Turn list of die combinations into chance of succeeding with rerolls
    const chanceList = fullList.map( (list) => findBestRerolls(atThreshold, breaks, rerolls, list).success )

    // Find average of chance of success
    const rrResult = chanceList.reduce( (acc,val) => acc+val, 0)/chanceList.length




    // Alternate method - find all *unique* combinations of faces, then weight them by appearance and run reroll check only on unique combinations
    // Worst case ~O(n^13), best O(n^4) [polynomial]
    const diceList2 = diceTrackRef.current.map( (dieTracker) => {
      return {
        id: dieTracker.id, 
        color: dieTracker.die.color, 
        faces: dieTracker.die.faces 
      }
    })
    // Find count of each color of die
    const redCount:number = diceList2.filter((die) =>  die.color === "red" ? true : false ).length
    const blackCount:number = diceList2.filter((die) =>  die.color === "black" ? true : false ).length
    const whiteCount:number = diceList2.filter((die) =>  die.color === "white" ? true : false ).length

    // Find unique combinations and weight of each combination

    // Start with Red dice combinations
    const DIE_SIDES = 6
    const TEST_NUM = 5

    const totalWeight = Math.pow(DIE_SIDES, TEST_NUM)
    console.log(`TOTAL WEIGHT: ${totalWeight}`)

    // Min and Max values to combine
    let minVal = 0
    let maxVal = DIE_SIDES-1

    type CombinationMap = {
      combination: Array<number>,
      weight: number
    }

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

        /**
         * Basic recursive function to find factorial of positive or zero integer `input`.
         * Use of `lowerBound` optional paramter has the effect of returning *n*!/*b*!, where *n* is `input` and *b* is `lowerBound`
         * 
         * @param input Positive integer or zero
         * @param lowerBound Optional: Positive integer or zero that is less than or equal to `input`
         * @returns *n*! where *n* is `input`, or *n*!/*b*! where *b* is `lowerBound` if optional paramter is used,
         * NaN if invalid parameters passed
         */
        function factorial ( input:number, lowerBound:number = 0 ) : number {
          // Return NaN for bad input
          if ( input<0 || !Number.isInteger(input) || lowerBound > input ) return NaN

          // 1! and 0! = 1
          if ( input <= 1 || input === lowerBound ) return 1

          // Call recursively with n-1 as input and multiply by current input
          return input * (factorial(input-1, lowerBound))
        }

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

    console.log(combinList)
    console.log(combinList.length)

    let weightSum:number = combinList.reduce( (p,cur) => p + cur.weight, 0)
    
    console.log("------------")
    console.log(`Weight Sum: ${weightSum}`)
    console.log(`Theoretical: ${totalWeight}`)

    
    // Turn list of die combinations and weights into chance of succeeding with rerolls


    // Find average of chance of success




    setAllRerollSuccess(rrResult)
  }

  // Construct props items for various sub-components
  const resultDisplayProps = {
    successPcntBef: thresholdCheck(atThreshold, breaks, outcomes),
    averageBef: averageResult(outcomes, breaks),
    successPcntAft: allRerollSuccess,
    averageAft: 0,
    updateRerollDisplay: handleUpdateAllRerollDisplay
  }

  const conditionProps = {
    atThreshold: atThreshold,
    breaks: breaks,
    upAT: handleUpdateAT,
    upBr: handleUpdateBreaks
  }

  const dieSelectProps = {
    diceComponents: diceTracker.map( (dieTracker) => {
      return <ActiveDie
        key = {dieTracker.id}
        dieID = {dieTracker.id} 
        color = {dieTracker.die.color}
        highlight = {dieTracker.highlight}
        faceOptions = {dieTracker.die.faces}
        activeFace = {dieTracker.activeFaceOptId}
        remove = {handleRemoveDie}
        upActFace = {handleUpdateActiveFaces}
      />
    }),
    rerolls: rerolls,
    rerollSuccess: rerollSuccess,
    addDie: handleAddNewDie,
    updateRerolls: handleUpdateRerolls,
    findRerolls: findBestRerollandUpdate
  }

  // Create display components and pass props
  return (
    <div className="App">
      <div className='BoundingBox'>
        <h1>Aeon Trespass Roll Calculator</h1>
        <ResultDisplayPanel {...resultDisplayProps} />
        <ConditionSelectPanel {...conditionProps} />
        <DieSelectPanel {...dieSelectProps} />
      </div>
    </div>
  );
}

export default App;
