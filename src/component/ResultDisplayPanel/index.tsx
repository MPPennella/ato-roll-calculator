import React from 'react'
import './ResultDisplayPanel.css'

function ResultDisplayPanel ( 
    {successPcntBef, averageBef, successPcntAft, averageAft, updateRerollDisplay} 
    :
    {
        successPcntBef:number,
        averageBef:number,
        successPcntAft: number,
        averageAft: number,
        updateRerollDisplay: ()=>void 
    }    
) {
    
    return (
        <div className='ResultDisplayPanel'>
            <h2>Result</h2>
            <div className="ResultSubHeader">Before Rerolls</div>
            <div>Chance of success: {successPcntBef.toFixed(3)}%</div>
            <div>Average: {averageBef.toFixed(3)}</div>
            <div className="ResultSubHeader">After Rerolls</div>
            <div>
                Chance of success: {successPcntAft.toFixed(3)}% 
                <button className="RefreshButton" onClick={updateRerollDisplay}>&#10227;{/* Refresh Icon */}</button>
            </div>
            {/* <div>Average: {averageAft.toFixed(3)}</div> */}
            {/* <button onClick={updateRerollDisplay}>&#10227; Update</button> */}
        </div>
    )
}

export default ResultDisplayPanel