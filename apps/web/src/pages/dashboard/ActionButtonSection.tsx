import { Link } from 'react-router-dom'

interface ActionButtonSectionProps {
  onLogMeal: () => void
  onLogWeight: () => void
}

export function ActionButtonSection({ onLogMeal, onLogWeight }: ActionButtonSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onLogMeal}
          className="glass-panel group relative p-6 rounded-2xl border-l-4 border-[#00ff9d] hover:bg-[#00ff9d]/10 transition-all active:scale-[0.98]"
        >
          <div className="flex flex-col items-start gap-3">
            <span className="material-symbols-outlined text-[#00ff9d] text-3xl group-hover:scale-110 transition-transform">
              restaurant
            </span>
            <span className="font-cyber font-bold text-white text-lg uppercase">Log Meal</span>
          </div>
          <span className="absolute top-4 right-4 text-[#00ff9d] opacity-0 group-hover:opacity-100 transition-opacity text-2xl">
            +
          </span>
        </button>
        <button
          onClick={onLogWeight}
          className="glass-panel group relative p-6 rounded-2xl border-l-4 border-[#00f3ff] hover:bg-[#00f3ff]/10 transition-all active:scale-[0.98]"
        >
          <div className="flex flex-col items-start gap-3">
            <span className="material-symbols-outlined text-[#00f3ff] text-3xl group-hover:scale-110 transition-transform">
              monitor_weight
            </span>
            <span className="font-cyber font-bold text-white text-lg uppercase">Log Weight</span>
          </div>
          <span className="absolute top-4 right-4 text-[#00f3ff] opacity-0 group-hover:opacity-100 transition-opacity text-2xl">
            +
          </span>
        </button>
      </div>

      <Link to="/workout" className="relative group cursor-pointer block">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ffee00] via-[#ff9100] to-[#ff0055] rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        <div className="relative glass-panel rounded-2xl p-6 h-full flex items-center justify-between bg-[#0f1014] hover:bg-[#131419] transition-colors">
          <div className="flex items-center gap-6">
            <div className="p-3 bg-[#ffee00]/10 rounded-xl border border-[#ffee00]/20 shadow-[0_0_15px_rgba(255,238,0,0.1)]">
              <span className="material-symbols-outlined text-[#ffee00] text-3xl">
                fitness_center
              </span>
            </div>
            <div>
              <h3 className="font-cyber font-bold text-xl text-white tracking-wide">
                WORKOUT SESSION
              </h3>
              <p className="text-sm text-slate-400 mt-1">Ready to crush your goals?</p>
            </div>
          </div>
          <div className="bg-[#ffee00] hover:bg-[#ffd500] text-black font-cyber font-bold py-3 px-8 rounded-lg shadow-[0_0_20px_rgba(255,238,0,0.4)] hover:shadow-[0_0_30px_rgba(255,238,0,0.6)] transition-all">
            START LOG
          </div>
        </div>
      </Link>
    </div>
  )
}
