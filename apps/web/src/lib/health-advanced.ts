/**
 * CALCULATES ONE-REP MAX (Epley Formula)
 * Formula: 1RM = Weight * (1 + Reps / 30)
 */
export function calculateOneRepMax(weight: number, reps: number): number {
  if (reps <= 1) return weight
  if (weight <= 0) return 0

  return Math.round(weight * (1 + reps / 30))
}

/**
 * CALCULATES IDEAL BODY WEIGHT (Devine Formula)
 * Male: 50.0 kg + 2.3 kg per inch over 5 feet
 * Female: 45.5 kg + 2.3 kg per inch over 5 feet
 * 5 feet = 152.4 cm
 * 1 inch = 2.54 cm
 */
export function calculateIdealWeight(heightCm: number, gender: 'male' | 'female'): number {
  const baseWeight = gender === 'male' ? 50 : 45.5
  const heightInches = heightCm / 2.54
  const inchesOverFiveFeet = Math.max(0, heightInches - 60)

  return Math.round(baseWeight + 2.3 * inchesOverFiveFeet)
}
