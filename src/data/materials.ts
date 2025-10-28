import { Material } from '../core/types/Material';

export const materials: Material[] = [
  {
    id: 'seed',
    name: 'Seed',
    type: 'raw',
    tier: 0,
    icon: '🌱',
  },
  {
    id: 'tree',
    name: 'Tree',
    type: 'processed',
    tier: 1,
    icon: '🌳',
  },
  {
    id: 'lumber',
    name: 'Lumber',
    type: 'processed',
    tier: 2,
    icon: '🪵',
  },
  {
    id: 'furniture',
    name: 'Furniture',
    type: 'product',
    tier: 3,
    icon: '🪑',
  },
    {
    id: 'shack',
    name: 'Shack',
    type: 'product',
    tier: 4,
    icon: '🏚️',
  },
    {
    id: 'house',
    name: 'House',
    type: 'product',
    tier: 5,
    icon: '🏠',
  },
];
