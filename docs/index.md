# Generator Game Documentation

Welcome to the Generator Game documentation! This site contains architectural decision records and technical documentation for the project.

## Quick Links

- [Main Repository](https://github.com/petroleumjelliffe/generator-game)
- [Play the Game](https://petroleumjelliffe.github.io/generator-game/)

## Architecture Decision Records

Key architectural decisions are documented as ADRs:

- [ADR 0001: Framework-Agnostic Core with UI Adapters](adr/0001-framework-agnostic-core.md)
- [ADR 0002: Event-Driven Architecture for State Synchronization](adr/0002-event-driven-architecture.md)
- [ADR 0003: Composition of Systems Pattern](adr/0003-system-composition-pattern.md)
- [ADR 0004: Exponential Cost Scaling for All Progressions](adr/0004-exponential-cost-scaling.md)
- [ADR 0005: State Persistence via LocalStorage](adr/0005-state-persistence-localstorage.md)
- [ADR 0006: Data-Driven Content Files](adr/0006-data-driven-content.md)
- [ADR 0007: Factory Evolution System](adr/0007-factory-evolution-system.md)

See the [ADR README](adr/README.md) for more information about our decision-making process.

## About the Project

Generator Game is a crafting/generator game where you combine materials into products to fulfill orders and earn points.

### Core Architecture

The project is built with a **framework-agnostic core** that can be used with different UI frameworks:

- **Core Game Engine** (`/src/core`) - Pure TypeScript game logic with no UI dependencies
- **UI Adapters** (`/src/adapters`) - Framework-specific implementations (React now, Phaser later)

### Game Systems

- **GridSystem** - Manages the material grid (no item stacking)
- **MaterialManager** - Handles material definitions
- **RecipeManager** - Manages crafting recipes
- **CraftingSystem** - Handles crafting jobs with duration support
- **OrderSystem** - Generates and manages orders
- **ScoringSystem** - Tracks player score
- **FactorySystem** - Manages factories and production

## Contributing

When contributing to this project, please:

1. Follow the workflow defined in `.claude/instructions.md`
2. Create GitHub issues for bugs and enhancements
3. Work on feature branches (never commit to main)
4. Consider creating/updating ADRs for architectural decisions
5. Submit pull requests for review

## Tech Stack

- **TypeScript** - Type-safe development
- **React** - Current UI framework
- **Vite** - Build tooling
- **PWA** - Progressive Web App support
- **LocalStorage** - Game state persistence
