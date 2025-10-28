export interface Recipe {
  id: string;
  inputs: Array<{ materialId: string; quantity: number }>;
  output: { materialId: string; quantity: number };
  duration: number; // milliseconds, 0 for instant
  unlocked: boolean;
  cost: number; // points required to unlock this recipe
}

export interface CraftingJob {
  id: string;
  recipeId: string;
  startTime: number;
  duration: number;
  sourcePositions: Array<{ x: number; y: number }>;
  outputPosition?: { x: number; y: number }; // where to place result
}
