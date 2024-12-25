import React from 'react'
import './CycleSelector.css'

// Allows selection of current Cycle to curate display of relevant token types
function CycleSelector ( {cycle, cycleUpdater} : {cycle:number, cycleUpdater:(number:number)=>void} ) {
    
    return (
        <div>
            <button className={"CycleButton" + ( (cycle===1)?" ActiveCycle":"" ) } onClick={(e) => cycleUpdater( 1 )}>I</button>
            <button className={"CycleButton" + ( (cycle===2)?" ActiveCycle":"" ) } onClick={(e) => cycleUpdater( 2 )}>II</button>            
            <button className={"CycleButton" + ( (cycle===3)?" ActiveCycle":"" ) } onClick={(e) => cycleUpdater( 3 )}>III</button>
            <button className={"CycleButton" + ( (cycle===4)?" ActiveCycle":"" ) } onClick={(e) => cycleUpdater( 4 )}>IV</button>
            {/* <button className={"CycleButton" + ( (cycle===5)?" ActiveCycle":"" ) } onClick={(e) => cycleUpdater( 5 )}>V</button> */}
        </div>
        
    )
}

export default CycleSelector