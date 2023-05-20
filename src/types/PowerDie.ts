// The different colors a Power die can be
export enum DIE_COLORS {
    RED = 'red',
    BLACK = 'black',
    WHITE = 'white'
}

// type DIE_COLORS = "red" | "black" | "white"

// Represents the characteristics of one face of a Power die
export type PowerDieFace = {
    power: number
    potential: number
    dot: number
}

// Represents a Power die with color and face characteristics
export type PowerDie = {
    color: DIE_COLORS,

    faces : Array<PowerDieFace>
}
