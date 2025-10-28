import { Order } from '../types/Order';
import { Material } from '../types/Material';

export interface OrderConfig {
  maxActiveOrders: number;
  baseReward: number;
}

export class OrderSystem {
  private orders: Order[] = [];
  private nextOrderId = 0;
  private config: OrderConfig;

  constructor(config: OrderConfig) {
    this.config = config;
  }

  generateOrder(availableMaterials: Material[], currentTime: number): Order | null {
    if (this.orders.length >= this.config.maxActiveOrders) {
      return null;
    }

    // Filter for non-raw materials (processed and products)
    const craftableMaterials = availableMaterials.filter(m => m.type !== 'raw');
    if (craftableMaterials.length === 0) {
      return null;
    }

    // Pick random material
    const material = craftableMaterials[Math.floor(Math.random() * craftableMaterials.length)];

    // Calculate reward based on tier
    const reward = this.config.baseReward * (material.tier + 1);

    const order: Order = {
      id: `order-${this.nextOrderId++}`,
      materialId: material.id,
      quantity: 1, // Start with quantity 1 for simplicity
      reward,
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
}
