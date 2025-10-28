import { useState, useEffect, useRef } from 'react';
import { GameEngine, GameConfig } from '../../../core/GameEngine';
import { GameState } from '../../../core/types/GameState';
import { materials } from '../../../data/materials';
import { recipes } from '../../../data/recipes';

const defaultConfig: GameConfig = {
  gridWidth: 8,
  gridHeight: 6,
  orderConfig: {
    maxActiveOrders: 4,
    baseReward: 10,
  },
  spawnInterval: 3000, // 3 seconds
  startingScore: 100, // Start with 100 points to unlock cells
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
