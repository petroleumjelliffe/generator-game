import { useState, useEffect, useRef } from 'react';
import { GameEngine, GameConfig } from '../../../core/GameEngine';
import { GameState } from '../../../core/types/GameState';
import { materials } from '../../../data/materials';
import { recipes } from '../../../data/recipes';
import { factoryTypes } from '../../../data/factoryTypes';
import { SaveSystem } from '../../../core/systems/SaveSystem';

const defaultConfig: GameConfig = {
  gridWidth: 8,
  gridHeight: 6,
  orderConfig: {
    maxActiveOrders: 4,
    baseReward: 10, //TODO: remove global base reward
    orderSlotBaseCost: 150, // Base cost for first order slot unlock
    orderSlotCostMultiplier: 5, // Each unlock costs 5x the previous
  },
  // factoryConfig removed - costs are now per factory type in factoryTypes.ts
  spawnInterval: 3000, // TODO: remove, this is rdeprecated  seconds
  startingScore: 0, // Start with 0 points
  cellUnlockBaseCost: 20, // Base cost for first cell unlock
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

    // Subscribe to events first
    const updateState = () => setGameState(engine.getState());

    engine.on('grid:updated', updateState);
    engine.on('crafting:started', updateState);
    engine.on('crafting:completed', updateState);
    engine.on('order:added', updateState);
    engine.on('order:fulfilled', updateState);
    engine.on('score:changed', updateState);
    engine.on('material:spawned', updateState);
    engine.on('factory:spawned', updateState);

    // Check if there's a saved game
    const savedGame = SaveSystem.load();

    if (savedGame) {
      // Try to load from save, but catch any errors and start fresh if corrupted
      try {
        engine.loadSaveData({
          score: savedGame.gameState.score,
          cellsUnlocked: savedGame.cellsUnlocked,
          factoryPurchaseCounts: savedGame.factoryPurchaseCounts,
          unlockedRecipes: savedGame.gameState.knownRecipes,
          factories: savedGame.gameState.factories,
          grid: savedGame.gameState.grid,
          orders: savedGame.gameState.orders || [],
          unlockedOrderSlots: savedGame.gameState.unlockedOrderSlots || 1,
        });
      } catch (error) {
        console.error('Failed to load save data, starting fresh:', error);
        // Clear corrupted save
        SaveSystem.clear();
        // Start new game
        const startingGarden = engine.createFreeGarden();
        if (startingGarden) {
          const centerX = Math.floor(config.gridWidth / 2) - 1;
          const centerY = Math.floor(config.gridHeight / 2);
          engine.placeFactory(startingGarden.id, { x: centerX, y: centerY });
        }
      }
    } else {
      // New game - give player 1 starting Garden factory (free)
      const startingGarden = engine.createFreeGarden();
      if (startingGarden) {
        // Place it on one of the starting cells (center-left)
        const centerX = Math.floor(config.gridWidth / 2) - 1;
        const centerY = Math.floor(config.gridHeight / 2);
        engine.placeFactory(startingGarden.id, { x: centerX, y: centerY });
      }
    }

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

  // Autosave game state
  useEffect(() => {
    if (!gameState || !engineRef.current) return;

    // Debounce saves to avoid excessive localStorage writes
    const saveTimeout = setTimeout(() => {
      SaveSystem.save({
        version: '1.0.0',
        timestamp: Date.now(),
        gameState,
        factoryPurchaseCounts: engineRef.current!.getFactoryPurchaseCounts(),
        cellsUnlocked: engineRef.current!.getCellsUnlockedCount(),
      });
    }, 1000); // Save 1 second after last state change

    return () => clearTimeout(saveTimeout);
  }, [gameState]);

  return {
    engine: engineRef.current,
    gameState,
  };
}
