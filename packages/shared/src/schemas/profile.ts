import { z } from 'zod'

export const ActivityLevelSchema = z.enum([
  'sedentary', // Office job, little exercise
  'light', // 1-3 days/week
  'moderate', // 3-5 days/week
  'heavy', // 6-7 days/week
  'athlete', // Physical job + training
])

export const GoalSchema = z.enum(['lose_weight', 'maintain', 'gain_muscle'])

export const GenderSchema = z.enum(['male', 'female'])

// NEW: Archetypes define the macro split strategy
export const ArchetypeSchema = z.enum([
  'bodybuilder', // High Protein, Moderate Carb
  'fighter', // High Carb (Glycogen), High Protein
  'crossfitter', // Balanced / High Carb
  'senior', // Moderate Protein, Focus on Micros (Maintenance)
  'general', // Standard Balanced
])

export const UserProfileSchema = z.object({
  gender: GenderSchema,
  age: z.number().min(13).max(100),
  height: z.number().min(50).max(300), // in cm
  weight: z.number().min(20).max(500), // in kg
  activityLevel: ActivityLevelSchema,
  goal: GoalSchema,
  archetype: ArchetypeSchema.default('general'),
  dietaryPreference: z.enum(['standard', 'vegetarian', 'vegan', 'keto']).default('standard'),
})

export type UserProfile = z.infer<typeof UserProfileSchema>
export type ActivityLevel = z.infer<typeof ActivityLevelSchema>
export type Goal = z.infer<typeof GoalSchema>
export type Archetype = z.infer<typeof ArchetypeSchema>
