import React from 'react'
import './ConditionLabel.css'

// Creates component consisting of a descriptive Label and Input for setting a value
function ConditionLabel ({children, boxValue, updateValue} : {children:string, boxValue:number, updateValue:Function}) {
    
    // Returns only values that are zero or greater
    // Returns same number as input if positive, zero otherwise
    function enforcePositive(inputNum:number) : number {
        return inputNum > 0 ? inputNum : 0
    }
    
    return (
        <div className='ConditionLabelContainer'>                
            <label className='ConditionLabel'>{children} 
                <input 
                    type="number" 
                    value={boxValue} 
                    onChange={ (e) => updateValue( enforcePositive( Math.floor(+e.target.value))) }
                />
                <button onClick={ (e) => updateValue( enforcePositive( boxValue+1 )) } >+</button>
                <button onClick={ (e) => updateValue( enforcePositive( boxValue-1 )) } >-</button>
            </label>
        </div>
    )
}

export default ConditionLabel