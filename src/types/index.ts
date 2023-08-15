// The different colors a Power die can be
export enum DIE_COLORS {
    RED = 'red',
    BLACK = 'black',
    WHITE = 'white'
}

// type DIE_COLORS = "red" | "black" | "white"

// Represents info a bout a specific die, with identifing ID, color type it belongs to, and what face was rolled
export type DieInfo = {
    id: number,
    color: string,
    face: PowerDieFace
}

// Represents a Power die with color and face characteristics
export type PowerDie = {
    color: DIE_COLORS,
    faces : Array<PowerDieFace>
}

// Represents the characteristics of one face of a Power die
export type PowerDieFace = {
    power: number
    potential: number
    dot: number
}

// Contains info for tracking the state of Power Dice that have been created
export type PowerDieTracker = {
    id: number,
    die: PowerDie,
    activeFaceSet: Array<PowerDieFace>,
    // component: React.JSX.Element,
    activeFaceOptId: string,
    highlight: Boolean,
}
