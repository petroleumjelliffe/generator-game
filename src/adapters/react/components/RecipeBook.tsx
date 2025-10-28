import { Recipe } from '../../../core/types/Recipe';
import { GameEngine } from '../../../core/GameEngine';

interface RecipeBookProps {
  recipes: Recipe[];
  engine: GameEngine;
}

export function RecipeBook({ recipes, engine }: RecipeBookProps) {
  return (
    <div className="recipe-book">
      <h3>Recipes</h3>
      <div className="recipe-list">
        {recipes.map((recipe) => {
          const output = engine.getMaterial(recipe.output.materialId);
          const inputs = recipe.inputs.map(input => ({
            material: engine.getMaterial(input.materialId),
            quantity: input.quantity,
          }));

          return (
            <div key={recipe.id} className="recipe-item">
              <div className="recipe-inputs">
                {inputs.map((input, index) => (
                  <span key={index}>
                    {input.quantity} {input.material?.icon}
                  </span>
                ))}
              </div>
              <div className="recipe-arrow">→</div>
              <div className="recipe-output">
                {output?.icon} {output?.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
