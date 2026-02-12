import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { Plus, Trash2, Check, ArrowLeft } from 'lucide-react'
import { Button } from '@repo/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/Card'
import { Input } from '@repo/ui/Input'
import { Progress } from '@repo/ui/Progress'
import type { WorkoutSession, ExerciseLog, WorkoutSet } from '@repo/shared/schemas'

// --- MOCK DATA INITIALIZER ---
const createEmptySet = (): WorkoutSet => ({
  id: Math.random().toString(36).substr(2, 9),
  weight: 0,
  reps: 0,
  completed: false,
})

const createExercise = (name: string): ExerciseLog => ({
  id: Math.random().toString(36).substr(2, 9),
  name,
  sets: [createEmptySet(), createEmptySet(), createEmptySet()], // Default 3 sets
})

export function WorkoutSession() {
  const navigate = useNavigate()

  // Local state for the active session
  const [session, setSession] = useState<WorkoutSession>({
    id: 'temp-id',
    date: new Date().toISOString(),
    exercises: [createExercise('Squat'), createExercise('Bench Press')],
  })

  // --- LOGIC: Progress Calculation ---
  const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)
  const completedSets = session.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter(s => s.completed).length,
    0
  )
  const progress = totalSets === 0 ? 0 : (completedSets / totalSets) * 100

  // --- ACTIONS ---
  const toggleSetComplete = (exIndex: number, setIndex: number) => {
    setSession(prev => {
      const newExercises = [...prev.exercises]
      const newSets = [...newExercises[exIndex].sets]
      newSets[setIndex] = { ...newSets[setIndex], completed: !newSets[setIndex].completed }
      newExercises[exIndex] = { ...newExercises[exIndex], sets: newSets }
      return { ...prev, exercises: newExercises }
    })
  }

  const removeSet = (exIndex: number, setId: string) => {
    const newExercises = [...session.exercises]
    newExercises[exIndex].sets = newExercises[exIndex].sets.filter(s => s.id !== setId)
    setSession({ ...session, exercises: newExercises })
  }

  const addSet = (exIndex: number) => {
    const newExercises = [...session.exercises]
    newExercises[exIndex].sets.push(createEmptySet())
    setSession({ ...session, exercises: newExercises })
  }

  const updateSet = (
    exIndex: number,
    setIndex: number,
    field: 'weight' | 'reps' | 'rpe',
    value: number
  ) => {
    setSession(prev => {
      const newExercises = [...prev.exercises]
      const newSets = [...newExercises[exIndex].sets]
      newSets[setIndex] = { ...newSets[setIndex], [field]: value }
      newExercises[exIndex] = { ...newExercises[exIndex], sets: newSets }
      return { ...prev, exercises: newExercises }
    })
  }

  const handleFinish = () => {
    // TODO: Save to Firebase in Phase 3.2
    console.log('Saving workout:', session)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Exit
          </Button>
          <span className="font-bold text-lg">Current Workout</span>
          <Button size="sm" onClick={handleFinish}>
            Finish
          </Button>
        </div>

        {/* MOTION: Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-md mx-auto">
        {session.exercises.map((exercise, exIndex) => (
          <Card key={exercise.id} className="overflow-hidden">
            <CardHeader className="bg-slate-100 dark:bg-slate-800 py-3">
              <CardTitle className="text-base flex justify-between items-center">
                {exercise.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* SET HEADERS */}
              <div className="grid grid-cols-10 gap-2 p-2 text-xs font-medium text-center text-muted-foreground border-b">
                <div className="col-span-2">SET</div>
                <div className="col-span-3">KG</div>
                <div className="col-span-3">REPS</div>
                <div className="col-span-2">DONE</div>
              </div>

              {/* SETS LIST */}
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
                className="w-full rounded-none border-t h-12 text-muted-foreground hover:text-primary"
                onClick={() => addSet(exIndex)}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Set
              </Button>
            </CardContent>
          </Card>
        ))}
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
  onUpdate: (field: 'weight' | 'reps' | 'rpe', val: number) => void
}) {
  // We use Framer Motion drag to detect swipe
  // If dragged far enough left, we show delete button or delete

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="relative border-b last:border-0 bg-white dark:bg-gray-900"
    >
      {/* Background Layer (Delete Icon) */}
      <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-4">
        <Trash2 className="text-white h-5 w-5" />
      </div>

      {/* Foreground Layer (Input Fields) */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info: PanInfo) => {
          if (info.offset.x < -100) {
            onDelete()
          }
        }}
        className="relative bg-white dark:bg-gray-900 grid grid-cols-10 gap-2 p-2 items-center"
      >
        <div className="col-span-2 text-center font-mono text-muted-foreground">{index}</div>
        <div className="col-span-3">
          <Input
            type="number"
            placeholder="0"
            className="text-center h-8"
            value={set.weight ?? ''}
            onChange={e => onUpdate('weight', Number(e.target.value))}
          />
        </div>
        <div className="col-span-3">
          <Input
            type="number"
            placeholder="0"
            className="text-center h-8"
            value={set.reps ?? ''}
            onChange={e => onUpdate('reps', Number(e.target.value))}
          />
        </div>
        <div className="col-span-2 flex justify-center">
          <motion.div
            whileTap={{ scale: 0.9 }}
            onClick={onToggle}
            className={`
              w-8 h-8 rounded-md flex items-center justify-center cursor-pointer border
              ${
                set.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
              }
            `}
          >
            {set.completed && <Check className="h-4 w-4" />}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
