Here is a comprehensive **ToDo.md** file tailored to your architecture (React Native + Firebase + Client-Side Logic). You can save this in your root directory or inside `docs/`.

---

# **Project Roadmap & To-Do List: HyperTrophy.io**

**Status:** 🚀 In Progress

**Priority:** MVP (Minimum Viable Product)

**Tech Stack:** React Native, Firebase (Auth/Firestore), TypeScript.

---

## **Phase 1: Foundation & Authentication**

_Goal: Get a user signed in and their "Initial State" secured in the database._

- [ ] **Project Setup**
- [ ] Initialize React Native project (Expo recommended for speed).
- [ ] Set up TypeScript configuration (`tsconfig.json`).
- [ ] Install core dependencies (`firebase`, `react-navigation`, `react-native-safe-area-context`).
- [ ] Configure ESLint & Prettier.

- [ ] **Firebase Configuration**
- [ ] Create Firebase Project in Console.
- [ ] Enable **Authentication** (Email/Password, Google).
- [ ] Enable **Firestore Database** (Start in Test Mode).
- [ ] Add `firebaseConfig` to environment variables (`.env`).

- [ ] **Authentication Flow**
- [ ] Build `LoginScreen` (Email/Pass inputs).
- [ ] Build `SignUpScreen` (Create account).
- [ ] Implement `AuthContext` (Global state for user session).
- [ ] Create Protected Routes (Redirect unauthenticated users to Login).

---

## **Phase 2: The "Initial State" & Verified Math**

_Goal: Capture biometrics and generate the "Verified Plan" (No AI)._

- [ ] **Profile Data Modeling**
- [ ] Create `UserProfile` interface (Height, Weight, Age, Gender, Activity Level).
- [ ] Build **Onboarding Wizard** (Multi-step form).
- [ ] Step 1: Biometrics.
- [ ] Step 2: Goal Selection (Lose Weight, Hypertrophy, etc.).
- [ ] Step 3: Medical Flags (Injuries/Allergies).

- [ ] Save data to `users/{uid}/private_profile`.

- [ ] **The "No AI" Logic Engine (`health-calc.ts`)**
- [ ] Implement **Mifflin-St Jeor** Equation (BMR Calculation).
- [ ] Implement **TDEE Multiplier** logic (Activity Level).
- [ ] Implement **Macro Splitter** (e.g., if `Bodybuilder` -> 40% Protein).
- [ ] **Unit Test:** Verify math against known medical examples (Ensure accuracy).

- [ ] **Dashboard (Trainee View)**
- [ ] Fetch User Profile on load.
- [ ] Display "Daily Targets" (Calories, Protein, Water).
- [ ] Build "Weight Tracker" graph (Simple Line Chart).

---

## **Phase 3: Core Tracking (The "Daily Grind")**

_Goal: Allow users to log the work they do._

- [ ] **Database Schema Implementation**
- [ ] Define `daily_logs` structure.
- [ ] Create Firestore Indexes (if needed for sorting by date).

- [ ] **Workout Logger**
- [ ] Create `ExerciseDatabase` (JSON file of verified exercises).
- [ ] Build `WorkoutSession` screen.
- [ ] Implement "Add Set" functionality (Reps, Weight, RPE).
- [ ] **Feature:** Rest Timer (Auto-start after logging a set).
- [ ] Save workout data to `daily_logs/{date}/workouts`.

- [ ] **Nutrition Logger**
- [ ] Build `MealEntry` modal.
- [ ] Create "Quick Add" buttons (Protein Shake, Chicken Breast, Rice).
- [ ] Logic: Update "Calories Remaining" progress bar in real-time.

---

## **Phase 4: Advanced Logic & Visualization**

_Goal: Visual feedback and Plateau detection._

- [ ] **Muscle Heatmap**
- [ ] Create SVG mapping of human muscle groups.
- [ ] Write logic: `getWeeklyVolume()` -> `highlightMuscleGroup()`.
- [ ] Render Heatmap on Dashboard.

- [ ] **Plateau Detector**
- [ ] Write logic: Compare `avg_weight_last_7` vs `avg_weight_prev_7`.
- [ ] If delta < 0.5% AND `calorie_deficit` is true -> **Trigger Alert**.
- [ ] UI: Display "Plateau Detected" warning card.

---

## **Phase 5: The Trainer Command Center**

_Goal: The Dual-Sided Marketplace features._

- [ ] **Trainer/Trainee Connection**
- [ ] Create `InviteLink` generation (Simple unique ID).
- [ ] Build `RedeemInvite` screen for Trainees.
- [ ] Create `relationships` collection in Firestore.

- [ ] **Trainer Dashboard**
- [ ] Fetch list of linked Trainees.
- [ ] **Risk Highlight:** Filter clients by "Last Active > 3 Days".
- [ ] Read-Only View: Click client -> View their Dashboard.

- [ ] **Communication**
- [ ] Add "Trainer Note" field to `daily_logs`.
- [ ] Allow Trainer to write to that field.
- [ ] Notification Badge for Trainee when note is added.

---

## **Phase 6: Security & Polish**

_Goal: Production readiness._

- [ ] **Firestore Security Rules**
- [ ] Lock down `users` collection (Owner only).
- [ ] Allow Trainers `read` access to linked Trainees.
- [ ] Validate data types (e.g., `allow create: if request.resource.data.weight > 0`).

- [ ] **Offline Persistence**
- [ ] Enable Firestore Offline Persistence.
- [ ] Handle "No Internet" UI states.

- [ ] **Monetization (Freemium)**
- [ ] Create "Pro" flag in User Profile.
- [ ] Gate specific features (Heatmap, Trainer Connection) behind check.

---

## **Phase 7: Launch**

- [ ] **Beta Testing:** Onboard 5 Trainers + 5 Trainees.
- [ ] **App Store Submission:** Prepare assets (Screenshots, Icon).
- [ ] **Marketing:** "No AI, Just Science" campaign.
