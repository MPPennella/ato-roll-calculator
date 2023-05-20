import React from 'react';
import './App.css';
import './DieSelectPanel'
import DieSelectPanel from './DieSelectPanel';
import ConditionSelectPanel from './ConditionSelectPanel';
import ResultDisplayPanel from './ResultDisplayPanel';
import { PowerDie } from '../types/PowerDie';
import { PowerDieTracker } from '../types/PowerDieTracker';
import ActiveDie from './ActiveDie';
import RED_DIE from "../data/PowerDice.json"
import dieOutcomes from '../util/dieOutcomes';
import thresholdCheck from '../util/thresholdCheck';
import averageResults from '../util/averageResult';


function App() {

  // State variables

  // State to track the target AT Threshold and Breaks available
  const [atThreshold, setATThreshold] = React.useState(1)
  const [breaks, setBreaks] = React.useState(0)

  // State to track the various dice and a mutable reference to such
  const [diceTracker, setDicetracker] = React.useState(Array<PowerDieTracker>)
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
    // Don't add dice if already 6 in pool
    // Guard against performance issues with lots of dice
    if (diceTracker.length>=6) return

    const newKey = genNewKey()
    const newDie:PowerDie = RED_DIE as PowerDie
    const newComp = <ActiveDie key={newKey} dieID={newKey} color={color} remove={handleRemoveDie} />

    const newSomething:PowerDieTracker = {
        id: newKey,
        die: newDie,
        activeFaceSet: newDie.faces,
        component: newComp
    }

    setDicetracker( diceTracker.concat( newSomething) )
  }


  // Removes the selected die from the pool, and updates calculations accordingly
  function handleRemoveDie( idToRemove:number ) : void {
    let remaining = diceTrackRef.current.filter( (item:PowerDieTracker) => (item.id!=idToRemove))
    setDicetracker(remaining)

  }

  let dOut = dieOutcomes(diceTracker.map( (e:PowerDieTracker) => {        
    return e.die.faces
  }))
  console.log("DIE OUTCOMES CALCED")

  // Construct props items for various sub-components
  const resultDisplayProps = {
    successPcnt: thresholdCheck(atThreshold, breaks, dOut),
    average: averageResults(dOut, breaks)
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
      <h1>Aeon Trespass Roll Calculator</h1>
      <ResultDisplayPanel {...resultDisplayProps} />
      <ConditionSelectPanel {...conditionProps} />
      <DieSelectPanel {...dieSelectProps} />
    </div>
  );
}

export default App;
