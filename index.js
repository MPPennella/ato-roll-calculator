// Prototype dice property objects
var RED_DIE = {
    sides: [
        [0, 0, 1],
        [0, 1, 0],
        [1, 0, 0],
        [1, 1, 0],
        [1, 1, 0],
        [2, 0, 1],
    ]
};
var BLACK_DIE = {
    sides: [
        [0, 1, 1],
        [1, 1, 0],
        [2, 0, 1],
        // [0,0,0], //unknown values for this side
        [2, 1, 0],
        [2, 2, 0],
    ]
};
var WHITE_DIE = {
    sides: [
        [1, 2, 1],
        // [0,0,0], //unknown values for this side
        // [0,0,0], //unknown values for this side
        // [0,0,0], //unknown values for this side
        [1, 3, 0],
        [3, 2, 1],
    ]
};
// Prototype code for simulating outcomes of multiple dice
var die1, die2 = RED_DIE;
var outcomeList = die1.sides.map(function (v, i) {
    return die2.sides.map(function (e, j) {
        return e.map(function (x, y) {
            return x + v[y];
        });
    });
}).flat();
// Prototype code for determining how many outcomes meet a target threshold
var target = 2;
var breaks = 4;
var iv = 0; // Initial value
var numSuccesses = outcomeList.reduce(function (acc, curr) {
    var pow = curr[0];
    var pot = curr[1];
    var ex = pot > breaks ? breaks : pot;
    return pow + ex >= target ? acc + 1 : acc;
}, 0);
var successPcnt = numSuccesses / outcomeList.length;
console.log(successPcnt);
