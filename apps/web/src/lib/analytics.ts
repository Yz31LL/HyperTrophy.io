import { Timestamp } from 'firebase/firestore'

// --- TYPES ---
export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio'

// Individual set
export interface WorkoutSet {
  completed: boolean
  weight: number
  reps: number
}

// Exercise inside a workout
export interface Exercise {
  name: string
  sets: WorkoutSet[]
}

// Workout document from Firestore
export interface Workout {
  id?: string
  name?: string
  completedAt?: Timestamp
  date?: string
  caloriesBurned?: number
  exercises: Exercise[]
}

// Weight log document
export interface WeightLog {
  date: Timestamp
  weight: number
}

// --- EXERCISE → MUSCLE MAP ---
const EXERCISE_MAP: Record<string, MuscleGroup> = {
  // Push
  'Bench Press (Flat)': 'chest',
  'Incline Bench Press': 'chest',
  'Push-ups': 'chest',
  'Overhead Press (OHP)': 'shoulders',
  'Dumbbell Press': 'shoulders',
  Dips: 'arms',
  'Tricep Pushdowns': 'arms',

  // Pull
  'Pull-ups': 'back',
  'Barbell Rows': 'back',
  'Lat Pulldowns': 'back',
  'Face Pulls': 'shoulders',
  'Barbell Curls': 'arms',
  'Hammer Curls': 'arms',
  Deadlift: 'back',

  // Legs
  'Barbell Squat': 'legs',
  'Leg Press': 'legs',
  'Romanian Deadlift (RDL)': 'legs',
  'Walking Lunges': 'legs',
  'Leg Extensions': 'legs',
  'Calf Raises': 'legs',

  // Core / Cardio
  Plank: 'core',
  'Russian Twists': 'core',
  'Hanging Leg Raises': 'core',
  Burpees: 'cardio',
  'Shadow Boxing (Weighted)': 'cardio',
  'Box Jumps': 'legs',
}

// --- 1. MUSCLE HEATMAP LOGIC ---
export function calculateWeeklyVolume(workouts: Workout[]): Record<MuscleGroup, number> {
  const volume: Record<MuscleGroup, number> = {
    chest: 0,
    back: 0,
    legs: 0,
    shoulders: 0,
    arms: 0,
    core: 0,
    cardio: 0,
  }

  const now = new Date()
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(now.getDate() - 7)

  workouts.forEach(workout => {
    // Safely resolve workout date
    let workoutDate: Date | null = null

    if (workout.completedAt instanceof Timestamp) {
      workoutDate = workout.completedAt.toDate()
    } else if (workout.date) {
      workoutDate = new Date(workout.date)
    }

    if (!workoutDate) return
    if (workoutDate < oneWeekAgo) return

    workout.exercises.forEach(exercise => {
      const muscle: MuscleGroup = EXERCISE_MAP[exercise.name] ?? 'cardio'

      const completedSets = exercise.sets.filter(set => set.completed).length

      volume[muscle] += completedSets
    })
  })

  return volume
}

// --- 2. WEIGHT PLATEAU DETECTOR ---
export function detectWeightPlateau(weightLogs: WeightLog[]): boolean {
  if (weightLogs.length < 14) return false

  const now = new Date()

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const currentWindow = weightLogs.filter(log => {
    const date = log.date.toDate()
    return date >= sevenDaysAgo
  })

  const previousWindow = weightLogs.filter(log => {
    const date = log.date.toDate()
    return date >= fourteenDaysAgo && date < sevenDaysAgo
  })

  if (currentWindow.length === 0 || previousWindow.length === 0) return false

  const avgCurrent = currentWindow.reduce((sum, log) => sum + log.weight, 0) / currentWindow.length

  const avgPrevious =
    previousWindow.reduce((sum, log) => sum + log.weight, 0) / previousWindow.length

  const difference = Math.abs(avgCurrent - avgPrevious)

  const percentChange = (difference / avgPrevious) * 100

  return percentChange < 0.3
}

export function calculateCaloriesBurned(workouts: Workout[]): number {
  let totalCalories = 0

  workouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      exercise.sets.forEach(set => {
        if (!set.completed) return

        const volume = set.weight * set.reps

        const calories = volume * 0.005

        totalCalories += calories
      })
    })
  })

  return Math.round(totalCalories)
}
