# 1. Monorepo Structure

Date: 2026-02-12
Status: Accepted

## Context

We need to manage multiple distinct logical units (Web App, Backend Functions, Shared UI, Shared Logic) that share significant code (validation schemas, types, UI tokens).

## Decision

We adopted a **Monorepo** structure using **Turborepo** and **pnpm workspaces**.

## Consequences

- **Positive:** Shared Zod schemas (`@repo/shared`) ensure the API and Frontend validation never drift out of sync.
- **Positive:** Atomic changes (e.g., updating a calculation) can be committed, tested, and deployed across all apps in one PR.
- **Negative:** CI pipelines are slightly more complex to cache (mitigated by Turborepo remote caching).
