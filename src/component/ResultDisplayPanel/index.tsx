import React from 'react'
import './ResultDisplayPanel.css'

function ResultDisplayPanel ( {successPcnt, average} : {successPcnt:number, average:number}) {
    
    return (
        <div className='ResultDisplayPanel'>
            <h2>Result</h2>
            <p>Chance of success: {successPcnt.toFixed(3)}%</p>
            <p>Average: {average.toFixed(3)}</p>
        </div>
    )
}

export default ResultDisplayPanel