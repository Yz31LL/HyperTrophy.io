# 5. Automated Changelog

Date: 2026-02-15
Status: Accepted

## Context

Maintaining a manual changelog is error-prone and often forgotten. We need a way to automatically generate a public-facing changelog that reflects the actual changes in each release.

## Decision

We will use **Changesets** to manage versioning and changelog generation.

- Developers include a "changeset" with each PR describing the change and its impact level (patch, minor, major).
- The `release.yml` GitHub Action will automatically aggregate these changesets into a `CHANGELOG.md` file during the release process.
- This ensures the changelog is always in sync with the codebase.

## Consequences

- **Positive:** Accurate, automated record of all significant changes.
- **Positive:** Simplifies the release process by automating version bumps.
- **Negative:** Requires developers to be disciplined about adding changesets to their PRs.
