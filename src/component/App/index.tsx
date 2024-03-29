import React, { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import './App.css';
// Components
import ActiveDie from '../ActiveDie';
import ConditionSelectPanel from '../ConditionSelectPanel';
import DieSelectPanel from '../DieSelectPanel';
import ResultDisplayPanel from '../ResultDisplayPanel';
import CycleSelector from '../CycleSelector'
// Types
import { DieInfo, PowerDie, PowerDieFace, PowerDieTracker } from '../../types';
// Data and processing utilities
import { RED_DIE, BLACK_DIE, WHITE_DIE } from '../../data/PowerDiceData';
import dieOutcomes from '../../util/dieOutcomes';
import thresholdCheck from '../../util/thresholdCheck';
import averageResult from '../../util/averageResult';
import sortDieColors from '../../util/sortDieColors';
import findBestRerolls from '../../util/findBestRerolls';
import findCombinations from '../../util/findCombinations';


// Main component which controls all app function and tracks necessary states
function App() {

  // State variables

  // State to track the Cycle
  const [cookies, setCookie] = useCookies(['cycle'])
  const cycle = cookies.cycle as number

  // State to track the target AT Threshold and Breaks available
  const [atThreshold, setATThreshold] = React.useState(1)
  const [breaks, setBreaks] = React.useState(0)
  const [hope, setHope] = React.useState(0)
  const [rerolls, setRerolls] = React.useState(0)
  const [blacks, setBlacks] = React.useState(0)
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
          highlight: false,
          blacked: false
      }

      // Add new die and resort list, then update state
      const updatedDiceTracker = sortDieColors(diceList.concat( newTracker))
      updateDice( updatedDiceTracker )

    }
  }

  // Changes highlighting of dice objects - highlights specified IDs, de-highlights any others
  function handleUpdateDieHighlights (dieIDsRegular:Array<number>, dieIDsBlacked:Array<number>) : void {
    const updatedDiceTracker = diceTrackRef.current as Array<PowerDieTracker>

    // Check each tracked die to find matches
    for (const tracker of updatedDiceTracker) {
      // No highlight unless specified by ID in array
      let highlightStatus = false
      let blackedStatus = false

      if (dieIDsRegular.includes(tracker.id)) {
        highlightStatus = true
      }
      if (dieIDsBlacked.includes(tracker.id)) {
        highlightStatus = true
        blackedStatus = true
      }
      // // Check if ID of current die matches a targeted ID
      // for (const targetID of dieIDsRegular) {
      //   if (tracker.id === targetID) {
      //     highlightStatus = true
      //     break
      //   }
      // }

      // Only need to change if different status from before
      if (tracker.highlight!== highlightStatus) {
        // TODO: Issue - React does not immediately update highlight (on or off) if only one die in list, but does track as updates when another added
        tracker.highlight = highlightStatus
      }
      if (tracker.blacked !== blackedStatus) {
        tracker.blacked = blackedStatus
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

    const bestRerolls = findBestRerolls( atThreshold, breaks, hope, rerolls, blacks, diceInfo)

    // Update view with results
    handleUpdateDieHighlights( bestRerolls.ids.regular, bestRerolls.ids.blacked )
    setRerollSuccess( bestRerolls.success )
  }

  // Find chance of success with given dice pool including using rerolls and update display
  function handleUpdateAllRerollDisplay () : void {
    // Find average result of all possible reroll scenarios

    console.log("------------")
    console.log("CALCULATING ALL REROLL POSSIBILITIES...")

    // Tracker for calc time
    const timeStart = (new Date()).valueOf()

    // Alternate method - find all *unique* combinations of faces, then weight them by appearance and run reroll check only on unique combinations
    const rrResult:number = findCombinations(atThreshold, breaks, rerolls, blacks, diceTrackRef.current, hope)

    const timeEnd = (new Date()).valueOf()
    const totalTime = timeEnd - timeStart

    // console.log(`Original method: ${naiveTime}ms`)
    console.log(`REROLL CALC TIME: ${totalTime}ms`)

    setAllRerollSuccess(rrResult)
  }

  // Update active Cycle and save as cookie
  function handleUpdateCycle (cycleNumber:number) : void {
    setCookie("cycle", cycleNumber)

    // Remove token types that don't appear in the lower cycles to prevent from factoring into calculations while inputs hidden
    if (cycleNumber<3) setHope(0)
    if (cycleNumber<2) setBlacks(0)
  }

  // Construct props items for various sub-components
  const resultDisplayProps = {
    successPcntBef: thresholdCheck(atThreshold, breaks, outcomes, hope),
    averageBef: averageResult(outcomes, breaks, hope),
    successPcntAft: allRerollSuccess,
    averageAft: 0,
    updateRerollDisplay: handleUpdateAllRerollDisplay
  }

  const conditionProps = {
    cycle: cycle,
    atThreshold: atThreshold,
    breaks: breaks,
    hope: hope,
    rerolls: rerolls,
    black: blacks,
    updateAT: setATThreshold,
    updateBreaks: setBreaks,
    updateHope: setHope,
    updateRerolls: setRerolls,
    updateBlack: setBlacks
  }

  const dieSelectProps = {
    diceComponents: diceTracker.map( (dieTracker) => {
      return <ActiveDie
        key = {dieTracker.id}
        dieID = {dieTracker.id} 
        color = {dieTracker.die.color}
        highlight = {dieTracker.highlight}
        blacked = {dieTracker.blacked}
        faceOptions = {dieTracker.die.faces}
        activeFace = {dieTracker.activeFaceOptId}
        cycle = {cycle}
        remove = {handleRemoveDie}
        upActFace = {handleUpdateActiveFaces}
      />
    }),
    totalRerolls: rerolls+blacks,
    rerollSuccess: rerollSuccess,
    addDie: handleAddNewDie,
    findRerolls: findBestRerollandUpdate
  }

  const cycleProps = {
    cycle: cycle,
    cycleUpdater: handleUpdateCycle
  }

  // Check if valid Cycle cookie on first render, if not default to Cycle 1
  useEffect(()=>{
    const cycle = cookies.cycle
    // Cycle must be defined, a number, and between 1 and 5
    if (cycle === undefined || isNaN(cycle) || cycle<1 || cycle>5 ) setCookie("cycle",1)
  },[])

  // Create display components and pass props
  return (
    <div className="App">
      <div className='BoundingBox'>
        <h1>Aeon Trespass Roll Calculator</h1>
        <ResultDisplayPanel {...resultDisplayProps} />
        <ConditionSelectPanel {...conditionProps} />
        <DieSelectPanel {...dieSelectProps} />
        <CycleSelector {...cycleProps}  />
      </div>
    </div>
  );
}

export default App;
