import { GridState } from './Grid';
import { CraftingJob } from './Recipe';
import { Order } from './Order';

export interface GameState {
  grid: GridState;
  craftingJobs: CraftingJob[];
  orders: Order[];
  score: number;
  knownRecipes: string[]; // recipe IDs
  time: number; // game time in milliseconds
}
