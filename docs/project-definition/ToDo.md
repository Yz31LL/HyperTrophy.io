# **Project Roadmap & To-Do List: HyperTrophy.io**

**Status:** 🚀 In Progress
**Priority:** MVP (Minimum Viable Product)
**Tech Stack:** React (Vite), Firebase (Auth/Firestore), Tailwind, Framer Motion, TypeScript, Turborepo.

---

## **Phase 0: Architecture & Standards (The "Exceptional" Foundation)**

- [x] **Architecture Decision Records (ADRs)**
  - [x] Create `docs/adr/001-monorepo-structure.md` (Why Turborepo?).
  - [x] Create `docs/adr/002-client-side-logic.md` (Why no backend logic?).
  - [x] Create `docs/adr/003-firebase-auth.md` (Why Firebase?).
- [x] **Threat Modeling**
  - [x] Create `docs/security/THREAT_MODEL.md` (Analyze logic injection risks).

---

## **Phase 1: Foundation & Authentication**

_Goal: Get a user signed in and their "Initial State" secured in the database._

- [x] **Project Setup**

  - [x] Initialize React/Vite project within Monorepo.
  - [x] Set up TypeScript & ESLint/Prettier.
  - [x] Install core dependencies (`firebase`, `lucide-react`, `react-router-dom`).
  - [x] **Design:** Install Tailwind CSS + Shadcn/UI (Radix Primitives).
  - [x] **Feature:** Setup **Storybook** for UI isolation and visual regression testing (Rubric: DevEx).

- [x] **Firebase Configuration**

  - [x] Create Firebase Project.
  - [x] Enable Auth & Firestore.
  - [x] **Ops:** Create `scripts/seed-db.ts` for deterministic local development data (Rubric: Backend/API).
  - [x] **Ops:** Create `firebase.json` and `.firebaserc` for local development.

- [x] **Authentication Flow**
  - [x] Build `LoginScreen` & `SignUpScreen`.
  - [x] Implement `AuthContext`.
  - [x] Create Protected Routes.

---

## **Phase 2: The "Initial State" & Verified Math**

_Goal: Capture biometrics and generate the "Verified Plan" (No AI)._

- [x] **Profile Data Modeling**

  - [x] Create `UserProfile` interface.
  - [x] Build **Onboarding Wizard**.
  - [x] Step 1: Biometrics.
  - [x] Step 2: Goal Selection.
  - [x] Step 3: Archetypes.
  - [x] Save data to `users/{uid}/private_profile`.

- [x] **The "No AI" Logic Engine (`health-calc.ts`)**

  - [x] Implement **Mifflin-St Jeor** & **TDEE Multiplier**.
  - [x] Implement **Macro Splitter** based on Archetypes.
  - [x] **Test:** Add **Property-Based Tests** (using `fast-check`) to prove math never returns NaN or negative calories (Rubric: Quality).
  - [x] **Test:** Setup **Stryker Mutator** for mutation testing of the Rules Engine.

- [x] **Dashboard (Trainee View)**
  - [x] Fetch User Profile.
  - [x] Display "Daily Targets".
  - [x] Build "Weight Tracker" graph.

---

## **Phase 3: Core Tracking (The "Daily Grind")**

_Goal: Allow users to log the work they do._

- [x] **Workout Logger UI**

  - [x] Build `WorkoutSession` screen using Shadcn primitives.
  - [x] **Interaction:** "Swipe to Delete" set.
  - [x] **Motion:** Progress bar fills smoothly as sets are logged (Framer Motion).
  - [x] Categorize exercises by muscle group.
  - [x] Add exercises to workout session.
  - [x] Name the exercises
  - [x] Display calories burned
  - [x] Connect to Firebase Db

- [x] **Nutrition Logger UI**
  - [x] Build `MealEntry` modal (Dialog component).
  - [x] **Visual:** Dynamic donut chart updating in real-time.
  - [x] Connect to Firebase Db

---

## **Phase 4: Advanced Logic & Visualization**

_Goal: Visual feedback and Plateau detection._

- [x] **Muscle Heatmap**
  - [x] Create SVG mapping of muscle groups.
  - [x] Logic: `getWeeklyVolume()` -> `highlightMuscleGroup()`.
  - [x] **A11y:** Ensure Heatmap has a tabular data fallback for screen readers.
- [x] **Plateau Detector**
  - [x] Logic: `avg_weight_last_7` vs `avg_weight_prev_7`.
  - [x] UI: "Plateau Detected" warning card with entrance animation.

---

## **Phase 5: Pixel-Perfect Design & Interaction Polish**

_Goal: Upgrade current UI to "Premium" standard._

- [x] **Design System Refinement**
  - [x] Define standard Token hierarchy (Colors, Spacing, Typography).
  - [x] Ensure all text meets **WCAG AA Contrast** ratios.
- [x] **Motion Implementation**
  - [x] Add **Page Transitions** (Fade/Slide) between Onboarding steps.
  - [x] Add **Achievement Polish:** "Confetti" effects on daily goal completion.

---

## **Phase 6: The Trainer Command Center**

_Goal: The Dual-Sided Marketplace features._

- [x] **Trainer Dashboard**

  - [x] Fetch list of linked Trainees (via `useTrainees`).
  - [x] **Trainee Perspective:** Implement `TraineeDetailScreen` for live coach monitoring.
  - [x] **Ops:** Implement **Client Risk Analysis** filter.

- [x] **System Communications**
  - [x] **Feature:** Notification System (Alerts for trainer/trainee linking).
  - [x] **History:** Dedicated `HistoryScreen` for chronological nutrition/workout audit.

---

## **Phase 7: Security, Quality & Production Readiness**

- [x] **Formal A11y Audit**
  - [x] Run **Lighthouse CI** and target 100/100 Accessibility score.
- [x] **Advanced Testing & Security**

  - [x] **E2E:** Implement Playwright tests with ≥80% coverage.
  - [x] **Security:** Document **Threat Model** in `docs/security/THREAT_MODEL.md`.
  - [ ] **Security:** Maintain an exemplary **ADR trail** in `/docs/adr`.

- [ ] **Infrastructure & Ops**
  - [ ] **DevOps:** Setup **Canary Deploys** with automated rollbacks.
  - [ ] **Analytics:** Implement **PostHog/Mixpanel** for data-driven decisions.
  - [ ] **PM:** Setup automated public changelog from Changesets.

---

## **Phase 9: Deep Analytics & Progressive Overload**

_Goal: Move from "Tracking" to "Insight"._

- [ ] **Exercise PRs (Personal Records)**
  - [ ] Logic: Auto-detect heaviest lift or highest volume per exercise.
  - [ ] UI: Medal icons next to PR lifts in the log.
- [ ] **Progressive Overload Trends**
  - [ ] Logic: Track 1RM estimates or Volume over time.
  - [ ] Visual: Trend lines showing strength growth across macro-cycles.

---

## **Phase 10: Scaling & Content**

- [ ] **Trainer Exercise Library**
  - [ ] Build: Custom exercise creator for trainers (assign to trainees).
- [ ] **Social/Engagement**
  - [ ] Weekly leaderboards (Optional/Opt-in).
  - [ ] Trainer "Broadcast" messages to all trainees.

---

## **Phase 8: Launch**

- [ ] **Beta Testing:** Onboard 5 Trainers + 5 Trainees.
- [ ] **App Store Submission:** Prepare assets (Screenshots, Icon).
- [ ] **Marketing:** "No AI, Just Science" campaign.
