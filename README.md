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

## Setup

```bash
npm install
npm run dev
```

## Future Plans

- Add crafting duration (infrastructure ready, currently 0ms)
- Add warehouse system for bulk storage
- Migrate to Phaser for better visuals and animations
- Add more materials and complex recipes
- Recipe unlocking system
