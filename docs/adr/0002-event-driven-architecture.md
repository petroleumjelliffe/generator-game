# ADR 0002: Event-Driven Architecture for State Synchronization

## Status
Accepted

## Context
The UI needs to stay synchronized with game state changes. We need a way for the game engine to notify the UI without being coupled to it.

## Decision
Use an event-driven pub/sub pattern:
- `GameEngine` extends a custom `EventEmitter` class
- Game systems emit events when state changes occur
- UI components subscribe to specific events they care about
- Events include: `grid:updated`, `crafting:completed`, `order:fulfilled`, `score:updated`, etc.

## Consequences

### Positive
- Clean decoupling between game logic and UI
- Multiple listeners can subscribe to the same event
- Easy to add new listeners without modifying the engine
- Simple custom EventEmitter (31 lines) vs external dependencies
- Natural fit for React's state updates

### Negative
- Event names are strings (typo-prone, though TypeScript helps)
- Debugging event flow can be harder than direct function calls
- Must remember to clean up listeners to avoid memory leaks

## Implementation Notes
```typescript
// Engine emits
this.emit('crafting:completed', { job, materialId });

// UI subscribes
engine.on('grid:updated', updateState);
```

All event cleanup handled in `useGameEngine` hook's cleanup function.
