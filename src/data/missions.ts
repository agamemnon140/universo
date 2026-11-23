import type { Mission } from '../types'
import missionsJson from './missions.json'

// Kept out of ./index so the dataset ships in the Missions tab's own chunk.
export const missions = missionsJson as Mission[]
