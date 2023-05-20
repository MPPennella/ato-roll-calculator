import React from 'react'
import './ResultDisplayPanel.css'

function ResultDisplayPanel ( {successPcnt, average} : {successPcnt:number, average:number|undefined}) {
    
    return (
        <div className='ResultDisplayPanel'>
            <h2>Result</h2>
            <p>Chance of success: {successPcnt}%</p>
            <p>Average: {average}</p>
        </div>
    )
}

export default ResultDisplayPanel