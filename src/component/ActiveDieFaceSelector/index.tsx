import React from 'react'
import './ActiveDieFaceSelector.css'

function ActiveDieFaceSelector ( { children, index, selected }
    :
    {
        children: any,
        index: number,
        selected: Boolean,
    }) : React.JSX.Element {
    
    return (
        <div className={`FaceOptionBox ${selected ? "BoxSelected": ""}`} data-index={index}>{children}</div>       
    )
}

export default ActiveDieFaceSelector