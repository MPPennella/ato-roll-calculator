import { PowerDieFace } from "./PowerDieFace"

// Represents info a bout a specific die, with identifing ID, color type it belongs to, and what face was rolled
export type DieInfo = {
    id: number,
    color: string,
    face: PowerDieFace
}