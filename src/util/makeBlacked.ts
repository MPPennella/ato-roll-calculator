import { PowerDieFace } from "../types";

/**
 * Function that converts the results of throwing each face of a PowerDie to account for that die being under the 
 * effect of a Black Token reroll. The effect gives an extra break to that die, which effectively means any face 
 * with a Potential loses one and has an extra Power instead.
 * 
 * @param inputFaces Array of PowerDieFaces to be Blacked
 * @returns New Array of PowerDieFaces with face totals adjusted to account for the Black effect (converts a potential to power)
 */
export default function makeBlacked ( inputFaces:Array<PowerDieFace> ) : Array<PowerDieFace> {
    // Map over faces to apply Black effects
    const blackedDieFaces:Array<PowerDieFace> = inputFaces.map( (face:PowerDieFace) => {
        // If at least one potential, convert a potential to a power
        if (face.potential >= 1) {
            return {
                power: face.power+1,
                potential: face.potential-1,
                dot: face.dot
            }
        } else {
            return face
        }
    })

    return blackedDieFaces
}
