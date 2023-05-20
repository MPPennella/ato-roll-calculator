import React from 'react'
import './DieSelectPanel.css'
import DieCreator from '../DieCreator'

function DieSelectPanel ( {diceComponents, addDie} : {diceComponents:Array<React.JSX.Element>, addDie:Function } ) {

    // Returns a single div component containing the array of Dice to display, or a placeholder piece if no dice in pool
    function renderDice( dice:Array<React.JSX.Element>) : React.JSX.Element {
        return dice.length>0 ? <div className='DiePanel'>{dice}</div> : <div className='DiePanelEmpty'></div>
    }

    return (
        <div className='DieSelectPanel'>
            <h2>Dice</h2>
            <div>
                <DieCreator onClick={addDie} color="Red" />
                <DieCreator onClick={addDie} color="Black" />
                <DieCreator onClick={addDie} color="White" />
            </div>
            {renderDice(diceComponents) }
            Dice Total: {diceComponents.length}
        </div>
    )
}


export default DieSelectPanel