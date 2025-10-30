import { GridState } from './Grid';
import { CraftingJob } from './Recipe';
import { Order } from './Order';
import { Factory } from './Factory';

export interface GameState {
  grid: GridState;
  craftingJobs: CraftingJob[];
  orders: Order[];
  score: number;
  knownRecipes: string[]; // recipe IDs
  time: number; // game time in milliseconds
  unlockedOrderSlots: number; // number of unlocked order slots
  maxOrderSlots: number; // total possible order slots
  factories: Factory[]; // all factories (placed and in slots)
  unlockedFactorySlots: number; // number of unlocked factory slots
  maxFactorySlots: number; // total possible factory slots
}
