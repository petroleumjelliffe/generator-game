import { CraftingJob } from '../types/Recipe';
import { GridPosition } from '../types/Grid';
import { GridSystem } from './GridSystem';
import { RecipeManager } from './RecipeManager';

export class CraftingSystem {
  private craftingJobs: CraftingJob[] = [];
  private nextJobId = 0;

  constructor(
    private gridSystem: GridSystem,
    private recipeManager: RecipeManager
  ) {}

  startCrafting(positions: GridPosition[], currentTime: number): CraftingJob | null {
    // Get materials at positions
    const materials: string[] = [];
    for (const pos of positions) {
      const materialId = this.gridSystem.getMaterialAt(pos);
      if (!materialId) {
        return null; // Invalid position or empty cell
      }
      const cell = this.gridSystem.getCell(pos);
      if (cell?.inUse) {
        return null; // Cell already in use
      }
      materials.push(materialId);
    }

    // Find matching recipe
    const recipe = this.recipeManager.findRecipeByInputs(materials);
    if (!recipe) {
      return null; // No matching recipe
    }

    // Mark cells as in use
    positions.forEach(pos => {
      this.gridSystem.setCellInUse(pos, true);
    });

    // Create crafting job
    const job: CraftingJob = {
      id: `job-${this.nextJobId++}`,
      recipeId: recipe.id,
      startTime: currentTime,
      duration: recipe.duration,
      sourcePositions: positions,
      outputPosition: positions[positions.length - 1], // Place result at last position (drop target)
    };

    this.craftingJobs.push(job);
    return job;
  }

  updateCraftingJobs(currentTime: number): CraftingJob[] {
    const completedJobs: CraftingJob[] = [];

    this.craftingJobs = this.craftingJobs.filter(job => {
      const elapsed = currentTime - job.startTime;
      if (elapsed >= job.duration) {
        completedJobs.push(job);
        return false; // Remove from active jobs
      }
      return true; // Keep active
    });

    return completedJobs;
  }

  completeCrafting(job: CraftingJob): string | null {
    const recipe = this.recipeManager.getRecipe(job.recipeId);
    if (!recipe) return null;

    // Remove materials from source positions
    job.sourcePositions.forEach(pos => {
      this.gridSystem.removeMaterialAt(pos);
    });

    // Place output material at output position
    const outputPosition = job.outputPosition || job.sourcePositions[0];
    this.gridSystem.setCell(outputPosition, recipe.output.materialId, false);

    return recipe.output.materialId;
  }

  getCraftingJobs(): CraftingJob[] {
    return [...this.craftingJobs];
  }

  getCraftingProgress(jobId: string, currentTime: number): number {
    const job = this.craftingJobs.find(j => j.id === jobId);
    if (!job) return 0;

    if (job.duration === 0) return 1; // Instant crafting

    const elapsed = currentTime - job.startTime;
    return Math.min(elapsed / job.duration, 1);
  }
}
