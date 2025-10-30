import { useState, useEffect, useRef } from 'react';
import { GameEngine, GameConfig } from '../../../core/GameEngine';
import { GameState } from '../../../core/types/GameState';
import { materials } from '../../../data/materials';
import { recipes } from '../../../data/recipes';
import { factoryTypes } from '../../../data/factoryTypes';

const defaultConfig: GameConfig = {
  gridWidth: 8,
  gridHeight: 6,
  orderConfig: {
    maxActiveOrders: 4,
    baseReward: 10,
    orderSlotBaseCost: 150, // Base cost for first order slot unlock
    orderSlotCostMultiplier: 5, // Each unlock costs 5x the previous
  },
  factoryConfig: {
    maxSlots: 6,
    slotBaseCost: 100, // Base cost for first factory slot unlock
    slotCostMultiplier: 1.5, // Each unlock costs 1.5x the previous
    gardenPurchaseCost: 50, // Cost to purchase a Garden factory
  },
  spawnInterval: 3000, // 3 seconds
  startingScore: 0, // Start with 0 points
  cellUnlockBaseCost: 50, // Base cost for first cell unlock
  cellUnlockCostMultiplier: 1.2, // Each unlock costs 1.2x the previous
};

export function useGameEngine(config: GameConfig = defaultConfig) {
  const engineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const animationFrameRef = useRef<number>();
  const lastTickRef = useRef<number>(Date.now());

  // Initialize engine
  useEffect(() => {
    const engine = new GameEngine(config);
    engine.loadMaterials(materials);
    engine.loadRecipes(recipes);
    engine.loadFactoryTypes(factoryTypes);

    // Give player 1 starting Garden factory
    const startingGarden = engine.purchaseGarden();
    if (startingGarden) {
      // Place it on one of the starting cells (center-left)
      const centerX = Math.floor(config.gridWidth / 2) - 1;
      const centerY = Math.floor(config.gridHeight / 2);
      engine.placeFactory(startingGarden.id, { x: centerX, y: centerY });
    }

    // Subscribe to events
    const updateState = () => setGameState(engine.getState());

    engine.on('grid:updated', updateState);
    engine.on('crafting:started', updateState);
    engine.on('crafting:completed', updateState);
    engine.on('order:added', updateState);
    engine.on('order:fulfilled', updateState);
    engine.on('score:changed', updateState);
    engine.on('material:spawned', updateState);

    engineRef.current = engine;
    setGameState(engine.getState());
    engine.start();

    return () => {
      engine.stop();
      engine.clear();
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (!engineRef.current) return;

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = now - lastTickRef.current;
      lastTickRef.current = now;

      engineRef.current?.tick(deltaTime);
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    engine: engineRef.current,
    gameState,
  };
}
