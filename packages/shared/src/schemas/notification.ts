import { z } from 'zod'

export const NotificationTypeSchema = z.enum([
  'LINK_SUCCESS',
  'WORKOUT_COMPLETE',
  'MEAL_LOGGED',
  'WEIGHT_LOGGED',
  'SYSTEM',
])

export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  type: NotificationTypeSchema,
  read: z.boolean().default(false),
  createdAt: z.any(), // Firebase Timestamp
  link: z.string().optional(),
})

export type NotificationType = z.infer<typeof NotificationTypeSchema>
export type Notification = z.infer<typeof NotificationSchema>
