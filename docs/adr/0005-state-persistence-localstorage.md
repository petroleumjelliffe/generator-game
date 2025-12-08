# ADR 0005: State Persistence via LocalStorage

## Status
Accepted

## Context
Players need to save progress between sessions. The game is a PWA intended for offline play, so we can't rely on server-side storage.

## Decision
Use browser localStorage for game state persistence:
- `SaveSystem` utility handles save/load/clear operations
- Game state saved as JSON with version checking
- Debounced auto-save (1 second after state changes)
- Save format includes:
  - Version string for compatibility checking
  - Timestamp for save file metadata
  - Full game state
  - Factory purchase counts (for cost scaling)
  - Cells unlocked count

## Consequences

### Positive
- Works offline (critical for PWA)
- No server infrastructure needed
- Instant save/load (no network latency)
- Simple implementation
- Per-browser storage (private to user)

### Negative
- Single save slot per browser
- Data can be lost if localStorage cleared
- No cross-device sync
- Save file size limited (~5-10MB typically)
- Manual save version management required

## Implementation Notes
Version check prevents loading incompatible saves. Current version: "2.0.0"

Debounced saves prevent excessive writes during rapid state changes.

Error handling: catches and logs errors, clears corrupted saves gracefully.
