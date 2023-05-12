import React from 'react'
import './DieSelectPanel.css'
import './DieCreator'
import ActiveDie from './ActiveDie'
import DieCreator from './DieCreator'

function DieSelectPanel () {
    const [numDice, setNumDice] = React.useState(0)

    function renderDice( numDice:number ) : React.JSX.Element {
        let arr : React.JSX.Element[] = []
        for (let i=0; i<numDice; i++) {
            arr.push(<ActiveDie/>)
        }
        return arr.length>0 ? <div className='DiePanel'>{arr}</div> : <div style={{minHeight: "160px"}}></div>
    }

    function handleClick():void {
        setNumDice( numDice+1 )
    }

    return (
        <div className='DieSelectPanel'>
            <h2>Dice</h2>
            <DieCreator onClick={handleClick} />
            {renderDice(numDice)}
            Dice Total: {numDice}
        </div>
    )
}


export default DieSelectPanel