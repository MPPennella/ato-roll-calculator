import { PowerDie } from "./PowerDie"
import { PowerDieFace } from "./PowerDieFace"

export type PowerDieTracker = {
    id: number,
    die: PowerDie,
    activeFaceSet: Array<PowerDieFace>,
    component: React.JSX.Element
  }