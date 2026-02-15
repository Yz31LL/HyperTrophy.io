import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore'

// --- IMPORTS ---
import { db, auth } from '../../lib/firebase'
import { useProfile } from '../../hooks/useProfile'
import { WorkoutNav } from './WorkoutNav'
import { ExerciseCard } from './ExerciseCard'

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
  const [exercises, setExercises] = useState<ExerciseLog[]>([createExercise('Bench Press (Flat)')])
  const [selectedExerciseToAdd, setSelectedExerciseToAdd] = useState('')
  const [customExercises, setCustomExercises] = useState<{ id: string; name: string }[]>([])

  // --- EFFECT: FETCH CUSTOM EXERCISES ---
  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    const unsubscribe = onSnapshot(
      collection(db, 'users', user.uid, 'assigned_exercises'),
      snapshot => {
        setCustomExercises(
          snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as { id: string; name: string })
        )
      }
    )
    return () => unsubscribe()
  }, [])

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

    const baseKcalPerMin = (met * 3.5 * userWeightKg) / 200
    const timeBasedCals = baseKcalPerMin * durationMinutes

    let volumeCals = 0
    exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.completed && typeof set.weight === 'number' && typeof set.reps === 'number') {
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
  const handleUpdateSet = (
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

  const handleToggleSet = (exIndex: number, setIndex: number) => {
    setExercises(prev => {
      const next = structuredClone(prev)
      next[exIndex].sets[setIndex].completed = !next[exIndex].sets[setIndex].completed
      return next
    })
  }

  const handleRemoveSet = (exIndex: number, setId: string) => {
    setExercises(prev => {
      const next = structuredClone(prev)
      next[exIndex].sets = next[exIndex].sets.filter(s => s.id !== setId)
      return next
    })
  }

  const handleAddSet = (exIndex: number) => {
    setExercises(prev => {
      const next = structuredClone(prev)
      next[exIndex].sets.push(createEmptySet())
      return next
    })
  }

  const handleAddExercise = () => {
    if (!selectedExerciseToAdd) return
    setExercises(prev => [...prev, createExercise(selectedExerciseToAdd)])
    setSelectedExerciseToAdd('')
  }

  const handleRemoveExercise = (exIndex: number) => {
    setExercises(prev => {
      const next = [...prev]
      next.splice(exIndex, 1)
      return next
    })
  }

  // --- FIREBASE SAVE ---
  const handleFinish = async () => {
    const user = auth.currentUser
    if (!user) return

    setIsSaving(true)
    const finalDurationMin = Math.ceil(elapsedSeconds / 60)
    const finalCalories = calculateLiveCalories()

    // Calculate Volume for Leaderboard
    let sessionVolume = 0
    exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.completed && typeof set.weight === 'number' && typeof set.reps === 'number') {
          sessionVolume += set.weight * set.reps
        }
      })
    })

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

      // Sync with Leaderboard if opted in
      const currentWeekId = () => {
        const d = new Date()
        const year = d.getFullYear()
        const firstDayOfYear = new Date(year, 0, 1)
        const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
        return `${year}-w${weekNum}`
      }
      const weekId = currentWeekId()
      const leaderboardRef = doc(db, 'leaderboards', weekId, 'entries', user.uid)
      const leaderboardSnap = await getDoc(leaderboardRef)

      if (leaderboardSnap.exists() && leaderboardSnap.data().optIn) {
        const currentVolume = leaderboardSnap.data().volume || 0
        await setDoc(
          leaderboardRef,
          {
            volume: currentVolume + sessionVolume,
            lastUpdated: serverTimestamp(),
            displayName: user.displayName || 'Anonymous',
            uid: user.uid,
          },
          { merge: true }
        )
      }

      navigate('/dashboard')
    } catch (error) {
      console.error('Error saving workout:', error)
      alert('Failed to save. Check console.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-[#09090b] text-gray-800 dark:text-gray-200 min-h-screen font-sans selection:bg-[#1978e5] selection:text-black antialiased">
      <style>{`
        .glass-panel {
            background: rgba(24, 24, 27, 0.6);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .font-cyber {
            font-family: 'Orbitron', sans-serif;
        }
      `}</style>

      <WorkoutNav
        elapsedTimeLabel={formatTime(elapsedSeconds)}
        liveCalories={liveCalories}
        isSaving={isSaving}
        onBack={() => navigate('/dashboard')}
        onFinish={handleFinish}
      />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider ml-1">
              Workout Type
            </label>
            <div className="relative group">
              <select
                value={category}
                onChange={e => setCategory(e.target.value as CategoryKey)}
                className="w-full bg-white dark:bg-[#18181b] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1978e5] focus:border-transparent shadow-sm transition-all cursor-pointer font-cyber tracking-wide text-sm"
              >
                {Object.entries(WORKOUT_CATEGORIES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500 dark:text-gray-400">
                <span className="material-icons-round">expand_more</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Session Name (e.g. Morning Lift)"
              value={sessionName}
              onChange={e => setSessionName(e.target.value)}
              className="w-full bg-transparent border-b-2 border-gray-300 dark:border-white/10 text-xl md:text-2xl font-bold text-center placeholder-gray-400 dark:placeholder-white/20 text-gray-900 dark:text-white py-2 focus:outline-none focus:border-[#1978e5] transition-colors font-cyber"
            />
          </div>
        </div>

        <div className="space-y-8">
          {exercises.map((exercise, exIndex) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              exIndex={exIndex}
              onRemoveExercise={() => handleRemoveExercise(exIndex)}
              onAddSet={() => handleAddSet(exIndex)}
              onRemoveSet={setId => handleRemoveSet(exIndex, setId)}
              onUpdateSet={(setIndex, field, val) => handleUpdateSet(exIndex, setIndex, field, val)}
              onToggleSet={setIndex => handleToggleSet(exIndex, setIndex)}
            />
          ))}
        </div>

        <div className="space-y-2 pt-4">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider ml-1 font-cyber">
            Add Next Exercise
          </label>
          <div className="flex gap-3">
            <div className="relative flex-grow">
              <select
                value={selectedExerciseToAdd}
                onChange={e => setSelectedExerciseToAdd(e.target.value)}
                className="w-full bg-white dark:bg-[#18181b] border border-gray-300 dark:border-white/10 text-gray-500 dark:text-gray-400 rounded-xl px-4 py-3.5 appearance-none focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-cyber tracking-wide text-sm"
              >
                <option value="">Select movement...</option>
                {Object.entries(EXERCISE_DATABASE).map(([cat, exList]) => (
                  <optgroup key={cat} label={cat}>
                    {exList.map(name => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </optgroup>
                ))}
                {customExercises.length > 0 && (
                  <optgroup label="Custom Assigned" className="text-yellow-500 font-bold">
                    {customExercises.map(ex => (
                      <option key={ex.id} value={ex.name}>
                        {ex.name} (Assigned)
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500 dark:text-gray-400">
                <span className="material-icons-round">search</span>
              </div>
            </div>
            <button
              onClick={handleAddExercise}
              disabled={!selectedExerciseToAdd}
              className="bg-[#1978e5] hover:bg-[#FACC15] text-black w-14 rounded-xl flex items-center justify-center shadow-[0_0_10px_rgba(250,204,21,0.2)] transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="h-12"></div>
      </main>
    </div>
  )
}
