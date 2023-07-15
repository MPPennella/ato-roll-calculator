import React from 'react'
import './DieSelectPanel.css'
import DieCreator from '../DieCreator'
import enforcePositive from '../../util/enforcePositive'
import ConditionLabel from '../ConditionLabel'

function DieSelectPanel ( 
    {diceComponents, rerolls, addDie, updateRerolls, findRerolls} 
    :
    {
        diceComponents:Array<React.JSX.Element>,
        rerolls:number,
        addDie:(color:string)=>void, 
        updateRerolls:(newRerolls:number)=>void,
        findRerolls:()=>void
    } ) : React.JSX.Element  {

    // Returns a single div component containing the array of Dice to display, or a placeholder piece if no dice in pool
    function renderDice( dice:Array<React.JSX.Element>) : React.JSX.Element {
        return dice.length>0 ? <div className='DiePanel'>{dice}</div> : <div className='DiePanelEmpty'></div>
    }

    // Determine if reroll button should be disabled
    // Should be disabled if no rerolls, or if not all dice are set to a static face
    const isFindRerollDisabled = (rerolls) ? false : true

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
            
            {/* <div>
                <label>
                    Rerolls:
                    <input
                        type="number" 
                        value={rerolls} 
                        onChange={ (e) => updateRerolls( enforcePositive( Math.floor(+e.target.value))) }
                    />
                </label>                
            </div> */}

            <div style={{width:"min-content", margin:"auto"}} >
                <ConditionLabel boxValue={rerolls} updateValue={updateRerolls} >Rerolls:</ConditionLabel>
            </div>

            <button className='RerollButton' onClick={findRerolls} disabled={ isFindRerollDisabled }>Find Best Rerolls</button>

            {/* <div>
                Chance of reroll success: {rerollSuccess.toFixed()}%
            </div> */}

        </div>
    )
}

export default DieSelectPanel