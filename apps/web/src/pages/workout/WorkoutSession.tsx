import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { Plus, Trash2, Check, ArrowLeft, Timer, Flame } from 'lucide-react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

// --- IMPORTS ---
import { db, auth } from '../../lib/firebase'
import { useProfile } from '../../hooks/useProfile'
import { Button } from '@repo/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/Card'
import { Input } from '@repo/ui/Input'
import { Progress } from '@repo/ui/Progress'

// --- DATA: EXERCISE DATABASE ---
const EXERCISE_DATABASE = {
  Legs: [
    'Barbell Squat',
    'Leg Press',
    'Romanian Deadlift (RDL)',
    'Walking Lunges',
    'Leg Extensions',
    'Calf Raises',
  ],
  'Push (Chest/Shoulders/Tri)': [
    'Bench Press (Flat)',
    'Incline Bench Press',
    'Overhead Press (OHP)',
    'Dumbbell Press',
    'Dips',
    'Tricep Pushdowns',
    'Push-ups',
  ],
  'Pull (Back/Biceps)': [
    'Deadlift',
    'Pull-ups',
    'Barbell Rows',
    'Lat Pulldowns',
    'Face Pulls',
    'Barbell Curls',
    'Hammer Curls',
  ],
  'Fighter / Core': [
    'Box Jumps',
    'Burpees',
    'Russian Twists',
    'Hanging Leg Raises',
    'Plank',
    'Shadow Boxing (Weighted)',
  ],
}

// --- TYPES ---
type WorkoutSet = {
  id: string
  weight: number | ''
  reps: number | ''
  completed: boolean
}

type ExerciseLog = {
  id: string
  name: string
  sets: WorkoutSet[]
}

// --- CONFIG: WORKOUT CATEGORIES & MET VALUES ---
const WORKOUT_CATEGORIES = {
  fighter: { label: 'Fighter / MMA', met: 10.3 },
  crossfit: { label: 'CrossFit / Circuit', met: 8.0 },
  legs: { label: 'Leg Day (Heavy)', met: 6.0 },
  lower: { label: 'Lower Body (General)', met: 5.0 },
  upper: { label: 'Upper Body', met: 5.0 },
  push: { label: 'Push (Chest/Triceps)', met: 4.5 },
  pull: { label: 'Pull (Back/Biceps)', met: 4.5 },
  arms: { label: 'Arms (Isolation)', met: 3.5 },
  cardio: { label: 'Cardio (Steady)', met: 7.0 },
} as const

type CategoryKey = keyof typeof WORKOUT_CATEGORIES

// --- HELPER FUNCTIONS ---
const createEmptySet = (): WorkoutSet => ({
  id: crypto.randomUUID(),
  weight: '',
  reps: '',
  completed: false,
})

const createExercise = (name: string): ExerciseLog => ({
  id: crypto.randomUUID(),
  name,
  sets: [createEmptySet(), createEmptySet(), createEmptySet()],
})

export function WorkoutSession() {
  const navigate = useNavigate()
  const { profile } = useProfile()

  // --- STATE ---
  const [isSaving, setIsSaving] = useState(false)
  const [category, setCategory] = useState<CategoryKey>('upper')
  const [sessionName, setSessionName] = useState('')

  // Initialize with some default exercises based on category (optional)
  const [exercises, setExercises] = useState<ExerciseLog[]>([
    createExercise('Bench Press (Flat)'), // Default starter
  ])

  // New State for the "Add Exercise" dropdown
  const [selectedExerciseToAdd, setSelectedExerciseToAdd] = useState('')

  // --- TIMER STATE ---
  const startTime = useRef<number>(Date.now())
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // --- EFFECT: LIVE TIMER ---
  useEffect(() => {
    startTime.current = Date.now()
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime.current) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // --- MATH: LIVE CALORIE CALCULATION ---
  const calculateLiveCalories = () => {
    const userWeightKg = profile?.weight || 75
    const met = WORKOUT_CATEGORIES[category].met
    const durationMinutes = elapsedSeconds / 60

    // 1. Time-based MET (base)
    const baseKcalPerMin = (met * 3.5 * userWeightKg) / 200
    const timeBasedCals = baseKcalPerMin * durationMinutes

    // 2. Training-based (Volume bonus)
    let volumeCals = 0
    exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.completed && typeof set.weight === 'number' && typeof set.reps === 'number') {
          // approx 0.005 per kg*rep for weightlifting (including metabolic efficiency)
          volumeCals += set.weight * set.reps * 0.005
        }
      })
    })

    return Math.floor(timeBasedCals + volumeCals)
  }

  const liveCalories = calculateLiveCalories()

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // --- ACTIONS ---
  const updateSet = (
    exIndex: number,
    setIndex: number,
    field: 'weight' | 'reps',
    value: number | ''
  ) => {
    setExercises(prev => {
      const next = structuredClone(prev)
      next[exIndex].sets[setIndex][field] = value as never
      return next
    })
  }

  const toggleSetComplete = (exIndex: number, setIndex: number) => {
    setExercises(prev => {
      const next = structuredClone(prev)
      const set = next[exIndex].sets[setIndex]
      set.completed = !set.completed
      return next
    })
  }

  const removeSet = (exIndex: number, setId: string) => {
    setExercises(prev => {
      const next = structuredClone(prev)
      next[exIndex].sets = next[exIndex].sets.filter(s => s.id !== setId)
      return next
    })
  }

  const addSet = (exIndex: number) => {
    setExercises(prev => {
      const next = structuredClone(prev)
      next[exIndex].sets.push(createEmptySet())
      return next
    })
  }

  // NEW: Add a specific exercise from the list
  const handleAddExercise = () => {
    if (!selectedExerciseToAdd) return
    setExercises(prev => [...prev, createExercise(selectedExerciseToAdd)])
    setSelectedExerciseToAdd('') // Reset dropdown
  }

  // --- FIREBASE SAVE ---
  const handleFinish = async () => {
    const user = auth.currentUser
    if (!user) return

    setIsSaving(true)
    const finalDurationMin = Math.ceil(elapsedSeconds / 60)
    const finalCalories = calculateLiveCalories()

    try {
      const cleanExercises = exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map(s => ({
          ...s,
          weight: Number(s.weight) || 0,
          reps: Number(s.reps) || 0,
        })),
      }))

      await addDoc(collection(db, 'users', user.uid, 'workouts'), {
        name: sessionName || WORKOUT_CATEGORIES[category].label,
        category,
        categoryLabel: WORKOUT_CATEGORIES[category].label,
        durationMinutes: finalDurationMin,
        caloriesBurned: finalCalories,
        exercises: cleanExercises,
        completedAt: serverTimestamp(),
      })

      navigate('/dashboard')
    } catch (error) {
      console.error('Error saving workout:', error)
      alert('Failed to save. Check console.')
    } finally {
      setIsSaving(false)
    }
  }

  // Logic for Progress Bar
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0)
  const completedSets = exercises.reduce(
    (acc, ex) => acc + ex.sets.filter(s => s.completed).length,
    0
  )
  const progress = totalSets === 0 ? 0 : (completedSets / totalSets) * 100

  return (
    <div className="min-h-screen bg-black pb-32 text-white">
      {/* HEADER */}

      <div className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
            </Button>

            <div className="flex flex-col items-center">
              <span className="font-bold text-sm text-white">Active Session</span>
              <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                <span className="flex items-center gap-1">
                  <Timer className="h-3 w-3" /> {formatTime(elapsedSeconds)}
                </span>
                <span className="flex items-center gap-1 text-yellow-500 font-bold">
                  <Flame className="h-3 w-3" /> {liveCalories} kcal
                </span>
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleFinish}
              disabled={isSaving}
              className="bg-yellow-500 text-black hover:bg-yellow-400"
            >
              {isSaving ? 'Saving...' : 'Finish'}
            </Button>
          </div>

          {/* Category Selector */}
          <div className="mb-2">
            <label className="text-[10px] font-bold text-zinc-500 ml-1 uppercase">
              Workout Type
            </label>

            <select
              value={category}
              onChange={e => setCategory(e.target.value as CategoryKey)}
              className="w-full mt-1 p-2 rounded-md border border-zinc-800 bg-zinc-900 text-white text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
            >
              {Object.entries(WORKOUT_CATEGORIES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>

          <Progress value={progress} className="h-1.5 bg-zinc-800" />
        </div>
      </div>

      {/* EXERCISE LIST */}
      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Name Input */}
        <div className="mb-4">
          <Input
            placeholder="Session Name (e.g. Morning Lift)"
            value={sessionName}
            onChange={e => setSessionName(e.target.value)}
            className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
          />
        </div>

        {exercises.map((exercise, exIndex) => (
          <Card
            key={exercise.id}
            className="overflow-hidden border-t-4 border-t-yellow-500 shadow-sm bg-zinc-950 border-x-zinc-800 border-b-zinc-800"
          >
            <CardHeader className="bg-zinc-900/50 py-3 border-b border-zinc-800">
              <CardTitle className="text-base flex justify-between items-center text-white">
                {exercise.name}
                <button
                  onClick={() => {
                    const newExercises = [...exercises]
                    newExercises.splice(exIndex, 1)
                    setExercises(newExercises)
                  }}
                  className="text-red-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Header */}
              <div className="grid grid-cols-10 gap-2 p-2 text-[10px] font-bold tracking-wider text-center text-zinc-500 border-b border-zinc-800 bg-zinc-900/30">
                <div className="col-span-2">SET</div>
                <div className="col-span-3">KG</div>
                <div className="col-span-3">REPS</div>
                <div className="col-span-2">DONE</div>
              </div>

              {/* Sets */}
              <AnimatePresence initial={false}>
                {exercise.sets.map((set, setIndex) => (
                  <SwipeToDeleteSet
                    key={set.id}
                    index={setIndex + 1}
                    set={set}
                    onUpdate={(field, val) => updateSet(exIndex, setIndex, field, val)}
                    onDelete={() => removeSet(exIndex, set.id)}
                    onToggle={() => toggleSetComplete(exIndex, setIndex)}
                  />
                ))}
              </AnimatePresence>

              <Button
                variant="ghost"
                className="w-full rounded-none border-t border-zinc-800 h-10 text-xs text-zinc-400 hover:text-yellow-500 hover:bg-zinc-900"
                onClick={() => addSet(exIndex)}
              >
                <Plus className="h-3 w-3 mr-2" /> Add Set
              </Button>
            </CardContent>
          </Card>
        ))}

        {/* --- ADD EXERCISE SECTION --- */}
        <div className="pt-4 border-t border-zinc-800 border-dashed">
          <label className="text-xs font-semibold text-zinc-500 mb-2 block">
            ADD NEXT EXERCISE
          </label>
          <div className="flex gap-2">
            <select
              className="flex-1 p-2 rounded-md border border-zinc-800 bg-zinc-900 text-white text-sm"
              value={selectedExerciseToAdd}
              onChange={e => setSelectedExerciseToAdd(e.target.value)}
            >
              <option value="" disabled>
                Select movement...
              </option>
              {Object.entries(EXERCISE_DATABASE).map(([category, exercises]) => (
                <optgroup key={category} label={category}>
                  {exercises.map(name => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <Button
              onClick={handleAddExercise}
              disabled={!selectedExerciseToAdd}
              className="bg-yellow-500 text-black hover:bg-yellow-400"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- SUB-COMPONENT: Swipeable Set Row ---
function SwipeToDeleteSet({
  set,
  index,
  onDelete,
  onToggle,
  onUpdate,
}: {
  set: WorkoutSet
  index: number
  onDelete: () => void
  onToggle: () => void
  onUpdate: (field: 'weight' | 'reps', val: number | '') => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="relative border-b border-zinc-800 last:border-0 bg-zinc-900 overflow-hidden"
    >
      <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-4">
        <Trash2 className="text-white h-4 w-4" />
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.1}
        dragSnapToOrigin
        onDragEnd={(_, info: PanInfo) => {
          if (info.offset.x < -60) onDelete()
        }}
        className="relative bg-zinc-900 grid grid-cols-10 gap-2 p-2 items-center z-10"
      >
        <div className="col-span-2 text-center font-mono text-muted-foreground text-sm">
          {index}
        </div>
        <div className="col-span-3">
          <Input
            type="number"
            placeholder="-"
            className="text-center h-8 text-sm p-0 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-yellow-500"
            value={set.weight}
            onFocus={e => e.target.select()}
            onChange={e => onUpdate('weight', e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>
        <div className="col-span-3">
          <Input
            type="number"
            placeholder="-"
            className="text-center h-8 text-sm p-0 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-yellow-500"
            value={set.reps}
            onFocus={e => e.target.select()}
            onChange={e => onUpdate('reps', e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>
        <div className="col-span-2 flex justify-center">
          <motion.div
            whileTap={{ scale: 0.9 }}
            onClick={onToggle}
            className={`w-7 h-7 rounded flex items-center justify-center cursor-pointer border transition-colors ${
              set.completed
                ? 'bg-yellow-500 border-yellow-500 text-black'
                : 'bg-zinc-800 border-zinc-700 hover:border-zinc-500'
            }`}
          >
            {set.completed && <Check className="h-3 w-3" />}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
