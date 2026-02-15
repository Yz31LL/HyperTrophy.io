import { Trash2, MoreVertical, Check, Plus } from 'lucide-react'

interface WorkoutSet {
  id: string
  weight: number | ''
  reps: number | ''
  completed: boolean
}

interface ExerciseLog {
  id: string
  name: string
  sets: WorkoutSet[]
}

interface ExerciseCardProps {
  exercise: ExerciseLog
  exIndex: number
  onRemoveExercise: () => void
  onAddSet: () => void
  onRemoveSet: (setId: string) => void
  onUpdateSet: (setIndex: number, field: 'weight' | 'reps', value: number | '') => void
  onToggleSet: (setIndex: number) => void
}

export function ExerciseCard({
  exercise,
  onRemoveExercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onToggleSet,
}: ExerciseCardProps) {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#1978e5] via-[#F97316] to-[#06B6D4] rounded-2xl opacity-30 group-hover:opacity-60 transition duration-500 blur"></div>
      <div className="relative bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-1 h-8 bg-[#1978e5] rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white font-cyber capitalize">
              {exercise.name}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onRemoveExercise}
              className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button className="text-gray-400 hover:text-[#06B6D4] transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 md:gap-4 mb-3 text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest text-center px-2 font-cyber">
          <div className="col-span-1">Set</div>
          <div className="col-span-4">KG</div>
          <div className="col-span-4">Reps</div>
          <div className="col-span-3">Done</div>
        </div>

        <div className="space-y-3">
          {exercise.sets.map((set, setIndex) => (
            <div
              key={set.id}
              className={`grid grid-cols-12 gap-2 md:gap-4 items-center p-2 rounded-xl border transition-all ${
                set.completed
                  ? 'bg-[#1978e5]/5 border-[#1978e5]/30 shadow-[0_0_15px_rgba(250,204,21,0.05)]'
                  : 'border-transparent hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <div
                className={`col-span-1 text-center font-bold font-cyber ${set.completed ? 'text-[#1978e5]' : 'text-gray-400 dark:text-gray-500'}`}
              >
                {setIndex + 1}
              </div>
              <div className="col-span-4">
                <input
                  type="number"
                  value={set.weight}
                  onChange={e =>
                    onUpdateSet(
                      setIndex,
                      'weight',
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                  className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-center rounded-lg py-2 focus:ring-1 focus:ring-[#1978e5] focus:border-[#1978e5] font-mono font-bold"
                  placeholder="-"
                />
              </div>
              <div className="col-span-4">
                <input
                  type="number"
                  value={set.reps}
                  onChange={e =>
                    onUpdateSet(
                      setIndex,
                      'reps',
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                  className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-center rounded-lg py-2 focus:ring-1 focus:ring-[#1978e5] focus:border-[#1978e5] font-mono font-bold"
                  placeholder="-"
                />
              </div>
              <div className="col-span-3 flex justify-center">
                <button
                  onClick={() => onToggleSet(setIndex)}
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${
                    set.completed
                      ? 'bg-[#1978e5] border-[#1978e5] text-black'
                      : 'bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 text-transparent hover:border-[#1978e5] hover:text-[#1978e5]'
                  }`}
                >
                  <Check className={`h-5 w-5 ${!set.completed && 'opacity-0 hover:opacity-100'}`} />
                </button>
              </div>
              <button
                onClick={() => onRemoveSet(set.id)}
                className="absolute -left-10 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 p-2"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-dashed border-gray-200 dark:border-white/10">
          <button
            onClick={onAddSet}
            className="w-full py-2.5 rounded-lg border border-gray-300 dark:border-white/10 hover:border-[#1978e5] dark:hover:border-[#1978e5] text-gray-500 hover:text-[#1978e5] dark:text-gray-400 dark:hover:text-[#1978e5] transition-all flex items-center justify-center text-sm font-semibold uppercase tracking-wide group font-cyber"
          >
            <Plus className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            Add Set
          </button>
        </div>
      </div>
    </div>
  )
}
