# ADR 0007: Factory Evolution System

## Status
Accepted

## Context
We want a meaningful progression system for factories that:
- Encourages upgrading rather than just buying more
- Creates long-term goals
- Makes spatial decisions matter (combining factories requires adjacency)

## Decision
Implement factory evolution chain:
- 5 factory tiers: Garden → Tree Farm → Sawmill → Workshop → Construction Site
- Combine 2 same-tier factories → 1 evolved factory (next tier)
- Each tier produces higher-tier materials faster
- Per-type purchase tracking increases costs exponentially
- Evolution combines purchase counts (maintains cost scaling)

Evolution performed via drag-and-drop combining.

## Consequences

### Positive
- Creates meaningful progression milestones
- Incentivizes strategic factory placement (room for combinations)
- Reduces grid clutter in late game (fewer higher-tier factories)
- Visual progression (different icons for each tier)
- Long-term planning required

### Negative
- Can lose factories if no space to combine
- Evolution is destructive (2 → 1, net loss of production slots)
- May confuse new players without tutorial

## Implementation Notes
Evolution chain defined in factory data:
```typescript
{
  id: 'tree-farm',
  evolvedFrom: 'garden',
  evolvedInto: 'sawmill',
  // ...
}
```

`FactorySystem.combineFactories()` handles evolution logic and purchase count merging.
