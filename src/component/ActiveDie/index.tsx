import React from 'react'
import { PowerDieFace } from '../../types/PowerDieFace'
import './ActiveDie.css'

function ActiveDie ({dieID, color, faceOptions, remove, upActFace } : {dieID:number, color:string, faceOptions:Array<PowerDieFace>, remove:Function, upActFace:Function}) {
    // State to track current face selection
    const [activeFace, setActiveFace] = React.useState("static")

    // Map to correspond option values to face objects
    const faceMap = new Map< string, PowerDieFace>()
    faceOptions.forEach( (face:PowerDieFace, i:number) => {
        faceMap.set(`face${i}`, face)
    })

    // Setup to control CSS styling of die based on color
    let colorTag:string
    switch (color) {
        case "Red": colorTag = "RedDie"; break;
        case "Black": colorTag = "BlackDie"; break;
        case "White": colorTag = "WhiteDie"; break;
        default: colorTag = ""; break;
    }

    // Deletes this die
    function removeDie():void {
        remove(dieID)
    }   
   

    // Updates the active face selection
    function updateSelected(e:any) {
        const optionId = e.target.value
        
        let newActiveFaceSet = faceOptions
        
        // Check if random face option selected, if so give all options
        if (optionId == "rand") newActiveFaceSet = faceOptions
        // Else get face matching selected ID
        else {
            for (const [k,v] of faceMap) {
                console.log(`Key ${k}, Val ${v}`)
                if (k == optionId) {newActiveFaceSet = [v]; break}

            }
        }

        // Update states and propagate change info
        setActiveFace(optionId)
        upActFace(dieID, newActiveFaceSet )
    }

    // Create the component for the <select> that holds the face options dropdown
    function renderFaceOptions() : React.JSX.Element {
        // Create array for different face options and initialize with Random option
        let faceOptionComponents:Array<React.JSX.Element> = [<option key="r" value="rand">Random</option>]

        // Generate other needed face options
        // Currently generates duplicate faces if the option is on multiple sides of a die, update in future to streamline view
        for (let i=0; i<faceOptions.length; i++) {
            let curr = faceOptions[i]
            faceOptionComponents.push(
                <option key={i} value={`face${i}`}>
                    { `Pow ${curr.power}, Break ${curr.potential}` }
                </option>
            )
        }

        return <select
            value={activeFace}
            onChange={updateSelected}
        >
            {faceOptionComponents}
        </select>
    }
    
    return (
        <div className='DieWrapper'>
            <div className={'DieBox '+colorTag}>
                {color}
                <button onClick={removeDie} className='RemoveButton'>X</button>
            </div>
            {renderFaceOptions()}
        </div>
    )
}

export default ActiveDie