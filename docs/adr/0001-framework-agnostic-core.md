# ADR 0001: Framework-Agnostic Core with UI Adapters

## Status
Accepted

## Context
We need to build a game that may eventually use different UI frameworks (React now, potentially Phaser later for better visuals). We want to avoid tightly coupling game logic to any specific UI framework.

## Decision
Separate pure game logic from UI framework implementations:
- `/src/core` - Framework-agnostic TypeScript classes with no UI dependencies
- `/src/adapters` - Framework-specific implementations (React hooks, components)
- `GameEngine` extends `EventEmitter` for state change notifications
- UI adapters subscribe to engine events and translate them to framework-specific rendering

## Consequences

### Positive
- Game logic can be reused with different UI frameworks
- Easier to test game logic without UI dependencies
- Clear separation of concerns
- Migration to Phaser (future plan) won't require rewriting game logic

### Negative
- Slight overhead in the adapter layer
- Must maintain discipline to avoid coupling
- Developers need to understand the adapter pattern

## Implementation Notes
- React adapter uses `useGameEngine` hook to wrap the engine
- Event-driven architecture: engine emits events, UI subscribes
- Zero React/UI imports in `/src/core`
