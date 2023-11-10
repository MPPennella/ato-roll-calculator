import { PowerDieTotal } from "../types";

/**
 * Calculates the total effective Power of a given dice roll after factoring in Break/Fire/Hope tokens modifiers
 * 
 * @param powerSummary PowerDieTotal, holding the total numbers of Power/Potentials/Dots rolled among the dice.
 * @param breakValue Integer, number of Break/Fire tokens available.
 * @param hopeValue Integer, number of Hope tokens available.
 * @returns Integer, total Power value after using as many tokens as able.
 */
export default function calcPower(powerSummary:PowerDieTotal, breakValue:number, hopeValue?:number) : number {
    // Get Power/Potential/Dot values from current power summary
    const {power: pow, potential:pot, dot} = powerSummary

    // Added power from Breaks/Fires/Hopes
    let extraPower = 0

    // Remaining unused Hopes
    let remHope = 0

    
    // Generate extra Power for each Dot up to the amount of Hopes, use Hopes on Dots before trying to use on Potentials
    if (hopeValue) {
        const usedHopes = dot > hopeValue ? hopeValue : dot
        remHope = hopeValue - usedHopes
        extraPower += usedHopes
    }

    // Generate extra Power for each Potential up to the amount of Breaks/Fires and unused Hopes
    extraPower += pot > breakValue + remHope ? breakValue + remHope : pot

    // Increase accumulator if total power is greater than or equal to target threshold
    return pow + extraPower
}