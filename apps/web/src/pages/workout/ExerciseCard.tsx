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
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#1978e5] via-[#F97316] to-[#06B6D4] rounded-2xl opacity-10 group-hover:opacity-30 transition duration-500 blur-xl"></div>
      <div className="relative bg-[#0f1014] rounded-2xl border border-white/10 p-4 md:p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-1.5 h-6 bg-[#ffee00] rounded-full shadow-[0_0_12px_rgba(255,238,0,0.4)]"></div>
            <h2 className="text-xl font-bold text-white font-cyber tracking-wide">
              {exercise.name}
            </h2>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={onRemoveExercise}
              className="text-white/40 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-white/5"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button className="text-white/40 hover:text-[#ffee00] transition-colors p-2 rounded-lg hover:bg-white/5">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 md:gap-4 mb-3 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] text-center px-2 font-cyber">
          <div className="col-span-1">Set</div>
          <div className="col-span-4">KG</div>
          <div className="col-span-4">Reps</div>
          <div className="col-span-3">Done</div>
        </div>

        <div className="space-y-3">
          {exercise.sets.map((set, setIndex) => (
            <div
              key={set.id}
              className={`relative grid grid-cols-12 gap-2 md:gap-4 items-center p-2 rounded-xl border transition-all group/row ${
                set.completed
                  ? 'bg-white/5 border-[#ffee00]/30 shadow-[0_0_20px_rgba(255,238,0,0.05)]'
                  : 'border-transparent hover:bg-white/5'
              }`}
            >
              {set.completed && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#ffee00] rounded-r-full shadow-[0_0_8px_#ffee00]" />
              )}

              <div
                className={`col-span-1 text-center font-bold font-cyber text-sm ${set.completed ? 'text-[#ffee00]' : 'text-white/20'}`}
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
                  className={`w-full border border-white/10 text-center rounded-lg py-2.5 focus:ring-1 focus:ring-[#ffee00] focus:border-[#ffee00] font-mono font-bold transition-all placeholder:text-white/10 ${set.completed ? 'bg-white text-black' : 'bg-[#18181b] text-white'}`}
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
                  className={`w-full border border-white/10 text-center rounded-lg py-2.5 focus:ring-1 focus:ring-[#ffee00] focus:border-[#ffee00] font-mono font-bold transition-all placeholder:text-white/10 ${set.completed ? 'bg-white text-black' : 'bg-[#18181b] text-white'}`}
                  placeholder="-"
                />
              </div>
              <div className="col-span-3 flex justify-center relative">
                <button
                  onClick={() => onToggleSet(setIndex)}
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${
                    set.completed
                      ? 'bg-[#ffee00] border-[#ffee00] text-black shadow-[0_0_15px_rgba(255,238,0,0.3)]'
                      : 'bg-white/5 border-white/10 text-transparent hover:border-[#ffee00]/50'
                  }`}
                >
                  <Check
                    className={`h-5 w-5 ${set.completed ? 'opacity-100' : 'opacity-0 group-hover/row:opacity-30 text-[#ffee00]'}`}
                  />
                </button>

                <button
                  onClick={() => onRemoveSet(set.id)}
                  className="absolute -right-8 opacity-0 group-hover/row:opacity-100 transition-opacity text-red-500/50 hover:text-red-500 p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-dashed border-white/10">
          <button
            onClick={onAddSet}
            className="w-full py-3 rounded-xl border border-white/5 hover:border-[#ffee00]/30 bg-white/[0.02] hover:bg-[#ffee00]/5 text-white/40 hover:text-[#ffee00] transition-all flex items-center justify-center text-xs font-bold uppercase tracking-[0.2em] group font-cyber"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            Add Set
          </button>
        </div>
      </div>
    </div>
  )
}
