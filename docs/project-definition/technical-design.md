# **Technical Design Document: HyperTrophy.io (Serverless)**

## **1. High-Level Architecture: Hexagonal & Decoupled**

_Goal: "Hexagonal/CQRS advanced patterns; plug-in architecture."_

- **Core Module (@repo/shared):** Contains the "Rules Engine" (Pure functions). It is decoupled from Firebase and the UI, allowing for easy testing and portability.
- **Adapters:**
  - **UI Adapter:** React components using Shadcn/UI for consistent accessibility and design.
  - **Persistence Adapter:** Firebase Firestore wrapper to allow swapping with other DBs (e.g., Supabase) if needed.
- **Frontend Layer:** React 18 + Vite with **SSR/SEO optimizations** for public landing pages and the changelog.
- **State Mgmt:** TanStack Query for server state (caching/optimistic updates) and RHF for form state.

---

## **2. Firestore Data Model (NoSQL Structure)**

Since Firestore is a document store, we avoid deep nesting. We will use **Root Collections** for scalability.

### **Collection: `users`**

_Stores profile data for both Trainers and Trainees._

- **Document ID:** `auth.uid`
- **Fields:** `role`, `displayName`, `email`, `createdAt`.
- **Sub-Collection: `private_profile`**: Secured via RBAC rules.
  - `height`, `weight`, `dob`, `gender`, `bodyFat`, `medicalIssues`, `allergies`, `archetype`.

### **Collection: `relationships`**

_Manages Trainee-Trainer links. Correctly indexed for bidirectional lookups._

- **Fields:** `traineeId`, `trainerId`, `status`, `permissions`.

### **Collection: `daily_logs`**

_Sharded and indexed for high-performance time-series queries._

- **Fields:** `userId`, `date` (ISO), `caloriesConsumed`, `macros` (protein, carbs, fat, water), `workouts` (array of exercise logs), `notes`, `trainerComments`.

---

## **3. Quality & Testing Foundation**

_Goal: "Mutation or property-based tests; zero-regression policy."_

- **Unit Testing:** Vitest for the Rules Engine logic.
- **Property-Based Testing:** Using `fast-check` to verify that `calculateMacros` never returns negative values regardless of input (Biometrics).
- **Mutation Testing:** Using **Stryker Mutator** to ensure test suites actually catch bugs in the health formulas.
- **Visual Regression:** Chromatic/Storybook integration to catch UI diffs in Shadcn components.
- **E2E:** Playwright "Happy Path" tests running in CI for every PR.

---

## **4. Security & Governance**

_Goal: "Threat model documented; security ADRs."_

- **Security ADRs:** All major security decisions (e.g., switching to Custom Claims) are documented in `docs/adr/`.
- **Threat Modeling:** A living `THREAT_MODEL.md` document analyzing attack vectors like logic injection or unauthorized medical data access.
- **Firestore Rules:** Principle of least privilege enforced. Rules validated via emulator in CI.

---

## **5. Infrastructure & DevOps (L5 Excellence)**

_Goal: "Multi-env config; zero-downtime migrations; canary deploys."_

- **CI/CD Pipeline (GitHub Actions):**
  - **Turbo-cached:** Builds finish in <5 mins using Turborepo's remote cache.
  - **Canary Deploys:** Preview channels for every PR; tagging a release promotes to production with an automated rollback option.
- **Infrastructure as Code (IaC):** Firebase indexes and security rules are managed via the Firebase CLI (version controlled).
- **Ops & Monitoring:**
  - **Sentry/Crashlytics:** Real-time error reporting and performance monitoring.
  - **Cloud Logging Dashboards:** Custom metrics for "Logic Engine execution time" and "DB Write Latency."
- **Seeding:** `scripts/seed-db.ts` for deterministic data resets during E2E testing.
