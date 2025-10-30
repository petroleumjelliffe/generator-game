import { GridPosition } from './Grid';

export interface FactoryType {
  id: string;
  name: string;
  icon: string;
  outputMaterialId: string;
  productionInterval: number; // milliseconds between spawns
  tier: number;
  evolvesFrom: string | null; // typeId of factory this evolves from (2x required)
  evolvesInto: string | null; // typeId of factory this evolves into
}

export interface Factory {
  id: string; // unique instance ID
  typeId: string; // references FactoryType
  position: GridPosition | null; // null if in slot, position if on grid
  lastProducedTime: number;
  nextProduceTime: number;
}

export interface FactoryState {
  factories: Factory[];
  unlockedSlots: number;
  maxSlots: number;
}
