import { UserProfile } from '@repo/shared'

// 1. Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
export function calculateBMR(profile: UserProfile): number {
  // Formula: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + s
  // s is +5 for males and -161 for females
  const s = profile.gender === 'male' ? 5 : -161
  const bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) + s
  return Math.round(bmr)
}

// 2. Calculate TDEE (Total Daily Energy Expenditure)
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

// 3. Calculate Target Calories based on Goal
export function calculateTargetCalories(tdee: number, goal: UserProfile['goal']): number {
  switch (goal) {
    case 'lose_weight': return Math.round(tdee - 500) // ~1lb loss per week
    case 'gain_muscle': return Math.round(tdee + 300) // Lean bulk
    case 'maintain': default: return tdee
  }
}

// 4. Calculate Macros (Protein / Fat / Carbs)
// Logic: 
// - Protein: 2.2g per kg of bodyweight (standard for hypertrophy)
// - Fat: ~0.8g per kg (for hormone health)
// - Carbs: Fill the rest of the daily calories
export function calculateMacros(profile: UserProfile, targetCalories: number) {
  const PROTEIN_PER_KG = 2.2 
  const FAT_PER_KG = 0.8

  const proteinGrams = Math.round(profile.weight * PROTEIN_PER_KG)
  const fatGrams = Math.round(profile.weight * FAT_PER_KG)

  // 1g Protein = 4 cal, 1g Fat = 9 cal, 1g Carb = 4 cal
  const caloriesFromProtein = proteinGrams * 4
  const caloriesFromFat = fatGrams * 9
  
  // Ensure we don't have negative carbs if calories are too low
  const remainingCalories = Math.max(0, targetCalories - (caloriesFromProtein + caloriesFromFat))
  const carbGrams = Math.round(remainingCalories / 4)

  return {
    protein: proteinGrams,
    fat: fatGrams,
    carbs: carbGrams,
    calories: targetCalories
  }
}