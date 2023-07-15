import PowerDiceData from './PowerDiceData.json'
import { PowerDie } from '../types/'

const PowerDice : Array<PowerDie> = PowerDiceData.data as Array<PowerDie>

// Assume data is in correct order, but verify color match
export const RED_DIE : PowerDie  = PowerDice[0].color === 'red' ? PowerDice[0] : {} as PowerDie
export const BLACK_DIE : PowerDie  = PowerDice[1].color === 'black' ? PowerDice[1] : {} as PowerDie
export const WHITE_DIE : PowerDie  = PowerDice[2].color === 'white' ? PowerDice[2] : {} as PowerDie