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
    cost: 0, // Free/starting recipe
  },
  {
    id: 'tree-to-lumber',
    inputs: [
      { materialId: 'tree', quantity: 2 },
    ],
    output: { materialId: 'lumber', quantity: 1 },
    duration: 0, // Instant for now
    unlocked: false,
    cost: 20, // User can adjust
  },
  {
    id: 'lumber-to-furniture',
    inputs: [
      { materialId: 'lumber', quantity: 2 },
    ],
    output: { materialId: 'furniture', quantity: 1 },
    duration: 0, // Instant for now
    unlocked: false,
    cost: 40, // User can adjust
  },
  {
    id: 'furniture-to-shack',
    inputs: [
      { materialId: 'furniture', quantity: 2 },
    ],
    output: { materialId: 'shack', quantity: 1 },
    duration: 0, // Instant for now
    unlocked: false,
    cost: 80, // User can adjust
  },
  {
    id: 'shack-to-house',
    inputs: [
      { materialId: 'shack', quantity: 2 },
    ],
    output: { materialId: 'house', quantity: 1 },
    duration: 0, // Instant for now
    unlocked: false,
    cost: 160, // User can adjust
  },
];
