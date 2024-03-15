import React from 'react'
import './ActiveDieFaceSelector.css'

function ActiveDieFaceSelector ( { children, index }
    :
    {
        children: string,
        index: number,
    }) : React.JSX.Element {
    return (
        <div className="FaceOptionBox" data-index={index}>{children}</div>       
    )
}

export default ActiveDieFaceSelector