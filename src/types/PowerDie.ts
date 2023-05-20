import { PowerDieFace } from "./PowerDieFace"

// The different colors a Power die can be
export enum DIE_COLORS {
    RED = 'red',
    BLACK = 'black',
    WHITE = 'white'
}

// type DIE_COLORS = "red" | "black" | "white"



// Represents a Power die with color and face characteristics
export type PowerDie = {
    color: DIE_COLORS,

    faces : Array<PowerDieFace>
}
