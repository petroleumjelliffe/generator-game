import { useState } from 'react';
import { Recipe } from '../../../core/types/Recipe';
import { GameEngine } from '../../../core/GameEngine';

interface RecipeBookProps {
  recipes: Recipe[];
  engine: GameEngine;
  currentScore: number;
  onBuyFactory?: (factoryTypeId: string) => void;
}

export function RecipeBook({ recipes, engine, currentScore, onBuyFactory }: RecipeBookProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleUnlock = (recipe: Recipe) => {
    if (!recipe.unlocked && currentScore >= recipe.cost) {
      engine.unlockRecipe(recipe.id);
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    // Only handle locked recipes (affordable ones can be unlocked)
    if (!recipe.unlocked) {
      handleUnlock(recipe);
    }
    // Newly unlocked recipes auto-fade after 3 seconds, no click needed
  };

  const handleBuyFactory = (e: React.MouseEvent, factoryTypeId: string) => {
    e.stopPropagation();
    if (onBuyFactory) {
      onBuyFactory(factoryTypeId);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="recipe-book">
      <div className="recipe-book-header" onClick={handleToggle}>
        <h3>Recipes</h3>
        <span className={`recipe-book-toggle ${isOpen ? 'open' : ''}`}>▼</span>
      </div>
      <div className={`recipe-list ${!isOpen ? 'collapsed' : ''}`}>
        {recipes.map((recipe) => {
          const output = engine.getMaterial(recipe.output.materialId);
          const inputs = recipe.inputs.map(input => ({
            material: engine.getMaterial(input.materialId),
            quantity: input.quantity,
          }));

          const canAfford = currentScore >= recipe.cost;
          const locked = !recipe.unlocked;

          const factoryType = recipe.factoryTypeId ? engine.getFactoryType(recipe.factoryTypeId) : null;
          const factoryCost = recipe.factoryTypeId ? engine.getFactoryCost(recipe.factoryTypeId) : 0;
          const canAffordFactory = currentScore >= factoryCost;

          return (
            <div
              key={recipe.id}
              className={`recipe-item ${locked ? 'recipe-locked' : 'recipe-unlocked'} ${
                locked && canAfford ? 'recipe-can-afford' : ''
              } ${locked && !canAfford ? 'recipe-cannot-afford' : ''}`}
              onClick={() => handleRecipeClick(recipe)}
              style={{
                cursor: locked && canAfford ? 'pointer' : 'default',
              }}
              title={
                locked
                  ? canAfford
                    ? `Click to unlock for ${recipe.cost} points`
                    : `Locked (need ${recipe.cost} points)`
                  : undefined
              }
            >
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
              {locked && (
                <div className="recipe-lock">
                  <span className="lock-emoji">🔒</span>
                  <span className="recipe-cost">{recipe.cost}</span>
                </div>
              )}
              {!locked && recipe.factoryTypeId && factoryType && (
                <button
                  className={`buy-factory-button ${canAffordFactory ? 'can-afford' : 'cannot-afford'}`}
                  onClick={(e) => handleBuyFactory(e, recipe.factoryTypeId!)}
                  disabled={!canAffordFactory}
                  title={canAffordFactory ? `Buy ${factoryType.name} for ${factoryCost} points` : `Need ${factoryCost} points`}
                >
                  <span className="factory-icon">{factoryType.icon}</span>
                  <span className="factory-cost">{factoryCost}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
