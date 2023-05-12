import React from 'react'
import './DieCreator.css'

function DieCreator ( {onClick}:any) {
    // function handleClick() {
    //     alert('CLICK')
    // }

    return (
        <div>
            <button onClick={onClick} >Add Die</button>
        </div>
    )
}

export default DieCreator