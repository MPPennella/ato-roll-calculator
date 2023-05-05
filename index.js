// Prototype dice property objects

const RED_DIE = {
    sides: [
        [0,0,1],
        [0,1,0],
        [1,0,0],
        [1,1,0],
        [1,1,0],
        [2,0,1],
    ]
}

const BLACK_DIE = {
    sides: [
        [0,1,1],
        [1,1,0],
        [2,0,1],
        // [0,0,0], //unknown values for this side
        [2,1,0],
        [2,2,0],
    ]
}

const WHITE_DIE = {
    sides: [
        [1,2,1],
        // [0,0,0], //unknown values for this side
        // [0,0,0], //unknown values for this side
        // [0,0,0], //unknown values for this side
        [1,3,0],
        [3,2,1],
    ]
}


// Prototype code for simulating outcomes of multiple dice

let die1, die2 = RED_DIE

let outcomeList = die1.sides.map( (v,i) => {
    return die2.sides.map( (e,j) => {
        return e.map( (x,y) => {
            return x+v[y]
        })
    })
}).flat()


// Prototype code for determining how many outcomes meet a target threshold

let target = 2
let breaks = 4

let iv = 0 // Initial value
let numSuccesses = outcomeList.reduce( (acc, curr) => {
    let pow = curr[0]
    let pot = curr[1]

    let ex = pot > breaks ? breaks : pot
    return pow + ex >= target ? acc+1 : acc
}, 0)

let successPcnt = numSuccesses/outcomeList.length

console.log(successPcnt)