import React from 'react'
import './ResultDisplayPanel.css'
import thresholdCheck from '../util/thresholdCheck'

function ResultDisplayPanel ( {successPcnt, average} : {successPcnt:number, average:number|undefined}) {
    
    // for testing, should pull from props
    const testOutcomes = [
        { power: 4, potential: 2, dot: 0 }, 
        { power: 2, potential: 2, dot: 0 }, 
        { power: 1, potential: 3, dot: 6 }
    ]

    let successChance:number = thresholdCheck( 4,2, testOutcomes)
    return (
        <div className='ResultDisplayPanel'>
            <h2>Result</h2>
            <p>Chance of success: {successPcnt}%</p>
            <p>Average: {average}</p>
        </div>
    )
}

export default ResultDisplayPanel