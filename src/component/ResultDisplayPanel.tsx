import React from 'react'
import './ResultDisplayPanel.css'

function ResultDisplayPanel () {
    let successChance:number = 23.5
    return (
        <div className='ResultDisplayPanel'>
            <h2>Result</h2>
            <p>Chance of success: {successChance}%</p>
        </div>
    )
}

export default ResultDisplayPanel