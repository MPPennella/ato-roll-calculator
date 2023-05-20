import React from 'react'
import './DieCreator.css'

function DieCreator ( {onClick, color} : {onClick:Function, color:string}) {
    function addDie():void {
        onClick(color)
    }

    return (
        <div>
            <button onClick={addDie} >Add {color} Die</button>
        </div>
    )
}

export default DieCreator
