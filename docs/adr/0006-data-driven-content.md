# ADR 0006: Data-Driven Content Files

## Status
Accepted

## Context
Game content (materials, recipes, factory types) will change frequently during balancing and expansion. We want to make it easy to modify content without touching engine code.

## Decision
Store game content as data files in `/src/data`:
- `materials.ts` - Material definitions (id, name, type, tier, icon, reward)
- `recipes.ts` - Recipe configurations (inputs, outputs, costs, unlock status)
- `factoryTypes.ts` - Factory definitions (production, costs, evolution chains)

Content loaded into engine at initialization via `loadMaterials()`, `loadRecipes()`, `loadFactoryTypes()`.

## Consequences

### Positive
- Content designers don't need to modify engine code
- Easy to add new materials/recipes/factories
- Version control friendly (clear diffs)
- Can load different content sets for testing
- Balancing changes isolated from logic changes

### Negative
- Content must conform to TypeScript interfaces
- Can't easily hot-reload content in production
- Need to rebuild to see content changes

## Implementation Notes
All content strongly typed with interfaces in `/src/core/types`.

Example pattern:
```typescript
export const materials: Material[] = [
  { id: 'seed', name: 'Seed', type: 'raw', tier: 0, icon: '🌱', reward: 1 }
];
```

Content loaded in `useGameEngine` hook before game starts.
