interface WorkoutNavProps {
  elapsedTimeLabel: string
  liveCalories: number
  isSaving: boolean
  onBack: () => void
  onFinish: () => void
}

export function WorkoutNav({
  elapsedTimeLabel,
  liveCalories,
  isSaving,
  onBack,
  onFinish,
}: WorkoutNavProps) {
  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-gray-200 dark:border-white/10 px-4 py-3 md:px-8 flex items-center justify-between">
      <button
        onClick={onBack}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-300"
      >
        <span className="material-icons-round">arrow_back</span>
      </button>

      <div className="flex flex-col items-center">
        <h1 className="font-cyber font-bold text-lg md:text-xl tracking-wide text-gray-900 dark:text-white uppercase">
          Active Session
        </h1>
        <div className="flex items-center space-x-4 text-xs md:text-sm font-mono mt-0.5">
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <span className="material-icons-round text-base mr-1">timer</span>
            <span className="text-[#06B6D4] font-bold">{elapsedTimeLabel}</span>
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <span className="material-icons-round text-base mr-1 text-[#F97316]">
              local_fire_department
            </span>
            <span className="text-[#1978e5] font-bold">{liveCalories} kcal</span>
          </div>
        </div>
      </div>

      <button
        onClick={onFinish}
        disabled={isSaving}
        className="bg-[#1978e5] hover:bg-[#FACC15] text-black font-bold py-2 px-6 rounded-lg shadow-[0_0_10px_rgba(250,204,21,0.2)] transition-all transform hover:scale-105 active:scale-95 font-cyber text-sm disabled:opacity-50"
      >
        {isSaving ? 'SAVING...' : 'FINISH'}
      </button>
    </nav>
  )
}
