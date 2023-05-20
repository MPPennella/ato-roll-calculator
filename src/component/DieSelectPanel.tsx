import React, { useRef } from 'react'
import './DieSelectPanel.css'
import './DieCreator'
import ActiveDie from './ActiveDie'
import DieCreator from './DieCreator'
import dieOutcomes from '../util/dieOutcomes'
import RED_DIE from "../data/PowerDice.json"
import { PowerDie } from '../types/PowerDie'
import thresholdCheck from '../util/thresholdCheck'
import averageResults from '../util/averageResult'

function DieSelectPanel () {
    // Setup state trackers
    const [diceArray, setNumDice] = React.useState(Array<React.JSX.Element> )
    const diceRef:any = useRef()
    diceRef.current = diceArray
    const [colorArray, setColorArray] = React.useState(Array<string>)
    
    // For generating keys for dynamically generated elements
    const [latestKey, setLatestKey] = React.useState(0)

    // Keys are sequentially generated integers
    function genNewKey():number {
        let newKey = latestKey+1
        setLatestKey(newKey)
        console.log(`Key: ${newKey}`)
        return newKey
    }

    // Returns a single div component containing the array of Dice to display, or a placeholder piece if no dice in pool
    function renderDice( ) : React.JSX.Element {
        return diceArray.length>0 ? <div className='DiePanel'>{diceArray}</div> : <div className='DiePanelEmpty'></div>
    }

    // Adds a new die to the pool, handling input of which type (color) to add
    function handleAddNewDie( color:string ) : void {
        const newKey = genNewKey()
        setNumDice( diceArray.concat( <ActiveDie key={newKey} color={color} remove={removeDie} />) )
        setColorArray( colorArray.concat( "RED"))
    }

    
    // Removes the selected die from the pool, and updates calculations accordingly
    function removeDie() : void {
        let remaining = diceRef.current.slice(1)
        setNumDice(remaining)

    }
    
    // Testing code for simulating outcomes of multiple dice
    let die1:PowerDie = RED_DIE as PowerDie
    let die2:PowerDie = RED_DIE as PowerDie

    let dOut = dieOutcomes([die1.faces, die2.faces,RED_DIE.faces, RED_DIE.faces])
    // console.log(dOut)

    return (
        <div className='DieSelectPanel'>
            <h2>Dice</h2>
            <div>
                <DieCreator onClick={handleAddNewDie} color="Red" />
                <DieCreator onClick={handleAddNewDie} color="Black" />
                <DieCreator onClick={handleAddNewDie} color="White" />
            </div>
            {renderDice() }
            Dice Total: {diceArray.length}
            <br/>
            Chance: {thresholdCheck(5,3,dOut)}%
            <br/>
            Average: {averageResults(dOut,5)}
        </div>
    )
}


export default DieSelectPanel