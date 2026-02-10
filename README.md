# HyperTrophy.io 🏋️‍♂️

> **Verified Science. No Black Boxes.**
> A production-ready monorepo for the HyperTrophy.io fitness SaaS.

**HyperTrophy.io** is a dual-sided fitness platform (Trainee & Trainer) designed to bridge the gap between casual tracking and professional coaching. Unlike competitors relying on generative AI, we use a **Transparent Rules Engine** based on established medical standards (ACSM, Mifflin-St Jeor) powered by a type-safe architecture.

## 🏗 Tech Stack & Analogy

We treat this codebase like a high-performance human body. Every part of the stack has a physiological role:

| Tool                  | Role             | The "Gym" Analogy                                                    |
| :-------------------- | :--------------- | :------------------------------------------------------------------- |
| **pnpm**              | Package Manager  | **The Nutrition Plan**: Efficiently fueling the system.              |
| **Turborepo**         | Build System     | **The CNS**: Coordinating movement and recovery logic.               |
| **React + Vite**      | Frontend (`web`) | **The Muscle**: The visible, functional output.                      |
| **tRPC**              | API Layer        | **The Nervous System**: Instant signals between brain and muscle.    |
| **Zod**               | Validation       | **The Immune System**: Rejecting bad inputs (injuries/invalid data). |
| **TanStack Query**    | State/Fetching   | **Muscle Memory**: Remembering previous lifts (caching).             |
| **Tailwind + Shadcn** | UI/Styling       | **The Physique**: Aesthetics and definition.                         |
| **Vitest**            | Testing          | **The Check-up**: Ensuring health before performance.                |

---

## 📂 Monorepo Structure

This project is structured to separate the "Medical Logic" from the "User Interface."

```text
├── .github/              # CI/CD (WIF + Actions)
├── apps/
│   ├── web/              # Trainee & Trainer Dashboard (React + Vite)
│   │   ├── src/
│   │   │   ├── features/ # Dashboard, Logger, Heatmaps
│   │   │   └── utils/    # Client-side helpers
│   │
│   └── functions/        # The "No AI" Logic Core (tRPC Backend)
│       └── src/trpc/     # Routers for Auth, Bio-markers, Plans
│
├── packages/
│   ├── ui/               # Shared Components (Muscle Heatmap, Charts)
│   ├── shared/           # Zod Schemas (Medical Standards, RPE Rules)
│   ├── eslint-config/    # Code hygiene
│   └── typescript-config/# Type definitions
├── docs/                 # Documentation (PDD, Specs)
└── turbo.json            # Pipeline configuration
```

---

## 🚀 Key Features

### 1. The "No AI" Logic Core (`apps/functions`)

We do not guess. We calculate. The backend uses tRPC to serve deterministic health data:

- **Algorithmic Analysis:** Mifflin-St Jeor & ACSM formulas run here.
- **Plateau Detection:** Server-side analysis of weight vs. caloric intake.

```typescript
// Example: Type-safe calorie calculation in tRPC
export const healthRouter = router({
  calculateMacros: publicProcedure
    .input(BioMarkerSchema)
    .query(({ input }) => calculateMifflinStJeor(input)),
})
```

### 2. Strict Medical Validation (`packages/shared`)

Using Zod ensures that a Trainee cannot log physically impossible data or unsafe biometrics. These schemas are shared between the Backend and Frontend.

```typescript
import { BioMarkerSchema } from '@repo/shared'

// Validates on the API AND the Form Input
const userStats = BioMarkerSchema.parse(inputData)
```

### 3. Dual-Sided Interface (`apps/web`)

A single React application that branches based on user role:

- **Trainee View:** Smart Logging, Muscle Heatmap, Goal Trajectory.
- **Trainer View:** "Command Center" dashboard to view client adherence and risk analysis.

---

## ⚡ Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd hypertrophy-io

# 2. Install dependencies (The "Nutrition Plan")
pnpm install

# 3. Start Development (The "Warm Up")
pnpm dev
```

### Development Commands

| Command          | Action                                                                 |
| :--------------- | :--------------------------------------------------------------------- |
| `pnpm dev`       | Starts `web` and `functions` locally. (Opens at http://localhost:5173) |
| `pnpm build`     | Compiles all packages for production.                                  |
| `pnpm test`      | Runs Vitest (Unit tests for math/logic).                               |
| `pnpm lint`      | Lints all packages.                                                    |
| `pnpm typecheck` | Ensures full end-to-end type safety.                                   |
| `pnpm precheck`  | Runs all quality checks (lint, typecheck, build, test).                |

---

## 🔄 CI/CD & Deployment

This repo includes a fully configured CI/CD pipeline using **GitHub Actions** and **Workload Identity Federation (WIF)** for secure, keyless deployments to GCP.

### Branch Strategy

| Branch  | Environment | Deployment                 |
| :------ | :---------- | :------------------------- |
| `dev`   | Development | Auto on push               |
| `stage` | Staging     | Auto on push               |
| `main`  | Production  | Manual (with confirmation) |

### Setup Instructions

1. **Configure WIF** using `scripts/setup-wif.sh`.
2. **Add Secrets** to GitHub (GCP_WORKLOAD_IDENTITY_PROVIDER, GCP_SA_EMAIL).
3. **Push** to `dev` to trigger the first deployment.

_(See `docs/ci-cd/CI-CD-Pipeline-Guide.md` for detailed instructions)_

---

## 🛠 Development Tools

### Git Hooks (Husky)

Pre-commit hooks automatically run ESLint and Prettier on staged files to ensure code hygiene.

### Changesets

We use semantic versioning for the monorepo. When you make a change:

```bash
# Create a changeset
pnpm changeset

# The release workflow handles version bumps automatically
```

---

## 🤝 Contributing

We welcome contributions that adhere to our **Scientific Transparency** standards.
Please run `pnpm precheck` before pushing to ensure all tests and linting pass.

## 📄 License

Distributed under the MIT License.

---

_Built on the Hytel Way Monorepo Architecture._
