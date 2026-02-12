# **Product Design Document: HyperTrophy.io**

**Version:** 1.0

**Status:** Draft

**Platform:** Web (SaaS) & Mobile (iOS/Android via React Native)

**Core Philosophy:** "Verified Science, No Black Boxes."

---

## **1. Executive Summary**

HyperTrophy.io is a freemium health and fitness platform designed for dual stakeholders: **Trainees** seeking medically verified, deterministic fitness planning, and **Trainers** needing a remote command center for client management.

Unlike competitors relying on generative AI, HyperTrophy uses a transparent **Rules Engine** based on established medical standards (ACSM, Mifflin-St Jeor, etc.) to prescribe nutrition and training. It prioritizes data integrity, precise tracking, and direct Trainer-Trainee communication.

---

## **2. Target Audience (Personas)**

### **Primary Trainee Archetypes**

1. **The Bodybuilder:** Focus on hypertrophy, symmetry, and macro precision. Needs "Muscle Heatmaps" and progressive overload tracking.
2. **The Fighter:** Focus on reaction time, explosive power, and weight cutting. Needs strict water/sodium tracking and conditioning intervals.
3. **The Senior (Longevity):** Focus on mobility, bone density, and maintenance. Needs injury flags and vitamin/mineral tracking.
4. **The CrossFitter:** Focus on WOD times and metabolic conditioning.
5. **The Weight Loss Seeker:** Focus on caloric deficit and behavioral adherence.

### **The Professional Trainer**

- **Needs:** To monitor 10–50 clients efficiently.
- **Pain Point:** Clients lying about adherence or "ghosting" when they hit a plateau.
- **Goal:** A dashboard that highlights _who_ needs attention today (e.g., "Client X hasn't logged in 3 days").

---

## **3. Functional Requirements**

### **3.1. The "Verified" Analysis Engine (No AI)**

- **Inputs:** Height, Weight, Age, Gender, Body Fat %, Activity Level.
- **Constraints:** Injuries (e.g., "Herniated Disc" → excludes Deadlifts), Allergies (e.g., "Peanut" → excludes specific food sources).
- **Outputs (Deterministic):**
- **BMR & TDEE:** Calculated via Mifflin-St Jeor equation.
- **Macros:** Protein/Fat/Carb split based on Archetype (e.g., Bodybuilder = High Protein; Endurance = High Carb).
- **Micros:** RDA (Recommended Daily Allowance) for vitamins based on age/gender.

### **3.2. Trainee Experience**

- **Dashboard:**
- **Daily Snapshot:** Calories remaining, Macros progress bars, Today's Workout.
- **Goal Trajectory:** A linear graph showing "Predicted vs. Actual" weight over time.
- **Adherence Score:** A 0–100% rating based on log completeness.

- **Workout Logger:**
- Input: Exercise, Sets, Reps, Weight, RPE (Rate of Perceived Exertion).
- **Visuals:** A "Human Muscle Anatomy" heatmap that lights up muscle groups targeted that week.

```
* **Rest Timer:** Built-in stopwatch between sets.

```

- **Nutrition Logger:**
- Quick-add for "Frequent Meals."
- Barcode scanner (future scope) or manual entry from a verified verified database (e.g., USDA).

### **3.3. Trainer Experience**

- **Command Center:**
- **Client List:** Sortable by "Last Active," "Adherence Score," or "Plateau Detected."
- **Drill-Down:** Click a client to see their read-only logs and edit their upcoming workout plan.
- **Nudges:** One-tap push notifications to clients (e.g., "Don't forget to log lunch!").

---

## **4. Data Logic & "Plateau" Detection**

_Since we are using client-side logic, the app will run these checks on every dashboard load._

- **Definition of Plateau:**
- IF `Goal` == Weight Loss
- AND `AvgWeight(Last 7 Days)` == `AvgWeight(Previous 7 Days)`
- AND `CaloricDeficit` == True
- THEN `Status` = **"Metabolic Adaptation / Plateau"**

- **System Action:**

1. Flag appears on Trainee Dashboard: "Stalled Progress."
2. Notification sent to Trainer: "Client X has hit a plateau."
3. Recommendation Engine: Suggests "Refeed Day" or "Deload Week" (based on hard-coded rules, not AI generation).

---

## **5. User Experience (UX) & Interface Design**

### **5.1. Design Aesthetic & Polish**

_Rubric Goal: "Pixel-perfect, branded design; motion/interaction polish."_

- **Branding:** "HyperTrophy Blue" (#2563eb) is used for scientific trust, paired with sleek slate backgrounds for a premium dark-mode feel.
- **Motion & Interaction:**
  - **Layout Animations:** Use Framer Motion for shared element transitions when navigating between Dashboard cards and detail views.
  - **Micro-interactions:**
    - Buttons: Subtle scale-down (`scale-95`) and hover glow effects.
    - Forms: Input fields use smooth focus-ring expansions using Tailwind's `ring` utilities.
    - Achievement Polish: Confetti bursts (using `canvas-confetti`) when hitting a 7-day adherence streak or 10kg weight milestone.
  - **Optimistic UI:** Workout logs and hydration entries update the UI locally within <50ms, with background sync to Firestore for zero-latency feel.
- **Accessibility (A11y) Excellence:**
  - **Formal Audit:** Periodic manual audits using VoiceOver/NVDA and automated scans (Axe-Core).
  - **Standards:** Full WCAG 2.1 AA compliance. 100/100 Lighthouse Accessibility scores are a hard requirement.
  - **Reduced Motion:** Automatic disabling of heavy Framer Motion transitions if `prefers-reduced-motion` is detected.

### **5.2. Key User Flows**

1. **Onboarding:**

- User selects Archetype -> Enters Biometrics -> Logic Engine generates baseline -> Dashboard.

2. **The "Gym Flow":**

- Open App -> Start Workout -> Real-time rest timer triggers -> Log weights -> SVG Heatmap updates instantly.

---

## **6. Analytics & Product Health**

_Rubric Goal: "Data-driven decisions (analytics); public changelog."_

- **Usage Analytics (PostHog/Mixpanel):** Tracking "Daily Retention" and "Workout Completion Velocity" to identify UX bottlenecks.
- **A/B Testing:** Running experiments on the "Plateau Alert" UI to see which nudge drives better adjustment adherence.
- **Public Changelog:** A user-facing `/changelog` route that automatically displays the latest `Changesets` from the monorepo, keeping users informed of new "Rules Engine" refinements.

## **7. Monetization Strategy (Freemium)**

| Feature          | Free Tier (Trainee)       | Pro Tier (Trainee - $X/mo)         | Pro Trainer ($Y/mo)         |
| ---------------- | ------------------------- | ---------------------------------- | --------------------------- |
| **Logging**      | Unlimited Workouts/Food   | Unlimited                          | N/A                         |
| **Analysis**     | Basic Macros              | Advanced Micros & Vitamin Tracking | N/A                         |
| **History**      | Last 30 Days              | Lifetime                           | Lifetime Client History     |
| **Connectivity** | Cannot connect to Trainer | **Connect to Verified Trainer**    | **Manage up to 20 Clients** |
| **Analytics**    | Basic Graphs              | **Plateau Detection & Heatmaps**   | **Client Risk Analysis**    |

---

## **8. Technical Constraints & Requirements**

- **Offline First:** The app must function in a gym basement with no signal.
- _Solution:_ React Native `AsyncStorage` or Firestore `offlinePersistence`. Sync happens when connection is restored.

- **Data Privacy:**
- Medical data (Injuries/Bloodwork) is stored in the `private_profile` collection.
- Trainers have **Read-Only** access to logs, but **No Access** to sensitive medical notes unless explicitly toggled by the Trainee.

- **Performance:**
- Dashboard must load in < 200ms. All heavy math (averaging 6 months of weight data) runs on the device, not the server.

---

## **9. Roadmap**

- **Phase 1 (MVP):**
- User Auth, Profile Setup (Initial State), Basic Logging (Food/Workout), Simple Dashboard.

- **Phase 2 (The Logic):**
- Implementation of the "Verified Rules Engine" (Macro calc, Plateau detection).

- **Phase 3 (The Marketplace):**
- Trainer Accounts, Invite Links, Shared Dashboards.

- **Phase 4 (Expansion):**
- Wearable integration (Apple Health/Google Fit) for step tracking.
