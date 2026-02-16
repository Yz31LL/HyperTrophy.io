import { Link } from 'react-router-dom'

interface ActionButtonSectionProps {
  onLogMeal: () => void
  onLogWeight: () => void
}

export function ActionButtonSection({ onLogMeal, onLogWeight }: ActionButtonSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Link
        to="/calendar"
        className="glass-panel group relative p-6 rounded-2xl border-l-4 border-yellow-500 hover:bg-yellow-500/10 transition-all active:scale-[0.98] flex flex-col items-start gap-3"
      >
        <span className="material-symbols-outlined text-yellow-500 text-3xl group-hover:scale-110 transition-transform">
          event
        </span>
        <span className="font-cyber font-bold text-white text-lg uppercase tracking-wider">
          Schedule
        </span>
        <span className="absolute top-4 right-4 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity text-xl">
          →
        </span>
      </Link>

      <button
        onClick={onLogMeal}
        className="glass-panel group relative p-6 rounded-2xl border-l-4 border-[#00f3ff] hover:bg-[#00f3ff]/10 transition-all active:scale-[0.98] flex flex-col items-start gap-3 text-left w-full"
      >
        <span className="material-symbols-outlined text-[#00f3ff] text-3xl group-hover:scale-110 transition-transform">
          restaurant
        </span>
        <span className="font-cyber font-bold text-white text-lg uppercase tracking-wider">
          Log Meal
        </span>
        <span className="absolute top-4 right-4 text-[#00f3ff] opacity-0 group-hover:opacity-100 transition-opacity text-xl">
          +
        </span>
      </button>

      <button
        onClick={onLogWeight}
        className="glass-panel group relative p-6 rounded-2xl border-l-4 border-[#ff9100] hover:bg-[#ff9100]/10 transition-all active:scale-[0.98] flex flex-col items-start gap-3 text-left w-full"
      >
        <span className="material-symbols-outlined text-[#ff9100] text-3xl group-hover:scale-110 transition-transform">
          scale
        </span>
        <span className="font-cyber font-bold text-white text-lg uppercase tracking-wider">
          Update Weight
        </span>
        <span className="absolute top-4 right-4 text-[#ff9100] opacity-0 group-hover:opacity-100 transition-opacity text-xl">
          ↑
        </span>
      </button>

      <Link
        to="/workout"
        className="glass-panel group relative p-6 rounded-2xl border-l-4 border-[#00ff9d] hover:bg-[#00ff9d]/10 transition-all active:scale-[0.98] flex flex-col items-start gap-3 overflow-hidden"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00ff9d]/20 to-[#00f3ff]/20 blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
        <span className="material-symbols-outlined text-[#00ff9d] text-3xl group-hover:scale-110 transition-transform relative z-10">
          fitness_center
        </span>
        <span className="font-cyber font-bold text-white text-lg uppercase tracking-wider relative z-10">
          Workouts
        </span>
        <span className="absolute top-4 right-4 text-[#00ff9d] opacity-0 group-hover:opacity-100 transition-opacity text-xl z-20">
          →
        </span>
      </Link>
    </div>
  )
}
