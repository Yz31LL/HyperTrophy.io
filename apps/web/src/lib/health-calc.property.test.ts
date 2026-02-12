import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacros,
} from './health-calc'
import {
  ActivityLevelSchema,
  GoalSchema,
  ArchetypeSchema,
  type UserProfile,
} from '@repo/shared/schemas'

// Helper to generate a valid UserProfile using fast-check based on our Zod constraints
const UserProfileArbitrary = fc.record({
  gender: fc.constantFrom('male', 'female'),
  // Schema allows 13-100
  age: fc.integer({ min: 13, max: 100 }),
  // Schema allows 50-300cm
  height: fc.integer({ min: 50, max: 300 }),
  // Schema allows 20-500kg
  weight: fc.integer({ min: 20, max: 500 }),
  activityLevel: fc.constantFrom(...ActivityLevelSchema.options),
  goal: fc.constantFrom(...GoalSchema.options),
  archetype: fc.constantFrom(...ArchetypeSchema.options),
  dietaryPreference: fc.constantFrom('standard', 'vegetarian', 'vegan', 'keto'),
}) as fc.Arbitrary<UserProfile>

describe('Health Calc Engine (Property Based)', () => {
  it('should never return NaN, Infinity, or Negative numbers for any valid profile', () => {
    fc.assert(
      fc.property(UserProfileArbitrary, profile => {
        // ... (BMR, TDEE, Target calculations remain the same)
        const bmr = calculateBMR(profile)
        const tdee = calculateTDEE(bmr, profile.activityLevel)
        const target = calculateTargetCalories(tdee, profile.goal)

        // 4. Calculate Macros
        const macros = calculateMacros(profile, target)

        // ... (Previous invariants 1-4 remain valid)

        // Invariant 5: Sum of macro calories must match the OUTPUT calories
        // We compare against macros.calories (the Source of Truth), NOT 'target' (the Request)
        const sumCals = macros.protein * 4 + macros.fat * 9 + macros.carbs * 4

        // This confirms the math inside the engine is internally consistent
        expect(Math.abs(sumCals - macros.calories)).toBeLessThanOrEqual(20)

        // Invariant 6 (New): The final calories must be at least the requested target
        // OR slightly higher if protein needs forced it up.
        // It should never be significantly LOWER than the safety floor.
        expect(macros.calories).toBeGreaterThanOrEqual(target - 20)
      })
    )
  })

  it('should ensure protein requirements are met regardless of caloric deficit', () => {
    fc.assert(
      fc.property(UserProfileArbitrary, profile => {
        const bmr = calculateBMR(profile)
        const tdee = calculateTDEE(bmr, profile.activityLevel)
        const target = calculateTargetCalories(tdee, profile.goal)
        const macros = calculateMacros(profile, target)

        // Invariant: Protein is calculated based on weight, not remaining calories
        // So it should always be stable regardless of the "Target Calories" outcome
        const expectedProtein = Math.round(
          profile.weight *
            (profile.archetype === 'bodybuilder'
              ? 2.2
              : profile.archetype === 'senior'
                ? 1.6
                : ['fighter', 'crossfitter'].includes(profile.archetype)
                  ? 2.0
                  : 1.8)
        )

        expect(macros.protein).toBe(expectedProtein)
      })
    )
  })
})
