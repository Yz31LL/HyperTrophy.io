# Threat Model: HyperTrophy.io

## 1. Asset Analysis

- **User PII:** Email, Name (Low sensitivity).
- **Health Data:** Weight, Age, Injuries (High sensitivity - HIPPA considerations if scaled).
- **Business Logic:** Macro formulas (Low sensitivity - Public knowledge).

## 2. Threat Scenarios (STRIDE)

### Spoofing (Identity Theft)

- **Risk:** User impersonating another user to read their logs.
- **Mitigation:** Firestore Rules enforce `request.auth.uid == userId` for all reads/writes. No public access allowed.

### Tampering (Data Integrity)

- **Risk:** User injecting negative calories or impossible weights (e.g., 5000kg) to break graphs.
- **Mitigation:** 1. **Zod Validation:** Frontend forms reject invalid numbers. 2. **Firestore Rules:** Backend rules (Phase 3) will validate ranges (e.g., `resource.data.weight > 0`).

### Information Disclosure

- **Risk:** Trainers seeing private notes of clients they aren't linked to.
- **Mitigation:** The `private_profile` sub-collection is strictly locked. Trainers will only be granted read access via explicit "Relationship" documents (Phase 6).

## 3. Accepted Risks

- **Client-Side Logic:** Users can technically modify the local variable for "Target Calories" in their browser console.
  - _Decision:_ Acceptable. This only affects their local view. The database remains the source of truth.
