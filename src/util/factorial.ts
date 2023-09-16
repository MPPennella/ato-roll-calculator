/**
 * Basic recursive function to find factorial of positive or zero integer `input`.
 * Use of `lowerBound` optional paramter has the effect of returning *n*!/*b*!, where *n* is `input` and *b* is `lowerBound`
 * 
 * @param input Positive integer or zero
 * @param lowerBound Optional: Positive integer or zero that is less than or equal to `input`
 * @returns *n*! where *n* is `input`, or *n*!/*b*! where *b* is `lowerBound` if optional paramter is used,
 * NaN if invalid parameters passed
 */
 export default function factorial ( input:number, lowerBound:number = 0 ) : number {
    // Return NaN for bad input
    if ( input<0 || !Number.isInteger(input) || lowerBound > input ) return NaN

    // 1! and 0! = 1
    if ( input <= 1 || input === lowerBound ) return 1

    // Call recursively with n-1 as input and multiply by current input
    return input * (factorial(input-1, lowerBound))
}

    