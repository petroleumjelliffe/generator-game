# ADR 0003: Composition of Systems Pattern

## Status
Accepted

## Context
The game has multiple domains (grid management, crafting, orders, scoring, factories). We need a way to organize this complexity that's maintainable and testable.

## Decision
Use composition over inheritance:
- `GameEngine` composes seven independent subsystems:
  - `GridSystem` - Spatial grid management
  - `MaterialManager` - Material definitions
  - `RecipeManager` - Recipe definitions and unlocking
  - `CraftingSystem` - Crafting job execution
  - `OrderSystem` - Order generation and fulfillment
  - `ScoringSystem` - Score tracking
  - `FactorySystem` - Factory management and production
- Each system handles a specific domain concern
- GameEngine acts as a facade/orchestrator
- Systems remain private to the engine

## Consequences

### Positive
- High cohesion within each system
- Low coupling between systems
- Easy to test each system independently
- Easy to add new systems without modifying existing ones
- Clear single responsibility for each system

### Negative
- More files to navigate
- Need to coordinate between systems through engine
- Some operations require touching multiple systems

## Implementation Notes
All systems initialized in `GameEngine` constructor. Public methods on GameEngine delegate to appropriate systems and coordinate cross-system operations.
