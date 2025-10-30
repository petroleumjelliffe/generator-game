import { Factory, FactoryType } from '../types/Factory';
import { GridPosition } from '../types/Grid';
import { GridSystem } from './GridSystem';

export interface FactoryConfig {
  maxSlots: number;
  slotBaseCost: number;
  slotCostMultiplier: number;
  gardenPurchaseCost: number;
}

interface SpawnResult {
  factoryId: string;
  materialId: string;
  spawnPosition: GridPosition;
}

export class FactorySystem {
  private factories: Map<string, Factory> = new Map();
  private factoryTypes: Map<string, FactoryType> = new Map();
  private nextFactoryId = 0;
  private config: FactoryConfig;
  private unlockedSlots: number = 1;

  constructor(config: FactoryConfig) {
    this.config = config;
  }

  // Load factory type definitions
  addFactoryType(type: FactoryType): void {
    this.factoryTypes.set(type.id, type);
  }

  addFactoryTypes(types: FactoryType[]): void {
    types.forEach(type => this.addFactoryType(type));
  }

  // Slot management
  getUnlockedSlots(): number {
    return this.unlockedSlots;
  }

  getMaxSlots(): number {
    return this.config.maxSlots;
  }

  canUnlockSlot(): boolean {
    return this.unlockedSlots < this.config.maxSlots;
  }

  getNextSlotCost(): number {
    const unlockCount = this.unlockedSlots - 1; // 0-indexed
    return Math.round(this.config.slotBaseCost * Math.pow(this.config.slotCostMultiplier, unlockCount));
  }

  unlockSlot(): boolean {
    if (!this.canUnlockSlot()) return false;
    this.unlockedSlots++;
    return true;
  }

  // Factory purchasing (only Gardens)
  purchaseGarden(): Factory | null {
    const gardenType = this.factoryTypes.get('garden');
    if (!gardenType) return null;

    const factory: Factory = {
      id: `factory-${this.nextFactoryId++}`,
      typeId: 'garden',
      position: null, // Starts in slot
      lastProducedTime: 0,
      nextProduceTime: 0,
    };

    this.factories.set(factory.id, factory);
    return factory;
  }

  // Factory placement and movement
  placeFactory(factoryId: string, position: GridPosition, gridSystem: GridSystem): boolean {
    const factory = this.factories.get(factoryId);
    if (!factory) return false;

    // Check if position is valid
    if (!gridSystem.isCellAvailable(position)) return false;
    if (gridSystem.getFactoryAt(position)) return false;

    // If factory is already placed, clear old position
    if (factory.position) {
      gridSystem.setFactoryAt(factory.position, null);
    }

    // Place factory at new position
    factory.position = position;
    gridSystem.setFactoryAt(position, factoryId);

    return true;
  }

  moveFactory(factoryId: string, position: GridPosition | null, gridSystem: GridSystem): boolean {
    const factory = this.factories.get(factoryId);
    if (!factory) return false;

    // Remove from current position
    if (factory.position) {
      gridSystem.setFactoryAt(factory.position, null);
    }

    // If position is null, move to slot (unplace)
    if (position === null) {
      factory.position = null;
      return true;
    }

    // Otherwise, place at new position
    return this.placeFactory(factoryId, position, gridSystem);
  }

  // Factory combining/evolution
  canCombine(factory1: Factory, factory2: Factory): boolean {
    // Must be same type
    if (factory1.typeId !== factory2.typeId) return false;

    // Must have evolution path
    const type = this.factoryTypes.get(factory1.typeId);
    return type !== undefined && type.evolvesInto !== null;
  }

  combineFactories(factory1Id: string, factory2Id: string, gridSystem: GridSystem): Factory | null {
    const factory1 = this.factories.get(factory1Id);
    const factory2 = this.factories.get(factory2Id);

    if (!factory1 || !factory2) return null;
    if (!this.canCombine(factory1, factory2)) return null;

    const type = this.factoryTypes.get(factory1.typeId);
    if (!type || !type.evolvesInto) return null;

    const evolvedType = this.factoryTypes.get(type.evolvesInto);
    if (!evolvedType) return null;

    // Create new evolved factory at factory2's position (drop target)
    const targetPosition = factory2.position;

    // Remove both old factories
    if (factory1.position) {
      gridSystem.setFactoryAt(factory1.position, null);
    }
    if (factory2.position) {
      gridSystem.setFactoryAt(factory2.position, null);
    }

    this.factories.delete(factory1Id);
    this.factories.delete(factory2Id);

    // Create evolved factory
    const evolvedFactory: Factory = {
      id: `factory-${this.nextFactoryId++}`,
      typeId: evolvedType.id,
      position: targetPosition,
      lastProducedTime: 0,
      nextProduceTime: 0,
    };

    this.factories.set(evolvedFactory.id, evolvedFactory);

    // Place evolved factory on grid if target was placed
    if (targetPosition) {
      gridSystem.setFactoryAt(targetPosition, evolvedFactory.id);
    }

    return evolvedFactory;
  }

  // Production logic
  updateFactories(currentTime: number, gridSystem: GridSystem): SpawnResult[] {
    const results: SpawnResult[] = [];

    for (const factory of this.factories.values()) {
      // Skip factories not on grid
      if (!factory.position) continue;

      const type = this.factoryTypes.get(factory.typeId);
      if (!type) continue;

      // Initialize production time if first run
      if (factory.nextProduceTime === 0) {
        factory.nextProduceTime = currentTime + type.productionInterval;
      }

      // Check if it's time to produce
      if (currentTime >= factory.nextProduceTime) {
        // Try to spawn on adjacent cell
        const spawnPosition = this.findAdjacentSpawnPosition(factory.position, gridSystem);

        if (spawnPosition) {
          // Spawn material
          results.push({
            factoryId: factory.id,
            materialId: type.outputMaterialId,
            spawnPosition,
          });

          // Schedule next production
          factory.lastProducedTime = currentTime;
          factory.nextProduceTime = currentTime + type.productionInterval;
        }
        // If no spawn position available, wait and try again next tick
        // (nextProduceTime stays the same, so it will retry immediately)
      }
    }

    return results;
  }

  private findAdjacentSpawnPosition(position: GridPosition, gridSystem: GridSystem): GridPosition | null {
    const adjacentOffsets = [
      { x: 0, y: -1 }, // up
      { x: 1, y: 0 },  // right
      { x: 0, y: 1 },  // down
      { x: -1, y: 0 }, // left
    ];

    // Shuffle offsets for randomness
    const shuffled = adjacentOffsets.sort(() => Math.random() - 0.5);

    for (const offset of shuffled) {
      const checkPos: GridPosition = {
        x: position.x + offset.x,
        y: position.y + offset.y,
      };

      // Check if position is valid and empty
      if (gridSystem.isCellAvailable(checkPos)) {
        return checkPos;
      }
    }

    return null; // No available adjacent cells
  }

  // Queries
  getFactory(factoryId: string): Factory | null {
    return this.factories.get(factoryId) || null;
  }

  getFactoryAt(position: GridPosition): Factory | null {
    for (const factory of this.factories.values()) {
      if (factory.position &&
          factory.position.x === position.x &&
          factory.position.y === position.y) {
        return factory;
      }
    }
    return null;
  }

  getFactories(): Factory[] {
    return Array.from(this.factories.values());
  }

  getPlacedFactories(): Factory[] {
    return Array.from(this.factories.values()).filter(f => f.position !== null);
  }

  getUnplacedFactories(): Factory[] {
    return Array.from(this.factories.values()).filter(f => f.position === null);
  }

  getFactoryType(typeId: string): FactoryType | null {
    return this.factoryTypes.get(typeId) || null;
  }

  getFactoryTypes(): FactoryType[] {
    return Array.from(this.factoryTypes.values());
  }

  // Get production progress (0-1)
  getProductionProgress(factoryId: string, currentTime: number): number {
    const factory = this.factories.get(factoryId);
    if (!factory) return 0;

    const type = this.factoryTypes.get(factory.typeId);
    if (!type) return 0;

    if (factory.nextProduceTime === 0) return 0;

    const elapsed = currentTime - factory.lastProducedTime;
    const total = type.productionInterval;

    return Math.min(1, elapsed / total);
  }
}
