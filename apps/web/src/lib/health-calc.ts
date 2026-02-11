import { UserProfile } from '@repo/shared/schemas'

export function calculateBMR(profile: UserProfile): number {
  const s = profile.gender === 'male' ? 5 : -161
  const bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + s
  return Math.round(bmr)
}

export function calculateTDEE(bmr: number, activityLevel: UserProfile['activityLevel']): number {
  const multipliers: Record<UserProfile['activityLevel'], number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    heavy: 1.725,
    athlete: 1.9,
  }
  return Math.round(bmr * multipliers[activityLevel])
}

export function calculateTargetCalories(tdee: number, goal: UserProfile['goal']): number {
  switch (goal) {
    case 'lose_weight':
      return Math.round(tdee - 500)
    case 'gain_muscle':
      return Math.round(tdee + 300)
    case 'maintain':
    default:
      return tdee
  }
}

// NEW: Advanced Macro Logic based on Archetype
export function calculateMacros(profile: UserProfile, targetCalories: number) {
  let proteinPerKg = 1.8 // Default standard
  let fatPerKg = 0.8 // Default standard

  // Adjust ratios based on Archetype
  switch (profile.archetype) {
    case 'bodybuilder':
      proteinPerKg = 2.2 // High protein for hypertrophy
      fatPerKg = 0.7 // Lower fat to allow for carbs
      break
    case 'fighter':
    case 'crossfitter':
      proteinPerKg = 2.0 // High protein
      fatPerKg = 0.8 // Moderate fat
      // These athletes need MORE carbs, which naturally happens
      // because protein/fat are fixed, leaving the rest for carbs.
      break
    case 'senior':
      proteinPerKg = 1.6 // Moderate-High to prevent sarcopenia
      fatPerKg = 0.9 // Higher fat for hormonal health
      break
    case 'general':
    default:
      proteinPerKg = 1.8
      fatPerKg = 0.9
      break
  }

  const proteinGrams = Math.round(profile.weight * proteinPerKg)
  const fatGrams = Math.round(profile.weight * fatPerKg)

  // Calorie math: Protein=4, Fat=9, Carb=4
  const caloriesFromProtein = proteinGrams * 4
  const caloriesFromFat = fatGrams * 9

  // Remaining calories go to Carbs (Energy)
  const remainingCalories = Math.max(0, targetCalories - (caloriesFromProtein + caloriesFromFat))
  const carbGrams = Math.round(remainingCalories / 4)

  return {
    protein: proteinGrams,
    fat: fatGrams,
    carbs: carbGrams,
    calories: targetCalories,
  }
}
