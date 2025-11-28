# Generator Game

A crafting/generator game where you combine materials into products to fulfill orders and earn points.

## Architecture

This project is built with a **framework-agnostic core** that can be used with different UI frameworks:

- **Core Game Engine** (`/src/core`) - Pure TypeScript game logic with no UI dependencies
- **UI Adapters** (`/src/adapters`) - Framework-specific implementations (React now, Phaser later)

### Core Systems

- **GridSystem** - Manages the material grid (no item stacking)
- **MaterialManager** - Handles material definitions
- **RecipeManager** - Manages crafting recipes
- **CraftingSystem** - Handles crafting jobs with duration support (currently set to 0)
- **OrderSystem** - Generates and manages orders
- **ScoringSystem** - Tracks player score

### Game Mechanics

1. **Materials** spawn automatically in the grid
2. **Drag and drop** two materials together to craft according to recipes
3. **Orders** appear at the top requesting specific items
4. **Drag materials** to orders to fulfill them and earn points

### Recipe Chain

```
🌱 Seed (raw) + 🌱 Seed → 🌳 Tree
🌳 Tree + 🌳 Tree → 🪵 Lumber
🪵 Lumber + 🪵 Lumber → 🪑 Furniture
```

## Architecture Decision Records

Key architectural decisions are documented in [Architecture Decision Records (ADRs)](/docs/adr/):

- [ADR 0001: Framework-Agnostic Core with UI Adapters](/docs/adr/0001-framework-agnostic-core.md)
- [ADR 0002: Event-Driven Architecture for State Synchronization](/docs/adr/0002-event-driven-architecture.md)
- [ADR 0003: Composition of Systems Pattern](/docs/adr/0003-system-composition-pattern.md)
- [ADR 0004: Exponential Cost Scaling for All Progressions](/docs/adr/0004-exponential-cost-scaling.md)
- [ADR 0005: State Persistence via LocalStorage](/docs/adr/0005-state-persistence-localstorage.md)
- [ADR 0006: Data-Driven Content Files](/docs/adr/0006-data-driven-content.md)
- [ADR 0007: Factory Evolution System](/docs/adr/0007-factory-evolution-system.md)

See the [ADR README](/docs/adr/README.md) for more information about our decision-making process.

## Setup

```bash
npm install
npm run dev
```

## Future Plans

- ✅ Add crafting duration (infrastructure ready, currently 0ms)
- Todo: Add warehouse system for bulk storage
- Todo: Migrate to Phaser for better visuals and animations
- Todo: Add more materials and complex recipes
- ✅ Recipe unlocking system

# Bugs and enhancements
- no click and drag on mobile
- money is spent on factories before confirming placement, and isnt' returned when canceling
- need a better highlight on items that have been unlocked
- restart game button needs to be less prominent
- make more space for orders across the top
- prevent vert scrolling on mobile (if possible)
