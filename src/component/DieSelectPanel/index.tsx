import React from 'react'
import './DieSelectPanel.css'
import DieCreator from '../DieCreator'
import enforcePositive from '../../util/enforcePositive'

function DieSelectPanel ( {diceComponents, addDie, updateHighlights} : {diceComponents:Array<React.JSX.Element>, addDie:Function, updateHighlights:Function } ) {

    // State tracker for number of rerolls, may be hoisted later
    const [rerolls, setRerolls] = React.useState(0)

    // Returns a single div component containing the array of Dice to display, or a placeholder piece if no dice in pool
    function renderDice( dice:Array<React.JSX.Element>) : React.JSX.Element {
        return dice.length>0 ? <div className='DiePanel'>{dice}</div> : <div className='DiePanelEmpty'></div>
    }

    // 
    function findBestRerollandUpdate () {
        console.log("FIND REROLL CALLED")
        // Use die information and number of rerolls to find best dice combination to reroll and chance of success

        // Update view with results
        let testOutput = [1,4,5]
        updateHighlights( testOutput )
    }

    return (
        <div className='DieSelectPanel'>
            <h2>Dice</h2>
            <div className='DieCreatorPanel'>
                <span>Add Die:</span>
                <DieCreator onClick={addDie} color="Red" />
                <DieCreator onClick={addDie} color="Black" />
                <DieCreator onClick={addDie} color="White" />
            </div>
            {renderDice(diceComponents) }
            {/* Dice Total: {diceComponents.length} */}
            
            <div>
                <label>
                    Rerolls:
                    <input
                        type="number" 
                        value={rerolls} 
                        onChange={ (e) => setRerolls( enforcePositive( Math.floor(+e.target.value))) }
                    />
                </label>
                {/* TODO: Add +/- buttons for better mobile experience */}
                
            </div>
            <button onClick={findBestRerollandUpdate} >Find Best Rerolls</button>
        </div>
    )
}


export default DieSelectPanel