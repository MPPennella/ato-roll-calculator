import React from 'react'
import './ActiveDie.css'

function ActiveDie () {
    return (
        <div className='DieWrapper'>
            <div className='DieBox'>
                <button className='RemoveButton'>X</button>
            </div>
        </div>
    )
}

export default ActiveDie