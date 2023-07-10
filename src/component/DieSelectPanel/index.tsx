import React from 'react'
import './DieSelectPanel.css'
import DieCreator from '../DieCreator'
import enforcePositive from '../../util/enforcePositive'
import findBestRerolls from '../../util/findBestRerolls'

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
        const TEST_INPUT = [
            {
                id:1, 
                color:"red", 
                face: { power:1, potential:0, dot:1 }
            },
            {
                id:2, 
                color:"black", 
                face: { power:2, potential:1, dot:0 }
            },
            {
                id: 3,
                color: "red",
                face: { power: 1, potential: 1, dot: 0 }
            },
            {
                id: 4,
                color: "red",
                face: { power: 2, potential: 0, dot: 0 }
            },
            {
                id: 5,
                color: "black",
                face: { power: 0, potential: 1, dot: 0 }
            }
            ,{
                id: 6,
                color: "red",
                face: { power: 1, potential: 1, dot: 0 }
            }
        ]

        const bestRerolls = findBestRerolls( 11, 3, 3, TEST_INPUT)
        console.log("BEST REROLLS:")
        console.log(bestRerolls)

        // Update view with results
        updateHighlights( bestRerolls )
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