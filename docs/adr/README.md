# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) documenting key architectural and design decisions made in the Generator Game project.

## What is an ADR?

An ADR is a document that captures an important architectural decision made along with its context and consequences. ADRs help:
- Understand why certain choices were made
- Onboard new developers
- Revisit decisions when circumstances change
- Document trade-offs and alternatives considered

## ADR Format

Each ADR follows this structure:
- **Title**: Clear, descriptive name
- **Status**: Accepted, Superseded, Deprecated, etc.
- **Context**: The situation requiring a decision
- **Decision**: The choice that was made
- **Consequences**: Positive and negative outcomes
- **Implementation Notes**: Key details about how it works

## Current ADRs

- [ADR 0001: Framework-Agnostic Core with UI Adapters](0001-framework-agnostic-core.md)
- [ADR 0002: Event-Driven Architecture for State Synchronization](0002-event-driven-architecture.md)
- [ADR 0003: Composition of Systems Pattern](0003-system-composition-pattern.md)
- [ADR 0004: Exponential Cost Scaling for All Progressions](0004-exponential-cost-scaling.md)
- [ADR 0005: State Persistence via LocalStorage](0005-state-persistence-localstorage.md)
- [ADR 0006: Data-Driven Content Files](0006-data-driven-content.md)
- [ADR 0007: Factory Evolution System](0007-factory-evolution-system.md)

## When to Create an ADR

Create an ADR when:
- Making a decision that affects the overall architecture
- Choosing between multiple viable approaches
- Introducing a new pattern or paradigm
- Making a decision that will be hard to change later
- Future developers might ask "why did they do it this way?"

## Superseding ADRs

When circumstances change and we make a different decision:
1. Create a new ADR documenting the new decision
2. Update the old ADR's status to "Superseded by ADR XXXX"
3. Keep both for historical context
