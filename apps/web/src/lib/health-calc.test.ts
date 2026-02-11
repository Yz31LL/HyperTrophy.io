import { describe, it, expect } from 'vitest'
import { calculateBMR, calculateMacros } from './health-calc'
import type { UserProfile } from '@repo/shared/schemas'

// Mock Data
const BASE_PROFILE: UserProfile = {
  gender: 'male',
  age: 30,
  height: 180, // cm
  weight: 80, // kg
  activityLevel: 'moderate',
  goal: 'maintain',
  archetype: 'general',
  dietaryPreference: 'standard',
}

describe('Health Calc Engine', () => {
  it('calculates BMR correctly (Mifflin-St Jeor)', () => {
    // Man: (10*80) + (6.25*180) - (5*30) + 5 = 800 + 1125 - 150 + 5 = 1780
    const bmr = calculateBMR(BASE_PROFILE)
    expect(bmr).toBe(1780)
  })

  it('adjusts macros for Bodybuilder archetype', () => {
    const profile = { ...BASE_PROFILE, archetype: 'bodybuilder' } as UserProfile
    const targetCals = 2500
    const macros = calculateMacros(profile, targetCals)

    // Bodybuilder: 2.2g Protein/kg * 80kg = 176g
    expect(macros.protein).toBe(176)
  })

  it('adjusts macros for Senior archetype', () => {
    const profile = { ...BASE_PROFILE, archetype: 'senior' } as UserProfile
    const targetCals = 2000
    const macros = calculateMacros(profile, targetCals)

    // Senior: 1.6g Protein/kg * 80kg = 128g
    expect(macros.protein).toBe(128)
  })
})
