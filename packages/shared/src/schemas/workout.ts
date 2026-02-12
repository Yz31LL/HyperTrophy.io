import { z } from 'zod'

export const SetSchema = z.object({
  id: z.string(),
  weight: z.number().min(0),
  reps: z.number().min(1),
  rpe: z.number().min(1).max(10).optional(),
  completed: z.boolean().default(false),
})

export const ExerciseLogSchema = z.object({
  id: z.string(),
  name: z.string(),
  sets: z.array(SetSchema),
})

export const WorkoutSessionSchema = z.object({
  id: z.string(),
  date: z.string().datetime(), // ISO string
  exercises: z.array(ExerciseLogSchema),
  notes: z.string().optional(),
})

export type WorkoutSet = z.infer<typeof SetSchema>
export type ExerciseLog = z.infer<typeof ExerciseLogSchema>
export type WorkoutSession = z.infer<typeof WorkoutSessionSchema>
