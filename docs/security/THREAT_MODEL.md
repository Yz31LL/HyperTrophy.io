# Threat Model: HyperTrophy.io

## Overview

This document analyzes potential security threats to the HyperTrophy.io platform, specifically focusing on the client-side logic and Firestore data access patterns.

## Data Assets

- **Trainee Health Data**: Biometrics, weight logs, workout history (Sensitive).
- **Trainer Data**: Invite codes, roster information.
- **System Notifications**: Linking confirmation, progress alerts.

## Attack Surface & Mitigation

### 1. Unauthorized Access to Trainee Data

- **Threat**: A user attempts to read another user's `private_profile` or workout data.
- **Mitigation**: Firestore Security Rules strictly enforce `isOwner(userId)` checks.
- **New Feature Security**: Trainer access is limited to _only_ their linked trainees via `isTrainerOf(traineeId)` which verifies the `trainerId` field on the trainee's document.

### 2. Logic Injection in Analytics

- **Threat**: Malicious weight logs or workout data intended to crash the analytics engine or produce "Negative Calories".
- **Mitigation**:
  - **Health Calc Rules**: `calculateTargetCalories` enforced with a safety floor (Math.max(1000)).
  - **Property-Based Testing**: Use of `fast-check` to prove math never returns NaN or negative values.
  - **Validation**: Zod schema validation on the client before writing to Firestore.

### 3. Invite Code Brute Forcing

- **Threat**: A trainee tries to brute force trainer invite codes.
- **Mitigation**: Codes are 8-character high-entropy alphanumeric strings. Rate limiting is currently handled by standard Firebase infrastructure.

### 4. Notification Spam

- **Threat**: Triggering excessive linking notifications.
- **Mitigation**: Linking logic is transactional and requires a valid invite code and valid trainer ID.

## Conclusion

The architecture follows the "Minimum Privilege" principle by keeping sensitive data in subcollections (`private_profile`) and using server-side security rules to define exactly who can see what.
