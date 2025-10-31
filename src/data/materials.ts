import { Material } from '../core/types/Material';

export const materials: Material[] = [
  {
    id: 'seed',
    name: 'Seed',
    type: 'raw',
    tier: 0,
    icon: '🌱',
    reward: 0,
  },
  {
    id: 'tree',
    name: 'Tree',
    type: 'processed',
    tier: 1,
    icon: '🌳',
    reward: 20,
  },
  {
    id: 'lumber',
    name: 'Lumber',
    type: 'processed',
    tier: 2,
    icon: '🪵',
    reward: 50,
  },
  {
    id: 'furniture',
    name: 'Furniture',
    type: 'product',
    tier: 3,
    icon: '🪑',
    reward: 125,
  },
    {
    id: 'shack',
    name: 'Shack',
    type: 'product',
    tier: 4,
    icon: '🏚️',
    reward: 300,
  },
    {
    id: 'house',
    name: 'House',
    type: 'product',
    tier: 5,
    icon: '🏠',
    reward: 750,
  },
];
