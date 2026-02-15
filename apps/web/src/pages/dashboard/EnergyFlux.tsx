interface EnergyFluxProps {
  totalConsumed: number
  tdee: number
  dailyCaloriesBurned: number
}

export function EnergyFlux({ totalConsumed, tdee, dailyCaloriesBurned }: EnergyFluxProps) {
  const output = tdee + dailyCaloriesBurned
  const net = Math.round(totalConsumed - output)
  const isSurplus = totalConsumed > output

  return (
    <section className="relative">
      <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#00f3ff] rounded-full blur-[80px] opacity-20"></div>
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#ff9100] rounded-full blur-[80px] opacity-20"></div>
      <div className="glass-panel rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f3ff] via-[#ff9100] to-[#00ff9d] opacity-50"></div>
        <h2 className="text-xl font-cyber text-white mb-8 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#00f3ff]">bolt</span>
          ENERGY FLUX
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-8 md:gap-0">
          <div className="text-center relative group">
            <div className="absolute inset-0 bg-[#00f3ff]/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p className="text-xs font-bold text-[#00f3ff] uppercase tracking-[0.2em] mb-2">
              Input
            </p>
            <p
              className="text-5xl font-cyber font-bold text-white neon-text"
              style={{ color: 'var(--neon-blue)' }}
            >
              {Math.round(totalConsumed)}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-mono">KCAL CONSUMED</p>
          </div>
          <div className="text-zinc-600 font-cyber font-bold text-3xl text-center opacity-50">
            -
          </div>
          <div className="text-center relative group">
            <div className="absolute inset-0 bg-[#ff9100]/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p className="text-xs font-bold text-[#ff9100] uppercase tracking-[0.2em] mb-2">
              Output
            </p>
            <div className="flex flex-col items-center">
              <p
                className="text-5xl font-cyber font-bold text-white neon-text"
                style={{ color: 'var(--neon-orange)' }}
              >
                {Math.round(output)}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
                {Math.round(tdee)} BASE + {dailyCaloriesBurned} ACTIVE
              </span>
            </div>
          </div>
          <div className="text-zinc-600 font-cyber font-bold text-3xl text-center opacity-50">
            =
          </div>
          <div className="text-center relative">
            <div className="absolute inset-0 bg-[#00ff9d]/10 blur-xl rounded-full"></div>
            <p className="text-xs font-bold text-[#00ff9d] uppercase tracking-[0.2em] mb-2">
              Net Load
            </p>
            <p
              className={`text-5xl font-cyber font-bold neon-text ${isSurplus ? 'text-[#ff0055]' : 'text-[#00ff9d]'}`}
            >
              {net}
            </p>
            <p
              className={`text-xs mt-1 font-bold tracking-widest uppercase ${isSurplus ? 'text-[#ff0055]' : 'text-[#00ff9d]'}`}
            >
              {isSurplus ? 'Surplus (Bulking)' : 'Deficit (Cutting)'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
