# ADR 0004: Exponential Cost Scaling for All Progressions

## Status
Accepted

## Context
We need a progression system that:
- Prevents players from unlocking everything too quickly
- Creates meaningful late-game goals
- Feels fair and balanced throughout gameplay
- Is mathematically predictable for balancing

## Decision
Use exponential cost scaling for all unlock mechanics:
- Formula: `baseCost * multiplier^count`
- Applied to:
  - Cell unlocks: `20 * 1.2^cellsUnlocked`
  - Order slots: `150 * 5^(slotNum-1)`
  - Factories: `baseCost * costMultiplier^purchaseCount` (per type)

## Consequences

### Positive
- Creates natural progression curve
- Late game becomes challenging without being impossible
- Consistent feeling across all progression systems
- Easy to tune by adjusting base costs and multipliers
- Mathematically predictable for balance testing

### Negative
- Can feel punishing if multipliers too high
- May require rebalancing after playtesting
- Early game mistakes more costly (can't unlock everything)

## Implementation Notes
Each factory type has its own multiplier in data files:
- Garden: 1.2x
- Tree Farm: 1.25x
- Sawmill: 1.3x
- Workshop: 1.35x
- Construction Site: 1.4x

Cell and order slot multipliers configured in game config.
