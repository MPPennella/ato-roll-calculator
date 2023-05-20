import React from 'react';
import './App.css';
// Components
import ActiveDie from './ActiveDie';
import ConditionSelectPanel from './ConditionSelectPanel';
import DieSelectPanel from './DieSelectPanel';
import ResultDisplayPanel from './ResultDisplayPanel';
// Types
import { PowerDie } from '../types/PowerDie';
import { PowerDieFace } from '../types/PowerDieFace';
import { PowerDieTracker } from '../types/PowerDieTracker';
// Data and processing utilities
import dieOutcomes from '../util/dieOutcomes';
import thresholdCheck from '../util/thresholdCheck';
import averageResult from '../util/averageResult';
import PowerDiceData from '../data/PowerDiceData.json'

function App() {

  // State variables

  // State to track the target AT Threshold and Breaks available
  const [atThreshold, setATThreshold] = React.useState(1)
  const [breaks, setBreaks] = React.useState(0)

  // State to track the various dice and a mutable reference to such
  const [diceTracker, setDiceTracker] = React.useState(Array<PowerDieTracker>)
  const diceTrackRef:any = React.useRef()
  diceTrackRef.current = diceTracker

  // For generating keys for dynamically generated elements
  const [latestKey, setLatestKey] = React.useState(0)

  // Keys are sequentially generated integers
  // Should eventually be updated to guard against running out of keys by recycling unused
  function genNewKey():number {
    let newKey = latestKey+1
    setLatestKey(newKey)
    console.log(`Key: ${newKey}`)
    return newKey
  }


  // CALLBACKS

  // Callback to update AT state
  function updateAT( newAT:number ) : void {
    setATThreshold(newAT)
  }

  // Callback to update Break state
  function updateBreaks( newBreaks:number ) : void {
    setBreaks(newBreaks)
  }

  // Adds a new die to the pool, handling input of which type (color) to add
  function handleAddNewDie( color:string ) : void {
    // Maximum number of dice to render
    const DICE_LIMIT = 8;
    
    // Don't add dice if already at limit in pool
    // Guard against performance issues with lots of dice
    if (diceTracker.length>=DICE_LIMIT) return

    // Try to find die info in data matching color specified
    let newDie:PowerDie|undefined = undefined
    for (const die of PowerDiceData.data as Array<PowerDie> ) {
      if (die.color === color.toLowerCase()) {
        newDie = die
      }
    }
    
    // Make sure applicable die data was found, otherwise do not proceed with creating new entry
    if (newDie !== undefined) {
    
      const newKey = genNewKey()

      const activeDieProps = {
        key: newKey,
        dieID: newKey,
        color: color,
        faceOptions: newDie.faces,
        remove: handleRemoveDie,
        upActFace: handleUpdateActiveFaces
      }
      const newComp = <ActiveDie {...activeDieProps} />

      const newTracker:PowerDieTracker = {
          id: newKey,
          die: newDie,
          activeFaceSet: newDie.faces,
          component: newComp
      }

      setDiceTracker( diceTracker.concat( newTracker) )
    }
  }


  // Removes the selected die from the pool, and updates calculations accordingly
  function handleRemoveDie( idToRemove:number ) : void {
    let remaining = diceTrackRef.current.filter( (item:PowerDieTracker) => (item.id!=idToRemove))
    setDiceTracker(remaining)

  }

  // Updates the active faces on a die
  function handleUpdateActiveFaces( componentId:number, newFaces:Array<PowerDieFace> ) : void {
    // Search for correct component id
    // let target:PowerDieTracker
    // for (const tracker of diceTrackRef.current as Array<PowerDieTracker>) {
    //   if (tracker.id == componentId) tracker.activeFaceSet = newFaces
    // }

    // Remap dice objects and update matching ID with new active faces
    let updatedDiceTracker = diceTrackRef.current.map( (tracker:PowerDieTracker) => {
      if (tracker.id == componentId) tracker.activeFaceSet = newFaces
      return tracker
    })

    setDiceTracker(updatedDiceTracker)
  }

  let outcomes = dieOutcomes(diceTracker.map( (e:PowerDieTracker) => {        
    return e.activeFaceSet
  }))

  // Construct props items for various sub-components
  const resultDisplayProps = {
    successPcnt: thresholdCheck(atThreshold, breaks, outcomes),
    average: averageResult(outcomes, breaks)
  }

  const conditionProps = {
    atThreshold: atThreshold,
    breaks: breaks,
    upAT: updateAT,
    upBr: updateBreaks
  }

  const dieSelectProps = {
    diceComponents: diceTracker.map( (element) => element.component),
    addDie: handleAddNewDie
  }

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
