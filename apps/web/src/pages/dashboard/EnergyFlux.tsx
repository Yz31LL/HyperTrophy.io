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
      <div className="glass-panel rounded-2xl px-8 md:px-16 py-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f3ff] via-[#ff9100] to-[#00ff9d] opacity-50"></div>
        <h2 className="text-xl font-cyber text-white mb-10 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#00f3ff]">bolt</span>
          ENERGY FLUX
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 items-start gap-8 md:gap-0 max-w-4xl mx-auto">
          {/* INPUT */}
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
            <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-widest leading-none">
              KCAL CONSUMED
            </p>
          </div>

          {/* OPERATOR: MINUS */}
          <div className="flex flex-col items-center justify-start h-full pt-6">
            <div className="text-zinc-600 font-cyber font-bold text-3xl opacity-50">-</div>
          </div>

          {/* OUTPUT */}
          <div className="text-center relative group">
            <div className="absolute inset-0 bg-[#ff9100]/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p className="text-xs font-bold text-[#ff9100] uppercase tracking-[0.2em] mb-2">
              Output
            </p>
            <p
              className="text-5xl font-cyber font-bold text-white neon-text"
              style={{ color: 'var(--neon-orange)' }}
            >
              {Math.round(output)}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded border border-white/5">
              <span className="text-[9px] text-slate-500 font-mono tracking-tighter uppercase">
                {Math.round(tdee)} Base + {dailyCaloriesBurned} Active
              </span>
            </div>
          </div>

          {/* OPERATOR: EQUALS */}
          <div className="flex flex-col items-center justify-start h-full pt-6">
            <div className="text-zinc-600 font-cyber font-bold text-3xl opacity-50">=</div>
          </div>

          {/* NET LOAD */}
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
              className={`text-[10px] mt-2 font-bold tracking-widest uppercase ${isSurplus ? 'text-[#ff0055]' : 'text-[#00ff9d]'}`}
            >
              {isSurplus ? 'Surplus (Bulking)' : 'Deficit (Cutting)'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
