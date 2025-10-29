import { Order } from '../types/Order';
import { Material } from '../types/Material';

export interface OrderConfig {
  maxActiveOrders: number;
  baseReward: number;
  orderSlotBaseCost: number; // base cost for first order slot unlock
  orderSlotCostMultiplier: number; // multiplier applied to previous cost
}

export class OrderSystem {
  private orders: Order[] = [];
  private nextOrderId = 0;
  private config: OrderConfig;
  private unlockedSlots: number = 1; // start with 1 unlocked slot

  constructor(config: OrderConfig) {
    this.config = config;
  }

  generateOrder(availableMaterials: Material[], currentTime: number): Order | null {
    if (this.orders.length >= this.unlockedSlots) {
      return null;
    }

    // Filter for non-raw materials (processed and products)
    const craftableMaterials = availableMaterials.filter(m => m.type !== 'raw');
    if (craftableMaterials.length === 0) {
      return null;
    }

    // Pick random material
    const material = craftableMaterials[Math.floor(Math.random() * craftableMaterials.length)];

    const order: Order = {
      id: `order-${this.nextOrderId++}`,
      materialId: material.id,
      quantity: 1, // Start with quantity 1 for simplicity
      reward: material.reward,
      createdAt: currentTime,
    };

    this.orders.push(order);
    return order;
  }

  fulfillOrder(orderId: string, materialId: string): number {
    const orderIndex = this.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return 0;

    const order = this.orders[orderIndex];

    // Check if material matches
    if (order.materialId !== materialId) return 0;

    // Remove order and return reward
    this.orders.splice(orderIndex, 1);
    return order.reward;
  }

  getOrders(): Order[] {
    return [...this.orders];
  }

  getOrder(orderId: string): Order | undefined {
    return this.orders.find(o => o.id === orderId);
  }

  removeOrder(orderId: string): boolean {
    const index = this.orders.findIndex(o => o.id === orderId);
    if (index === -1) return false;

    this.orders.splice(index, 1);
    return true;
  }

  getUnlockedSlots(): number {
    return this.unlockedSlots;
  }

  getMaxSlots(): number {
    return this.config.maxActiveOrders;
  }

  canUnlockSlot(): boolean {
    return this.unlockedSlots < this.config.maxActiveOrders;
  }

  getNextSlotCost(): number {
    // First unlock (slot 2) costs baseCost
    // Each subsequent unlock multiplies by the multiplier
    // unlockedSlots starts at 1, so:
    // - Unlocking slot 2 (unlockedSlots=1): baseCost * multiplier^0 = baseCost
    // - Unlocking slot 3 (unlockedSlots=2): baseCost * multiplier^1
    // - Unlocking slot 4 (unlockedSlots=3): baseCost * multiplier^2
    const unlockCount = this.unlockedSlots - 1; // 0-indexed unlock count
    return Math.round(this.config.orderSlotBaseCost * Math.pow(this.config.orderSlotCostMultiplier, unlockCount));
  }

  unlockSlot(): boolean {
    if (!this.canUnlockSlot()) return false;
    this.unlockedSlots++;
    return true;
  }
}
