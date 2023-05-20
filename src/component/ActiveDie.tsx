import React from 'react'
import './ActiveDie.css'

function ActiveDie ({dieID, remove, color} : {dieID:number, remove:Function, color:string}) {
    function removeDie():void {
        remove(dieID)
    }

    // Setup to control CSS styling of die based on color
    let colorTag:string
    switch (color) {
        case "Red": colorTag = "RedDie"; break;
        case "Black": colorTag = "BlackDie"; break;
        case "White": colorTag = "WhiteDie"; break;
        default: colorTag = ""; break;
    }
    
    return (
        <div className='DieWrapper'>
            <div className={'DieBox '+colorTag}>
                {color}
                <button onClick={removeDie} className='RemoveButton'>X</button>
            </div>
        </div>
    )
}

export default ActiveDie