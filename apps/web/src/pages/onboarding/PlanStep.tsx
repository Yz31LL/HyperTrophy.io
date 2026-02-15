import { Zap, FlaskConical } from 'lucide-react'

interface PlanStepProps {
  results: {
    bmr: number
    tdee: number
    macros: {
      protein: number
      fat: number
      carbs: number
      calories: number
    }
  }
}

export function PlanStep({ results }: PlanStepProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white tracking-tight uppercase font-chakra">
          Your Verified Plan
        </h1>
        <p className="text-zinc-400 text-xs">Here is the science-backed math for your body.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl text-center backdrop-blur-md relative group hover:border-white/10 transition-colors">
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 font-mono">
            BMR
          </div>
          <div className="text-2xl font-black text-white font-chakra">{results.bmr}</div>
          <div className="text-[10px] text-zinc-700 uppercase tracking-wider mt-1 font-bold">
            kcal/day
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl text-center backdrop-blur-md relative group hover:border-white/10 transition-colors">
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 font-mono">
            TDEE
          </div>
          <div className="text-2xl font-black text-white font-chakra">{results.tdee}</div>
          <div className="text-[10px] text-zinc-700 uppercase tracking-wider mt-1 font-bold">
            Maintenance
          </div>
        </div>
        <div className="bg-yellow-500/5 border border-yellow-500/50 p-4 rounded-xl text-center shadow-[0_0_20px_rgba(234,179,8,0.15)] relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-1 text-[10px] text-yellow-500 font-bold uppercase tracking-widest mb-2 font-mono">
              <Zap className="h-3 w-3" /> Target
            </div>
            <div className="text-3xl font-black text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] font-chakra">
              {results.macros.calories}
            </div>
            <div className="text-[10px] text-yellow-500/70 uppercase tracking-wider mt-1 font-bold">
              kcal/day
            </div>
          </div>
        </div>
      </div>

      {/* Macro Progress */}
      <div className="bg-zinc-900/10 rounded-xl p-5 border border-white/5 space-y-4">
        <div className="flex justify-between items-end">
          <h4 className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest font-chakra">
            Daily Macro Split
          </h4>
          <span className="text-[10px] text-zinc-600 font-mono">OPTIMIZED RATIO</span>
        </div>
        <div className="h-5 w-full bg-black/40 border border-white/5 rounded-sm overflow-hidden flex relative">
          <div className="h-full bg-blue-600 relative group" style={{ width: '40%' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
          </div>
          <div className="h-full bg-green-600 relative group" style={{ width: '30%' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
          </div>
          <div className="h-full bg-orange-500 relative group" style={{ width: '30%' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
          </div>
        </div>
        <div className="flex justify-between items-center text-[10px] text-zinc-400 pt-1 font-mono uppercase">
          <div className="flex items-center group">
            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            <span>Protein: {results.macros.protein}g</span>
          </div>
          <div className="flex items-center group">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
            <span>Fats: {results.macros.fat}g</span>
          </div>
          <div className="flex items-center group">
            <div className="w-2 h-2 rounded-full bg-orange-500 mr-2 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
            <span>Carbs: {results.macros.carbs}g</span>
          </div>
        </div>
      </div>

      <div className="relative bg-zinc-900/40 p-4 rounded-lg border-l-2 border-yellow-500/50 flex gap-3">
        <FlaskConical className="text-yellow-500 h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="text-[10px] leading-relaxed text-zinc-400 font-mono">
          <strong className="text-yellow-400 block mb-1 uppercase tracking-widest">
            Scientific Verification
          </strong>
          These numbers are based on the Mifflin-St Jeor equation. Our algorithm will dynamically
          adjust these targets based on your metabolic feedback loop over the next 14 days.
        </div>
      </div>
    </div>
  )
}
