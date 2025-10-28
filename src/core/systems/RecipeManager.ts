import { Recipe } from '../types/Recipe';

export class RecipeManager {
  private recipes: Map<string, Recipe> = new Map();

  addRecipe(recipe: Recipe): void {
    this.recipes.set(recipe.id, recipe);
  }

  addRecipes(recipes: Recipe[]): void {
    recipes.forEach(recipe => this.addRecipe(recipe));
  }

  getRecipe(id: string): Recipe | undefined {
    return this.recipes.get(id);
  }

  getAllRecipes(): Recipe[] {
    return Array.from(this.recipes.values());
  }

  getUnlockedRecipes(): Recipe[] {
    return this.getAllRecipes().filter(recipe => recipe.unlocked);
  }

  unlockRecipe(id: string): boolean {
    const recipe = this.recipes.get(id);
    if (!recipe) return false;

    recipe.unlocked = true;
    return true;
  }

  findRecipeByInputs(materialIds: string[]): Recipe | null {
    // Sort input materials for comparison
    const sortedInputs = [...materialIds].sort();

    for (const recipe of this.recipes.values()) {
      if (!recipe.unlocked) continue;

      // Create a sorted array of required materials (with duplicates for quantity)
      const requiredMaterials: string[] = [];
      recipe.inputs.forEach(input => {
        for (let i = 0; i < input.quantity; i++) {
          requiredMaterials.push(input.materialId);
        }
      });
      requiredMaterials.sort();

      // Check if inputs match required materials
      if (sortedInputs.length === requiredMaterials.length &&
          sortedInputs.every((id, index) => id === requiredMaterials[index])) {
        return recipe;
      }
    }

    return null;
  }
}
