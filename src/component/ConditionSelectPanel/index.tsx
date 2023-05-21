import React from 'react'
import ConditionLabel from '../ConditionLabel'
import './ConditionSelectPanel.css'

function ConditionSelectPanel ( {atThreshold, breaks, upAT, upBr} : {atThreshold:number, breaks:number, upAT:Function, upBr:Function}) {

    return (
        <div className='ConditionSelectPanel'>
            <h2>Setup</h2>
            <ConditionLabel boxValue={atThreshold} updateValue={upAT} >Aeon Trespass Threshold:</ConditionLabel>
            <ConditionLabel boxValue={breaks} updateValue={upBr} >Break Tokens:</ConditionLabel>
        </div>
    )
}

export default ConditionSelectPanel