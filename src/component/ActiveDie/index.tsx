import React from 'react'
import { PowerDieFace } from '../../types/'
import ActiveDieFaceSelector from '../ActiveDieFaceSelector'
import './ActiveDie.css'

function ActiveDie (
    {dieID, color, highlight=false, blacked=false, faceOptions, activeFace, cycle, remove, upActFace } 
    : 
    {
        dieID:number, 
        color:string,
        highlight?:Boolean,
        blacked?:Boolean,
        faceOptions:Array<PowerDieFace>,
        activeFace:string,
        cycle: number,
        remove:(id:number)=>void, 
        upActFace:(id:number, faceLabel:string, newActiveFaceSet:PowerDieFace[])=>void
    }) : React.JSX.Element {
    
    const [selected, setSelected] = React.useState(0)
    
    
    // Map to correspond option values to face objects
    const faceMap = new Map< string, PowerDieFace>()
    faceOptions.forEach( (face:PowerDieFace, i:number) => {
        faceMap.set(`face${i}`, face)
    })

    // Setup to control CSS styling of die based on color
    let colorTag:string
    switch (color) {
        case "red": colorTag = "RedDie"; break;
        case "black": colorTag = "BlackDie"; break;
        case "white": colorTag = "WhiteDie"; break;
        default: colorTag = ""; break;
    }

    // Add Highlighting if supposed to be active
    let highlightTag:string = ""
    if (highlight === true) highlightTag = `HighlightedDie ${blacked === true ? "HighlightedDieBlacked" : "HighlightedDieRegular"}`

    // Deletes this die by passing ID to controlling function
    function removeDie():void {
        remove(dieID)
    }   
   

    // Updates the active face selection
    function updateSelected(e:React.ChangeEvent<HTMLSelectElement>):void {
        const optionId = e.target.value
        
        // By default treat as random selected
        let newActiveFaceSet = faceOptions
        
        // Check if non-random face option selected, if so get face matching selected ID
        if (optionId !== "rand") {
            for (const [k,v] of faceMap) {
                if (k === optionId) {newActiveFaceSet = [v]; break}
            }
        }

        // Update states and propagate change info
        // setActiveFace(optionId)
        upActFace(dieID, optionId, newActiveFaceSet )
    }


    // Updates the active face selection
    function updateSelectedHoriz(e: React.MouseEvent<HTMLDivElement>):void {
        const target = e.target as HTMLDivElement
        const optionId = target.dataset.index as string
        console.log(`INDEX: ${optionId}`)
        
        // By default treat as random selected
        let newActiveFaceSet = faceOptions
        
        for (const [k,v] of faceMap) {
            if (k === "face"+optionId) {newActiveFaceSet = [v]; break}
        }

        // Update states and propagate change info
        setSelected(Number.parseInt(optionId))
        upActFace(dieID, optionId, newActiveFaceSet )
    }

    // Create the component for the <select> that holds the face options dropdown
    function renderFaceOptions() : React.JSX.Element {
        // Create array for different face options and initialize with Random option
        let faceOptionComponents:Array<React.JSX.Element> = [<option key="r" value="rand">Random</option>]

        // Generate other needed face options
        // Currently generates duplicate faces if the option is on multiple sides of a die
        // TODO: update in future to streamline view
        for (let i=0; i<faceOptions.length; i++) {
            let curr = faceOptions[i]
            faceOptionComponents.push(
                <option className="FaceSelectOption" key={i} value={`face${i}`}>
                    {/* { `${curr.power} / ${curr.potential}${ cycle>=3 ? ` / ${curr.dot}` : "" }` } */}
                    {/* { `P:${curr.power} B:${curr.potential}${ cycle>=3 ? ` D:${curr.dot}` : "" }` } */}
                    { `Pow ${curr.power} Br ${curr.potential}${ cycle>=3 ? ` Dot ${curr.dot}` : "" }` }
                </option>
            )
        }

        return <select
            className="FaceSelectSelect"
            value={activeFace}
            onChange={updateSelected}
            children={faceOptionComponents}
        />
    }

    // Create the component for the horizontal style of selectable graphical faces
    function renderFaceOptionsHoriz() : React.JSX.Element {
        // Create array for different face options and initialize with Random option
        let faceOptionComponents:Array<React.JSX.Element> = []

        // Generate other needed face options
        // Currently generates duplicate faces if the option is on multiple sides of a die
        // TODO: update in future to streamline view
        for (let i=0; i<faceOptions.length; i++) {
            let curr = faceOptions[i]
            faceOptionComponents.push(
                <ActiveDieFaceSelector key={i} index={i} selected={ selected===i ? true : false} >
                    { `P${curr.power}`} <br/> {`B${curr.potential}`}  { cycle>=3 ? <br/>:""} {`${ cycle>=3 ? `D${curr.dot}` : "" }` }
                </ActiveDieFaceSelector>
            )
        }

        return <div
            className="FaceSelectPanel"
            children={faceOptionComponents}
            onClick={updateSelectedHoriz}
        />
    }

    return (
        // <div className='DieWrapper'>
        //     <div className={'DieBox ' + colorTag + ' ' + highlightTag}>
        //         <button onClick={removeDie} className='RemoveButton'>X</button>
        //     </div>
        //     {renderFaceOptions()}
        // </div>
        <div className='DieWrapperHoriz'>
            <div className={'DieBox ' + colorTag + ' ' + highlightTag}>
                <button onClick={removeDie} className='RemoveButton'>X</button>
            </div>
            {renderFaceOptionsHoriz()}
        </div>
    )
}

export default ActiveDie