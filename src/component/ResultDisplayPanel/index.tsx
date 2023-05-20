import React from 'react'
import './ResultDisplayPanel.css'

function ResultDisplayPanel ( {successPcnt, average} : {successPcnt:number, average:number}) {
    
    return (
        <div className='ResultDisplayPanel'>
            <h2>Result</h2>
            <div>Chance of success: {successPcnt.toFixed(3)}%</div>
            <div>Average: {average.toFixed(3)}</div>
        </div>
    )
}

export default ResultDisplayPanel