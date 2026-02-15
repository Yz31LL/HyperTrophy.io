import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(['trainer', 'trainee']).optional(),
  trainerId: z.string().optional(), // For trainees
  inviteCode: z.string().optional(), // For trainers
  referrals: z.number().int().nonnegative().default(0),
})

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(['trainer', 'trainee']),
  trainerId: z.string().optional(),
  inviteCode: z.string().optional(),
  referrals: z.number().int().nonnegative().optional(),
})

export type User = z.infer<typeof UserSchema>
export type CreateUser = z.infer<typeof CreateUserSchema>
