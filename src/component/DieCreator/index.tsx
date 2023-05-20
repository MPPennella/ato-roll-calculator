import React from 'react'
import './DieCreator.css'

function DieCreator ( {onClick, color} : {onClick:Function, color:string}) {
    function addDie():void {
        onClick(color)
    }

    return (
        <div>
            <button className='DieCreateButton' onClick={addDie} >{color} Die</button>
        </div>
    )
}

export default DieCreator
