import { GameState } from '../types/GameState';

export interface SaveData {
  version: string;
  timestamp: number;
  gameState: GameState;
  factoryPurchaseCounts: Record<string, number>;
  cellsUnlocked: number;
}

export class SaveSystem {
  private static SAVE_KEY = 'generator-game-save';
  private static CURRENT_VERSION = '2.0.0'; // Incremented for order system support

  static save(data: SaveData): boolean {
    try {
      const saveData = {
        ...data,
        version: this.CURRENT_VERSION,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  static load(): SaveData | null {
    try {
      const saved = localStorage.getItem(this.SAVE_KEY);
      if (!saved) return null;

      const data = JSON.parse(saved) as SaveData;

      // Validate version - clear incompatible old saves
      if (!data.version || data.version !== this.CURRENT_VERSION) {
        console.warn(`Incompatible save version (${data.version || 'unknown'}), clearing old save`);
        this.clear();
        return null;
      }

      // Validate required fields exist
      if (!data.gameState || !data.gameState.grid || !data.gameState.factories) {
        console.warn('Save data missing required fields, clearing corrupted save');
        this.clear();
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to load game, clearing corrupted save:', error);
      this.clear();
      return null;
    }
  }

  static clear(): boolean {
    try {
      localStorage.removeItem(this.SAVE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear save:', error);
      return false;
    }
  }

  static hasSave(): boolean {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }
}
