import { Factory, FactoryType } from '../types/Factory';
import { GridPosition } from '../types/Grid';
import { GridSystem } from './GridSystem';

// Config for output cell costs
export interface FactoryConfig {
  outputCellBaseCost: number;
  outputCellCostMultiplier: number;
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
  private factoryPurchaseCounts: Map<string, number> = new Map(); // Track purchases per type
  private config: FactoryConfig;

  constructor(config?: FactoryConfig) {
    this.config = config || {
      outputCellBaseCost: 20,
      outputCellCostMultiplier: 1.5,
    };
  }

  // Load factory type definitions
  addFactoryType(type: FactoryType): void {
    this.factoryTypes.set(type.id, type);
  }

  addFactoryTypes(types: FactoryType[]): void {
    types.forEach(type => this.addFactoryType(type));
  }

  // Factory cost calculation - uses per-type costs
  getFactoryCost(typeId: string): number {
    const factoryType = this.factoryTypes.get(typeId);
    if (!factoryType) return 0;

    const purchaseCount = this.factoryPurchaseCounts.get(typeId) || 0;
    return Math.round(factoryType.baseCost * Math.pow(factoryType.costMultiplier, purchaseCount));
  }

  // Factory purchasing (any type)
  purchaseFactory(typeId: string): Factory | null {
    const factoryType = this.factoryTypes.get(typeId);
    if (!factoryType) return null;

    const factory: Factory = {
      id: `factory-${this.nextFactoryId++}`,
      typeId,
      position: null, // Not placed yet
      lastProducedTime: 0,
      nextProduceTime: 0,
      outputOffsets: [], // Start with no outputs, player must purchase them
    };

    this.factories.set(factory.id, factory);

    // Increment purchase count for this type
    const currentCount = this.factoryPurchaseCounts.get(typeId) || 0;
    this.factoryPurchaseCounts.set(typeId, currentCount + 1);

    return factory;
  }

  // Output cell management
  getOutputCellCost(factoryId: string): number {
    const factory = this.factories.get(factoryId);
    if (!factory) return 0;

    const outputCount = factory.outputOffsets.length;
    return Math.round(this.config.outputCellBaseCost * Math.pow(this.config.outputCellCostMultiplier, outputCount));
  }

  // Check if an offset is valid (within 3x3 radius, not the factory position itself)
  isValidOutputOffset(offset: GridPosition): boolean {
    // Must be within 3x3 radius (1 cell in each direction)
    if (Math.abs(offset.x) > 1 || Math.abs(offset.y) > 1) return false;
    // Cannot be the factory position itself (0,0)
    if (offset.x === 0 && offset.y === 0) return false;
    return true;
  }

  // Check if factory already has this output offset
  hasOutputOffset(factoryId: string, offset: GridPosition): boolean {
    const factory = this.factories.get(factoryId);
    if (!factory) return false;

    return factory.outputOffsets.some(o => o.x === offset.x && o.y === offset.y);
  }

  // Add output offset to factory
  addOutputOffset(factoryId: string, offset: GridPosition): boolean {
    const factory = this.factories.get(factoryId);
    if (!factory) return false;

    if (!this.isValidOutputOffset(offset)) return false;
    if (this.hasOutputOffset(factoryId, offset)) return false;

    factory.outputOffsets.push({ x: offset.x, y: offset.y });
    return true;
  }

  // Get all purchasable output offsets for a factory (within 3x3, not already owned)
  getPurchasableOutputOffsets(factoryId: string): GridPosition[] {
    const factory = this.factories.get(factoryId);
    if (!factory) return [];

    const allOffsets: GridPosition[] = [
      { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
      { x: -1, y: 0 },                   { x: 1, y: 0 },
      { x: -1, y: 1 },  { x: 0, y: 1 },  { x: 1, y: 1 },
    ];

    return allOffsets.filter(offset => !this.hasOutputOffset(factoryId, offset));
  }

  // Get absolute positions of factory's output cells
  getOutputPositions(factoryId: string): GridPosition[] {
    const factory = this.factories.get(factoryId);
    if (!factory || !factory.position) return [];

    return factory.outputOffsets.map(offset => ({
      x: factory.position!.x + offset.x,
      y: factory.position!.y + offset.y,
    }));
  }

  // Legacy method for initial garden
  purchaseGarden(): Factory | null {
    return this.purchaseFactory('garden');
  }

  // Factory placement and movement
  placeFactory(factoryId: string, position: GridPosition, gridSystem: GridSystem, currentTime: number = 0): boolean {
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

    // Initialize production timer when first placed
    if (factory.nextProduceTime === 0) {
      const factoryType = this.factoryTypes.get(factory.typeId);
      if (factoryType) {
        factory.nextProduceTime = currentTime + factoryType.productionInterval;
        factory.lastProducedTime = currentTime;
      }
    }

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

    // Create evolved factory - inherits output offsets from both factories
    const combinedOffsets = [...factory1.outputOffsets];
    for (const offset of factory2.outputOffsets) {
      if (!combinedOffsets.some(o => o.x === offset.x && o.y === offset.y)) {
        combinedOffsets.push(offset);
      }
    }

    const evolvedFactory: Factory = {
      id: `factory-${this.nextFactoryId++}`,
      typeId: evolvedType.id,
      position: targetPosition,
      lastProducedTime: 0,
      nextProduceTime: 0,
      outputOffsets: combinedOffsets,
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

      // Skip factories with no output cells
      if (factory.outputOffsets.length === 0) continue;

      const type = this.factoryTypes.get(factory.typeId);
      if (!type) continue;

      // Initialize production time if first run
      if (factory.nextProduceTime === 0) {
        factory.nextProduceTime = currentTime + type.productionInterval;
      }

      // Check if it's time to produce
      if (currentTime >= factory.nextProduceTime) {
        // Try to spawn on an output cell
        const spawnPosition = this.findOutputSpawnPosition(factory, gridSystem);

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
        // If no spawn position available (all output cells occupied), factory backs up
        // (nextProduceTime stays the same, so it will retry immediately when a cell is free)
      }
    }

    return results;
  }

  // Find an available output cell to spawn material
  private findOutputSpawnPosition(factory: Factory, gridSystem: GridSystem): GridPosition | null {
    if (!factory.position) return null;

    // Shuffle output offsets for randomness
    const shuffled = [...factory.outputOffsets].sort(() => Math.random() - 0.5);

    for (const offset of shuffled) {
      const checkPos: GridPosition = {
        x: factory.position.x + offset.x,
        y: factory.position.y + offset.y,
      };

      // Check if position is valid and empty (not locked check needed - all cells are free now)
      if (gridSystem.isCellAvailableForOutput(checkPos)) {
        return checkPos;
      }
    }

    return null; // All output cells are occupied - factory backs up
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

    // Calculate progress based on actual scheduled production time
    // This accounts for any speedups from tapping
    const elapsed = currentTime - factory.lastProducedTime;
    const total = factory.nextProduceTime - factory.lastProducedTime;

    // Avoid division by zero
    if (total <= 0) return 1;

    return Math.min(1, elapsed / total);
  }

  // Get factory purchase counts for save system
  getFactoryPurchaseCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.factoryPurchaseCounts.forEach((count, typeId) => {
      counts[typeId] = count;
    });
    return counts;
  }

  // Restore factory purchase counts from save data
  setFactoryPurchaseCounts(counts: Record<string, number>): void {
    this.factoryPurchaseCounts.clear();
    Object.entries(counts).forEach(([typeId, count]) => {
      this.factoryPurchaseCounts.set(typeId, count);
    });
  }

  // Restore a factory from save data
  restoreFactory(savedFactory: Factory, currentTime: number): Factory {
    // Ensure outputOffsets exists (for backwards compatibility with old saves)
    if (!savedFactory.outputOffsets) {
      savedFactory.outputOffsets = [];
    }

    // Reset production timers to current time (old timestamps are stale)
    const factoryType = this.factoryTypes.get(savedFactory.typeId);
    if (factoryType && savedFactory.position) {
      // Factory is on grid - restart production
      savedFactory.lastProducedTime = currentTime;
      savedFactory.nextProduceTime = currentTime + factoryType.productionInterval;
    } else {
      // Factory not placed yet - reset timers
      savedFactory.lastProducedTime = 0;
      savedFactory.nextProduceTime = 0;
    }

    // Add factory to the system
    this.factories.set(savedFactory.id, savedFactory);

    // Update next factory ID to avoid collisions
    const factoryIdNum = parseInt(savedFactory.id.replace('factory-', ''));
    if (!isNaN(factoryIdNum) && factoryIdNum >= this.nextFactoryId) {
      this.nextFactoryId = factoryIdNum + 1;
    }

    return savedFactory;
  }

  // Speed up factory production by reducing next produce time
  speedUpFactory(factoryId: string, speedUpAmount: number): boolean {
    const factory = this.factories.get(factoryId);
    if (!factory) return false;

    // Can only speed up if factory is actively producing
    if (factory.nextProduceTime === 0) return false;

    // Reduce next produce time, but don't let it go below current time
    factory.nextProduceTime = Math.max(
      factory.lastProducedTime,
      factory.nextProduceTime - speedUpAmount
    );

    return true;
  }
}
