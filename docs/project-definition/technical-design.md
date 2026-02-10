# **Technical Design Document: HyperTrophy.io (Serverless)**

## **1. High-Level Architecture**

- **Client (Frontend):** React Native (Mobile) or React.js (Web).
- _Responsibility:_ The app holds **all** business logic. The "Verified Rules Engine" (calculating macros, BMR, plateau detection) runs locally on the user's device in JavaScript/TypeScript.

- **Auth:** Firebase Authentication.
- _Responsibility:_ Handle sign-up/login (Email, Google Auth). It provides the `uid` used to secure database paths.

- **Database:** Cloud Firestore (NoSQL).
- _Responsibility:_ Store data and enforce permissions.

- **Security:** Firestore Security Rules.
- _Responsibility:_ The "Gatekeeper." Since there is no backend server to validate data, the database rules must ensure a user cannot write a weight of "-50 lbs" or access another user's data.

---

## **2. Firestore Data Model (NoSQL Structure)**

Since Firestore is a document store, we avoid deep nesting. We will use **Root Collections** for scalability.

### **Collection: `users**`

_Stores profile data for both Trainers and Trainees._

- **Document ID:** `auth.uid` (Matches the Firebase Auth ID)
- **Fields:**
- `role`: "trainee" | "trainer"
- `displayName`: string
- `email`: string
- `createdAt`: timestamp
- **Sub-Collection: `private_profile**` (Secured so only the user + their trainer can see)
- `height`: number
- `weight`: number
- `dob`: timestamp
- `gender`: string
- `bodyFat`: number
- `medicalIssues`: array[string]
- `allergies`: array[string]
- `archetype`: "bodybuilder" | "fighter" | "senior" | etc.

### **Collection: `relationships**`

_Manages the link between Trainee and Trainer. This replaces SQL "Join" tables._

- **Document ID:** `auto-generated`
- **Fields:**
- `traineeId`: string (Ref to users)
- `trainerId`: string (Ref to users)
- `status`: "active" | "pending" | "archived"
- `permissions`: map (e.g., `{ canEditWorkouts: true, canSeeDiet: true }`)

### **Collection: `daily_logs**`

_The core tracking data. Queries will be performed here._

- **Document ID:** `auto-generated`
- **Fields:**
- `userId`: string (The owner of the log)
- `date`: string (ISO format "YYYY-MM-DD")
- `caloriesConsumed`: number
- `protein`: number
- `carbs`: number
- `water`: number
- `workouts`: array of objects
- `exerciseId`: string
- `sets`: array `[{reps: 10, weight: 135, rpe: 8}]`
- `muscleGroup`: "chest" | "legs" | etc.

- `notes`: string (User's diary)
- `trainerComments`: string (Feedback from coach)

### **Collection: `exercises**` (Static / Read-Only for users)

- **Fields:**
- `name`: "Bench Press"
- `muscleTarget`: "Pectorals"
- `type`: "Compound"

---

## **3. Logic & Security Strategy**

Since we removed the backend functions, the **Frontend** calculates the data, and **Firestore Rules** validate it.

### **A. Logic (Client-Side)**

The React App will contain a utility library (e.g., `health-calc.js`) that runs verified formulas.

- **Example Workflow:**

1. User updates weight in UI.
2. React App runs `Mifflin-St Jeor` formula locally.
3. React App calculates new macro targets.
4. React App writes _both_ the new weight and the new targets to Firestore.

### **B. Security Rules (The Guardrails)**

This is critical. You must prevent a malicious user (or a buggy client) from corrupting the DB.

**Example Firestore Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is the owner
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Helper to check if user is the assigned trainer
    function isTrainer(traineeId) {
      // Query the 'relationships' collection to see if a link exists
      // Note: In Firestore Rules, queries are limited.
      // Strategy: The Client must include the trainerId in the document or
      // we rely on Custom Claims (simpler) or lookups if architected carefully.
      // *For MVP, we often store 'trainerId' directly on the user's profile for easy rule checks.*
      return request.auth.uid == get(/databases/$(database)/documents/users/$(traineeId)).data.trainerId;
    }

    // USERS Collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isTrainer(userId);
      allow write: if isOwner(userId); // Only user changes their bio
    }

    // DAILY LOGS Collection
    match /daily_logs/{logId} {
      // Allow read if you own the log OR you are the trainer listed on the user's profile
      allow read: if isOwner(resource.data.userId) || isTrainer(resource.data.userId);

      // Allow create if you are setting yourself as the owner
      allow create: if isOwner(request.resource.data.userId);

      // Allow update if owner OR trainer (for comments)
      allow update: if isOwner(resource.data.userId) || isTrainer(resource.data.userId);
    }
  }
}

```

---

## **4. The "No AI" Analysis Engine**

Since this is strictly algorithmic and runs in the browser:

1. **Dashboard Load:** The app fetches the last 30 entries from `daily_logs` and `private_profile`.
2. **Plateau Detection:**

- _Frontend Logic:_ `if (weight_last_7_days == weight_previous_7_days) AND (caloric_deficit == true) -> return "Metabolic Adaptation Detected"`

3. **Visualization:**

- The Heatmap logic runs locally. It iterates through the `daily_logs`, sums up sets per `muscleGroup`, and passes that data to a charting library (like `react-native-svg-charts` or `Recharts`).
