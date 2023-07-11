import { match } from 'assert';
import React from 'react'
import './ConditionLabel.css'
import enforcePositive from '../../util/enforcePositive'

// Creates component consisting of a descriptive Label and Input for setting a value
function ConditionLabel ({children, boxValue, updateValue} : {children:string, boxValue:number, updateValue:(newValue:number)=>void}) : React.JSX.Element {
    
    // // Returns only values that are zero or greater
    // // Returns same number as input if positive, zero otherwise
    // function enforcePositive(inputNum:number) : number {
    //     return inputNum > 0 ? inputNum : 0
    // }
    
    function conditionalRender() : React.JSX.Element {
        
        if (matchMedia("not (any-pointer: coarse)").matches) return <></>

        return <div>
            <button className='MobileHelperButton' onClick={ (e) => updateValue( enforcePositive( boxValue+1 )) } >+</button>
            <button className='MobileHelperButton' onClick={ (e) => updateValue( enforcePositive( boxValue-1 )) } >-</button>
        </div>
    }

    return (
        <div className='ConditionLabelContainer'>                
            <label className='ConditionLabel'>{children} 
                <input 
                    type="number" 
                    value={boxValue} 
                    onChange={ (e) => updateValue( enforcePositive( Math.floor(+e.target.value))) }
                />
                {conditionalRender()}
            </label>
        </div>
    )
}

export default ConditionLabel