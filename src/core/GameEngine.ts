import { EventEmitter } from '../utils/EventEmitter';
import { GameState } from './types/GameState';
import { GridPosition, GridState, GridCell } from './types/Grid';
import { Material } from './types/Material';
import { Recipe } from './types/Recipe';
import { Factory, FactoryType } from './types/Factory';
import { Order } from './types/Order';
import { GridSystem } from './systems/GridSystem';
import { MaterialManager } from './systems/MaterialManager';
import { RecipeManager } from './systems/RecipeManager';
import { CraftingSystem } from './systems/CraftingSystem';
import { OrderSystem, OrderConfig } from './systems/OrderSystem';
import { ScoringSystem } from './systems/ScoringSystem';
import { FactorySystem, FactoryConfig } from './systems/FactorySystem';

export interface GameConfig {
  gridWidth: number;
  gridHeight: number;
  orderConfig: OrderConfig;
  factoryConfig?: FactoryConfig; // Optional - costs are now per factory type
  spawnInterval: number; // milliseconds between spawns
  startingScore?: number; // optional starting score
  cellUnlockBaseCost: number; // base cost for first cell unlock
  cellUnlockCostMultiplier: number; // multiplier applied to previous cost
}

export class GameEngine extends EventEmitter {
  private gridSystem: GridSystem;
  private materialManager: MaterialManager;
  private recipeManager: RecipeManager;
  private craftingSystem: CraftingSystem;
  private orderSystem: OrderSystem;
  private scoringSystem: ScoringSystem;
  private factorySystem: FactorySystem;

  private gameTime: number = 0;
  private config: GameConfig;
  private isRunning: boolean = false;
  private cellsUnlocked: number = 0; // track number of cells unlocked

  constructor(config: GameConfig) {
    super();
    this.config = config;

    // Initialize systems
    this.gridSystem = new GridSystem(config.gridWidth, config.gridHeight);
    this.materialManager = new MaterialManager();
    this.recipeManager = new RecipeManager();
    this.craftingSystem = new CraftingSystem(this.gridSystem, this.recipeManager);
    this.orderSystem = new OrderSystem(config.orderConfig);
    this.scoringSystem = new ScoringSystem();
    this.factorySystem = new FactorySystem(); // No config needed - costs are per factory type

    // Set starting score if provided
    if (config.startingScore && config.startingScore > 0) {
      this.scoringSystem.addScore(config.startingScore);
    }
  }

  // Initialization
  loadMaterials(materials: Material[]): void {
    this.materialManager.addMaterials(materials);
  }

  loadRecipes(recipes: Recipe[]): void {
    this.recipeManager.addRecipes(recipes);
  }

  loadFactoryTypes(factoryTypes: FactoryType[]): void {
    this.factorySystem.addFactoryTypes(factoryTypes);
  }

  start(): void {
    this.isRunning = true;
    this.emit('game:started');
  }

  stop(): void {
    this.isRunning = false;
    this.emit('game:stopped');
  }

  // Game loop
  tick(deltaTime: number): void {
    if (!this.isRunning) return;

    this.gameTime += deltaTime;

    // Update crafting jobs
    const completedJobs = this.craftingSystem.updateCraftingJobs(this.gameTime);
    completedJobs.forEach(job => {
      const materialId = this.craftingSystem.completeCrafting(job);
      if (materialId) {
        this.emit('crafting:completed', { job, materialId });
        this.emit('grid:updated', this.gridSystem.getGrid());
      }
    });

    // Update factories (spawn materials)
    const factorySpawns = this.factorySystem.updateFactories(this.gameTime, this.gridSystem);
    factorySpawns.forEach(spawn => {
      this.gridSystem.setCell(spawn.spawnPosition, spawn.materialId);
      this.emit('factory:spawned', spawn);
      this.emit('grid:updated', this.gridSystem.getGrid());
    });

    // Auto-spawn raw materials - DISABLED (factories handle spawning now)
    // if (this.gameTime - this.lastSpawnTime >= this.config.spawnInterval) {
    //   this.spawnRawMaterial();
    //   this.lastSpawnTime = this.gameTime;
    // }

    // Generate new orders if needed
    while (this.orderSystem.getOrders().length < this.config.orderConfig.maxActiveOrders) {
      // Only generate orders for materials that can be crafted with unlocked recipes
      const unlockedRecipes = this.recipeManager.getUnlockedRecipes();
      const craftableMaterialIds = new Set(unlockedRecipes.map(r => r.output.materialId));
      const craftableMaterials = this.materialManager.getAllMaterials().filter(m =>
        craftableMaterialIds.has(m.id)
      );

      const order = this.orderSystem.generateOrder(craftableMaterials, this.gameTime);
      if (order) {
        this.emit('order:added', order);
      } else {
        break;
      }
    }
  }

  // Actions
  startCrafting(positions: GridPosition[]): boolean {
    const job = this.craftingSystem.startCrafting(positions, this.gameTime);
    if (job) {
      this.emit('crafting:started', job);
      this.emit('grid:updated', this.gridSystem.getGrid());
      return true;
    }
    return false;
  }

  fulfillOrder(orderId: string, materialPosition: GridPosition): boolean {
    const order = this.orderSystem.getOrder(orderId);
    if (!order) return false;

    const materialId = this.gridSystem.getMaterialAt(materialPosition);
    if (!materialId) return false;

    const reward = this.orderSystem.fulfillOrder(orderId, materialId);
    if (reward > 0) {
      this.gridSystem.removeMaterialAt(materialPosition);
      this.scoringSystem.addScore(reward);
      this.emit('order:fulfilled', { orderId, reward });
      this.emit('score:changed', this.scoringSystem.getScore());
      this.emit('grid:updated', this.gridSystem.getGrid());
      return true;
    }

    return false;
  }

  spawnRawMaterial(): boolean {
    const rawMaterial = this.materialManager.getRandomRawMaterial();
    if (!rawMaterial) return false;

    const emptyCell = this.gridSystem.getRandomEmptyCell();
    if (!emptyCell) return false;

    this.gridSystem.setCell(emptyCell.position, rawMaterial.id, false);
    this.emit('material:spawned', { position: emptyCell.position, materialId: rawMaterial.id });
    this.emit('grid:updated', this.gridSystem.getGrid());
    return true;
  }

  spawnMaterialAt(position: GridPosition, materialId: string): boolean {
    // Check if position is valid and empty
    if (!this.gridSystem.isCellAvailable(position)) return false;

    this.gridSystem.setCell(position, materialId, false);
    this.emit('material:spawned', { position, materialId });
    this.emit('grid:updated', this.gridSystem.getGrid());
    return true;
  }

  moveMaterial(fromPosition: GridPosition, toPosition: GridPosition): boolean {
    // Check if source has a material
    const materialId = this.gridSystem.getMaterialAt(fromPosition);
    if (!materialId) return false;

    // Check if target is available (unlocked and empty)
    if (!this.gridSystem.isCellAvailable(toPosition)) return false;

    // Move the material
    this.gridSystem.removeMaterialAt(fromPosition);
    this.gridSystem.setCell(toPosition, materialId, false);

    this.emit('material:moved', { fromPosition, toPosition, materialId });
    this.emit('grid:updated', this.gridSystem.getGrid());
    return true;
  }

  unlockCell(position: GridPosition): boolean {
    // Check if cell is locked
    if (!this.gridSystem.isCellLocked(position)) return false;

    // Calculate cost based on number of unlocks
    const cost = this.getNextCellUnlockCost();

    // Check if player can afford
    if (!this.scoringSystem.canAfford(cost)) return false;

    // Spend points and unlock
    if (!this.scoringSystem.spendPoints(cost)) return false;
    if (!this.gridSystem.unlockCell(position)) return false;

    this.cellsUnlocked++;

    this.emit('cell:unlocked', { position, cost });
    this.emit('score:changed', this.scoringSystem.getScore());
    this.emit('grid:updated', this.gridSystem.getGrid());
    return true;
  }

  getNextCellUnlockCost(): number {
    // First unlock costs baseCost
    // Each subsequent unlock multiplies by the multiplier
    return Math.round(this.config.cellUnlockBaseCost * Math.pow(this.config.cellUnlockCostMultiplier, this.cellsUnlocked));
  }

  unlockRecipe(recipeId: string): boolean {
    const recipe = this.recipeManager.getRecipe(recipeId);
    if (!recipe || recipe.unlocked) return false;

    // Check if player can afford
    if (!this.scoringSystem.canAfford(recipe.cost)) return false;

    // Spend points and unlock
    if (!this.scoringSystem.spendPoints(recipe.cost)) return false;
    if (!this.recipeManager.unlockRecipe(recipeId)) return false;

    this.emit('recipe:unlocked', { recipeId, cost: recipe.cost });
    this.emit('score:changed', this.scoringSystem.getScore());
    return true;
  }

  unlockOrderSlot(): boolean {
    if (!this.orderSystem.canUnlockSlot()) return false;

    const cost = this.orderSystem.getNextSlotCost();
    if (!this.scoringSystem.canAfford(cost)) return false;

    // Spend points and unlock
    if (!this.scoringSystem.spendPoints(cost)) return false;
    if (!this.orderSystem.unlockSlot()) return false;

    this.emit('orderslot:unlocked', { cost });
    this.emit('score:changed', this.scoringSystem.getScore());
    return true;
  }

  getNextOrderSlotCost(): number {
    return this.orderSystem.getNextSlotCost();
  }

  // Factory management
  getFactoryCost(typeId: string): number {
    return this.factorySystem.getFactoryCost(typeId);
  }

  purchaseFactory(typeId: string): Factory | null {
    const cost = this.factorySystem.getFactoryCost(typeId);
    if (!this.scoringSystem.canAfford(cost)) return null;

    if (!this.scoringSystem.spendPoints(cost)) return null;

    const factory = this.factorySystem.purchaseFactory(typeId);
    if (!factory) return null;

    this.emit('factory:purchased', { factory, cost });
    this.emit('score:changed', this.scoringSystem.getScore());
    return factory;
  }

  // Create a free garden (for starting game)
  createFreeGarden(): Factory | null {
    return this.factorySystem.purchaseFactory('garden');
  }

  placeFactory(factoryId: string, position: GridPosition): boolean {
    const success = this.factorySystem.placeFactory(factoryId, position, this.gridSystem, this.gameTime);
    if (success) {
      this.emit('factory:placed', { factoryId, position });
      this.emit('grid:updated', this.gridSystem.getGrid());
    }
    return success;
  }

  moveFactory(factoryId: string, position: GridPosition | null): boolean {
    const success = this.factorySystem.moveFactory(factoryId, position, this.gridSystem);
    if (success) {
      this.emit('factory:moved', { factoryId, position });
      this.emit('grid:updated', this.gridSystem.getGrid());
    }
    return success;
  }

  combineFactories(factory1Id: string, factory2Id: string): Factory | null {
    const evolved = this.factorySystem.combineFactories(factory1Id, factory2Id, this.gridSystem);
    if (evolved) {
      this.emit('factory:combined', { factory1Id, factory2Id, evolved });
      this.emit('grid:updated', this.gridSystem.getGrid());
    }
    return evolved;
  }

  getFactory(factoryId: string): Factory | null {
    return this.factorySystem.getFactory(factoryId);
  }

  getFactoryAt(position: GridPosition): Factory | null {
    return this.factorySystem.getFactoryAt(position);
  }

  getFactories(): Factory[] {
    return this.factorySystem.getFactories();
  }

  getFactoryType(typeId: string): FactoryType | null {
    return this.factorySystem.getFactoryType(typeId);
  }

  getFactoryProductionProgress(factoryId: string): number {
    return this.factorySystem.getProductionProgress(factoryId, this.gameTime);
  }

  speedUpFactory(factoryId: string, speedUpAmount: number = 1000): boolean {
    return this.factorySystem.speedUpFactory(factoryId, speedUpAmount);
  }

  // State access
  getState(): Readonly<GameState> {
    return {
      grid: this.gridSystem.getGrid(),
      craftingJobs: this.craftingSystem.getCraftingJobs(),
      orders: this.orderSystem.getOrders(),
      score: this.scoringSystem.getScore(),
      knownRecipes: this.recipeManager.getUnlockedRecipes().map(r => r.id),
      time: this.gameTime,
      unlockedOrderSlots: this.orderSystem.getUnlockedSlots(),
      maxOrderSlots: this.orderSystem.getMaxSlots(),
      factories: this.factorySystem.getFactories(),
    };
  }

  getGrid() {
    return this.gridSystem.getGrid();
  }

  getOrders() {
    return this.orderSystem.getOrders();
  }

  getRecipes() {
    return this.recipeManager.getAllRecipes();
  }

  getMaterial(id: string) {
    return this.materialManager.getMaterial(id);
  }

  getScore() {
    return this.scoringSystem.getScore();
  }

  // Save/Load support
  getCellsUnlockedCount(): number {
    return this.cellsUnlocked;
  }

  getFactoryPurchaseCounts(): Record<string, number> {
    return this.factorySystem.getFactoryPurchaseCounts();
  }

  // Load saved game state
  loadSaveData(saveData: {
    score: number;
    cellsUnlocked: number;
    factoryPurchaseCounts: Record<string, number>;
    unlockedRecipes: string[];
    factories: Factory[];
    grid: GridState;
    orders: Order[];
    unlockedOrderSlots: number;
  }): void {
    // Restore score
    this.scoringSystem.addScore(saveData.score);

    // Restore cells unlocked count
    this.cellsUnlocked = saveData.cellsUnlocked;

    // Restore factory purchase counts
    this.factorySystem.setFactoryPurchaseCounts(saveData.factoryPurchaseCounts);

    // Restore unlocked recipes
    saveData.unlockedRecipes.forEach(recipeId => {
      this.recipeManager.unlockRecipe(recipeId);
    });

    // Restore order system (orders and unlocked slots)
    this.orderSystem.restoreState(saveData.orders, saveData.unlockedOrderSlots);

    // Restore grid (unlocked cells and materials)
    saveData.grid.cells.forEach((savedCell: GridCell) => {
      const currentCell = this.gridSystem.getCell(savedCell.position);
      if (currentCell) {
        // Unlock cells that were unlocked in the save
        if (!savedCell.locked && currentCell.locked) {
          this.gridSystem.unlockCell(savedCell.position);
        }
        // Restore materials on the grid
        if (savedCell.materialId) {
          this.gridSystem.setCell(savedCell.position, savedCell.materialId, savedCell.inUse);
        }
      }
    });

    // Restore factories
    saveData.factories.forEach(savedFactory => {
      // Re-create the factory in the factory system with current game time
      const factory = this.factorySystem.restoreFactory(savedFactory, this.gameTime);
      if (factory && savedFactory.position) {
        // Update grid to show factory at its position
        const cell = this.gridSystem.getCell(savedFactory.position);
        if (cell) {
          cell.factoryId = factory.id;
        }
      }
    });

    this.emit('save:loaded');
    this.emit('grid:updated', this.gridSystem.getGrid());
  }

  // Reset game to initial state
  reset(): void {
    this.gridSystem = new GridSystem(this.config.gridWidth, this.config.gridHeight);
    this.craftingSystem = new CraftingSystem(this.gridSystem, this.recipeManager);
    this.orderSystem = new OrderSystem(this.config.orderConfig);
    this.scoringSystem = new ScoringSystem();
    this.factorySystem = new FactorySystem();
    this.gameTime = 0;
    this.cellsUnlocked = 0;

    // Reload factory types
    this.emit('game:reset');
  }
}
