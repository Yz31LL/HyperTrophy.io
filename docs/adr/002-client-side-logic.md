# 2. Client-Side Logic Engine

Date: 2026-02-12
Status: Accepted

## Context

HyperTrophy.io provides deterministic health calculations (BMR, Macros) based on established medical formulas (Mifflin-St Jeor). These formulas do not require secret keys or database lookups.

## Decision

We place the core "Rules Engine" in a shared package (`@repo/shared` or client-side libs) and execute it on the **Client Side** for immediate feedback.

## Consequences

- **Positive:** Zero latency for the user when adjusting sliders/inputs.
- **Positive:** Reduced server costs (Functions only run for write operations/auth).
- **Negative:** Logic is exposed to the browser (acceptable as these formulas are public medical knowledge).
- **Security Note:** Data written to Firestore is validated again by Security Rules to prevent manipulated values.
