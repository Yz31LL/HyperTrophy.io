# 4. Analytics Stack

Date: 2026-02-15
Status: Accepted

## Context

We need to make data-driven decisions based on user behavior. We require an analytics tool that is developer-friendly, handles event tracking well, and provides built-in visualization tools.

## Decision

We selected **PostHog** as our primary analytics provider.

- It offers a comprehensive feature set (session recording, feature flags, heatmaps) beyond basic event tracking.
- The open-source nature/generous free tier aligns with our current stage.
- Integration will be done via the `posthog-js` SDK in the web application.

## Consequences

- **Positive:** Centralized source of truth for user behavior.
- **Positive:** Ability to run A/B tests and feature flags using the same platform.
- **Negative:** Adds a small amount of weight to the client bundle.
- **Negative:** Requires compliance with privacy regulations (GDPR/CCPA) regarding data collection.
