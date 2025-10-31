import { FactoryType } from '../core/types/Factory';

export const factoryTypes: FactoryType[] = [
  {
    id: 'garden',
    name: 'Garden',
    icon: '🌱',
    outputMaterialId: 'seed',
    productionInterval: 5000, // 5 seconds
    tier: 1,
    evolvesFrom: null,
    evolvesInto: 'tree-farm',
    baseCost: 750/1.2,
    costMultiplier: 1.2,
  },
  {
    id: 'tree-farm',
    name: 'Tree Farm',
    icon: '🌳',
    outputMaterialId: 'tree',
    productionInterval: 7000, // 7 seconds
    tier: 2,
    evolvesFrom: 'garden',
    evolvesInto: 'sawmill',
    baseCost: 1500,
    costMultiplier: 1.25,
  },
  {
    id: 'sawmill',
    name: 'Sawmill',
    icon: '🪵',
    outputMaterialId: 'lumber',
    productionInterval: 10000, // 10 seconds
    tier: 3,
    evolvesFrom: 'tree-farm',
    evolvesInto: 'workshop',
    baseCost: 3000,
    costMultiplier: 1.3,
  },
  {
    id: 'workshop',
    name: 'Workshop',
    icon: '🪑',
    outputMaterialId: 'furniture',
    productionInterval: 15000, // 15 seconds
    tier: 4,
    evolvesFrom: 'sawmill',
    evolvesInto: 'construction-site',
    baseCost: 6000,
    costMultiplier: 1.35,
  },
  {
    id: 'construction-site',
    name: 'Construction Site',
    icon: '🏚️',
    outputMaterialId: 'shack',
    productionInterval: 20000, // 20 seconds
    tier: 5,
    evolvesFrom: 'workshop',
    evolvesInto: 'housing-complex',
    baseCost: 12000,
    costMultiplier: 1.4,
  },
  {
    id: 'housing-complex',
    name: 'Housing Complex',
    icon: '🏠',
    outputMaterialId: 'house',
    productionInterval: 30000, // 30 seconds
    tier: 6,
    evolvesFrom: 'construction-site',
    evolvesInto: null, // Max tier
    baseCost: 24000,
    costMultiplier: 1.5,
  },
];
