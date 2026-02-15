# 3. Canary Deployment Strategy

Date: 2026-02-15
Status: Accepted

## Context

We need a way to deploy changes to production with minimal risk, allowing for validation before full traffic exposure. Manual production deployments are currently a single step, which is risky for breaking changes.

## Decision

We will implement a **Canary Deployment** flow using **Firebase Hosting Preview Channels**.

1.  Each production deployment starts by creating a temporary preview channel.
2.  Automated smoke tests (and optionally manual validation) are run against this channel.
3.  If tests pass, the build is promoted to the live channel.
4.  If tests fail, the workflow stops, effectively "rolling back" by not promoting.

## Consequences

- **Positive:** Reduces the blast radius of failed deployments.
- **Positive:** Allows for real-world validation in the production environment without affecting users.
- **Negative:** Slightly increases deployment time due to the extra validation step.
- **Negative:** Requires careful management of environment variables between preview and live.
