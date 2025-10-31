import { Recipe } from '../core/types/Recipe';

export const recipes: Recipe[] = [
  {
    id: 'generate-seeds',
    inputs: [], // No inputs - represents growing seeds from garden
    output: { materialId: 'seed', quantity: 1 },
    duration: 0, // Instant for now
    unlocked: true,
    cost: 0, // Free/starting recipe
    factoryTypeId: 'garden', // Garden produces seeds
  },
  {
    id: 'seed-to-tree',
    inputs: [
      { materialId: 'seed', quantity: 2 },
    ],
    output: { materialId: 'tree', quantity: 1 },
    duration: 0, // Instant for now
    unlocked: false,
    cost: 0, // Free/starting recipe
    factoryTypeId: 'tree-farm', // Tree Farm produces trees
  },
  {
    id: 'tree-to-lumber',
    inputs: [
      { materialId: 'tree', quantity: 2 },
    ],
    output: { materialId: 'lumber', quantity: 1 },
    duration: 0, // Instant for now
    unlocked: false,
    cost: 50,
    factoryTypeId: 'sawmill', // Sawmill produces lumber
  },
  {
    id: 'lumber-to-furniture',
    inputs: [
      { materialId: 'lumber', quantity: 2 },
    ],
    output: { materialId: 'furniture', quantity: 1 },
    duration: 0, // Instant for now
    unlocked: false,
    cost: 150,
    factoryTypeId: 'workshop', // Workshop produces furniture
  },
  {
    id: 'furniture-to-shack',
    inputs: [
      { materialId: 'furniture', quantity: 2 },
    ],
    output: { materialId: 'shack', quantity: 1 },
    duration: 0, // Instant for now
    unlocked: false,
    cost: 375,
    factoryTypeId: 'construction-site', // Construction Site produces shacks
  },
  {
    id: 'shack-to-house',
    inputs: [
      { materialId: 'shack', quantity: 2 },
    ],
    output: { materialId: 'house', quantity: 1 },
    duration: 0, // Instant for now
    unlocked: false,
    cost: 900,
    factoryTypeId: 'housing-complex', // Housing Complex produces houses
  },
];
