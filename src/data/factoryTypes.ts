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
  },
];
