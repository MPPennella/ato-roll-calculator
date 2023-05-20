import React from 'react'
import './ConditionSelectPanel.css'

function ConditionSelectPanel ( {atThreshold, breaks, upAT, upBr} : {atThreshold:number, breaks:number, upAT:Function, upBr:Function}) {
    
    // Returns only values that are zero or greater
    // Returns same number as input if positive, zero otherwise
    function enforcePositive(inputNum:number) : number {
        return inputNum > 0 ? inputNum : 0
    }

    return (
        <div className='ConditionSelectPanel'>
            <div>
                <h2>Setup</h2>
                <label>Aeon Trespass Threshold: 
                    <input 
                        type="number" 
                        value={atThreshold} 
                        onChange={ (e) => upAT( enforcePositive(Math.floor(+e.target.value)) )}
                    />
                </label>
            </div>
            <div>
                <label>Break Tokens: 
                    <input 
                        type="number" 
                        value={breaks} 
                        onChange={ (e) => upBr( enforcePositive(Math.floor(+e.target.value)) )}
                    />
                </label>
            </div>
        </div>
    )
}

export default ConditionSelectPanel