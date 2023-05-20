import React from 'react'
import './ActiveDie.css'

function ActiveDie ({remove, color} : {remove:React.MouseEventHandler<HTMLButtonElement>, color:string}) {
    
    return (
        <div className='DieWrapper'>
            <div className='DieBox'>
                {/* {color} */}
                <button onClick={remove} className='RemoveButton'>X</button>
            </div>
        </div>
    )
}

export default ActiveDie