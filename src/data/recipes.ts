import { Recipe } from '../core/types/Recipe';

export const recipes: Recipe[] = [
  {
    id: 'seed-to-tree',
    inputs: [
      { materialId: 'seed', quantity: 2 },
    ],
    output: { materialId: 'tree', quantity: 1 },
    duration: 0, // Instant for now
    unlocked: true,
  },
  {
    id: 'tree-to-lumber',
    inputs: [
      { materialId: 'tree', quantity: 2 },
    ],
    output: { materialId: 'lumber', quantity: 1 },
    duration: 0, // Instant for now
    unlocked: true,
  },
  {
    id: 'lumber-to-furniture',
    inputs: [
      { materialId: 'lumber', quantity: 2 },
    ],
    output: { materialId: 'furniture', quantity: 1 },
    duration: 0, // Instant for now
    unlocked: true,
  },
];
