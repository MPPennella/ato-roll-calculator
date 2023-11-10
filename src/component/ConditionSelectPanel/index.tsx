import React from 'react'
import ConditionLabel from '../ConditionLabel'
import './ConditionSelectPanel.css'

function ConditionSelectPanel ( 
    {cycle, atThreshold, breaks, hope, rerolls, black, updateAT, updateBreaks, updateHope, updateRerolls, updateBlack} 
    : 
    {
        cycle: number,
        atThreshold:number, 
        breaks:number,
        hope:number,
        rerolls:number,
        black:number,
        updateAT:(newValue:number)=>void, 
        updateBreaks:(newValue:number)=>void,
        updateHope:(newValue:number)=>void,        
        updateRerolls:(newValue:number)=>void,
        updateBlack:(newValue:number)=>void
    }) {

    return (
        <div className='ConditionSelectPanel'>
            <div className='ConditionLabelBoundBox'>
                <h2>Primordial</h2>            
                <ConditionLabel boxValue={atThreshold} updateValue={updateAT} >Aeon Trespass Threshold:</ConditionLabel>

                <h2>Kratos Pool and Rerolls</h2>
                <ConditionLabel boxValue={breaks} updateValue={updateBreaks} >{"Break "+(cycle>=2?"and Fire ":"")+"Tokens:"}</ConditionLabel>
                {(cycle>=3)?<ConditionLabel boxValue={hope} updateValue={updateHope} >Hope Tokens:</ConditionLabel>:null}
                <ConditionLabel boxValue={rerolls} updateValue={updateRerolls} >Power Re-rolls:</ConditionLabel>
                {(cycle>=2)?<ConditionLabel boxValue={black} updateValue={updateBlack} >Black Tokens:</ConditionLabel>:null}
                
            </div>
        </div>
    )
}

export default ConditionSelectPanel