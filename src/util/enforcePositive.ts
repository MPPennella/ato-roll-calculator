// Returns only values that are zero or greater
// Returns same number as input if positive, zero otherwise
export default function enforcePositive(inputNum:number) : number {
    return inputNum > 0 ? inputNum : 0
}