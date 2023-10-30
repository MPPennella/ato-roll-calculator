import React from 'react'
//import './CycleSelector.css'

function CycleSelector ( {cycle, cycleUpdater} : {cycle:number, cycleUpdater:(number:number)=>void} ) {
    
    // TODO: Update implementation to allow selection of specific cycle instead of randomizer button
    return (
        <div>
            Cycle: {cycle}
            <br />
            <button onClick={(e) => cycleUpdater( Math.floor( Math.random()*3+1 ) )}>Rand</button>
        </div>
        
    )
}

export default CycleSelector