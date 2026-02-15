import {
  Activity,
  Zap,
  ChevronDown,
  Info,
  Target,
  TrendingDown,
  Scale as ScaleIcon,
  Dumbbell,
} from 'lucide-react'
import { UseFormRegister, UseFormWatch } from 'react-hook-form'
import { UserProfileInput } from './OnboardingScreen'

interface LifestyleStepProps {
  register: UseFormRegister<UserProfileInput>
  watch: UseFormWatch<UserProfileInput>
}

export function LifestyleStep({ register, watch }: LifestyleStepProps) {
  const goal = watch('goal')
  const inputCyber =
    'h-12 w-full rounded-none border-b-2 border-zinc-800 bg-zinc-900/50 px-4 py-2 text-white placeholder:text-zinc-600 focus:border-yellow-500 focus:bg-zinc-800/80 focus:outline-none transition-all duration-300'

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1 font-chakra uppercase tracking-wide">
          Lifestyle & Goals
        </h2>
        <p className="text-zinc-400 text-sm font-light">
          How active are you and what do you want to achieve?
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3 group relative">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <Activity className="text-yellow-500 h-4 w-4" /> Activity Level
          </label>
          <div className="relative">
            <select {...register('activityLevel')} className={inputCyber}>
              <option value="sedentary">Sedentary (Office job, little exercise)</option>
              <option value="light">Light (Exercise 1-3 days/week)</option>
              <option value="moderate">Moderate (Exercise 3-5 days/week)</option>
              <option value="heavy">Heavy (Exercise 6-7 days/week)</option>
              <option value="athlete">Athlete (Physical job + hard training)</option>
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-yellow-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="space-y-3 group relative">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <Zap className="text-yellow-500 h-4 w-4" /> Archetype Strategy
          </label>
          <div className="relative">
            <select {...register('archetype')} className={inputCyber}>
              <option value="general">General Fitness (Balanced)</option>
              <option value="bodybuilder">Bodybuilder (High Protein)</option>
              <option value="fighter">Fighter (High Carb / Explosive)</option>
              <option value="crossfitter">CrossFitter (High Work Capacity)</option>
              <option value="senior">Senior (Longevity & Maintenance)</option>
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-yellow-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] text-zinc-600 flex items-center gap-1 font-mono">
            <Info className="h-3 w-3" /> Adjusts your macro split automatically.
          </p>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <Target className="text-yellow-500 h-4 w-4" /> Primary Goal
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'lose_weight', label: 'Lose Fat', icon: TrendingDown },
              { id: 'maintain', label: 'Maintain', icon: ScaleIcon },
              { id: 'gain_muscle', label: 'Gain Muscle', icon: Dumbbell },
            ].map(g => (
              <label key={g.id} className="cursor-pointer group relative">
                <input {...register('goal')} type="radio" value={g.id} className="peer sr-only" />
                <div className="h-full flex flex-col items-center justify-center p-6 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all peer-checked:border-yellow-500/50 peer-checked:bg-yellow-500/10 peer-checked:shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                  <div className="bg-zinc-800 rounded-full p-3 mb-3 peer-checked:bg-yellow-500 transition-colors group-hover:scale-110 duration-300">
                    <g.icon
                      className={`h-5 w-5 ${goal === g.id ? 'text-black' : 'text-zinc-400'}`}
                    />
                  </div>
                  <span className="font-bold text-xs font-chakra tracking-wider uppercase">
                    {g.label}
                  </span>
                  <span
                    className={`text-[8px] mt-2 uppercase tracking-widest transition-opacity font-bold text-yellow-500 ${
                      goal === g.id ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    Selected
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
