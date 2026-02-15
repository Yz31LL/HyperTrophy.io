import { Users, Calendar, Ruler, Scale, ChevronDown } from 'lucide-react'
import { UseFormRegister } from 'react-hook-form'
import { UserProfileInput } from './OnboardingScreen'

interface BiometricsStepProps {
  register: UseFormRegister<UserProfileInput>
}

export function BiometricsStep({ register }: BiometricsStepProps) {
  const inputCyber =
    'h-12 w-full rounded-none border-b-2 border-zinc-800 bg-zinc-900/50 px-4 py-2 text-white placeholder:text-zinc-600 focus:border-yellow-500 focus:bg-zinc-800/80 focus:outline-none transition-all duration-300'

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1 font-chakra uppercase">
          Initialize Biometrics
        </h2>
        <p className="text-zinc-400 text-sm">
          Input baseline data to calibrate your metabolic engine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3 group">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 group-focus-within:text-yellow-500 transition-colors">
            <Users className="w-3 h-3" /> Gender
          </label>
          <div className="relative">
            <select {...register('gender')} className={inputCyber}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-zinc-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="space-y-3 group">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 group-focus-within:text-yellow-500 transition-colors">
            <Calendar className="w-3 h-3" /> Age
          </label>
          <div className="relative">
            <input
              {...register('age', { valueAsNumber: true })}
              className={inputCyber + ' font-mono'}
              placeholder="25"
              type="number"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[10px] text-zinc-500 font-mono">
              YRS
            </span>
          </div>
        </div>

        <div className="space-y-3 group">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 group-focus-within:text-yellow-500 transition-colors">
            <Ruler className="w-3 h-3" /> Height
          </label>
          <div className="relative">
            <input
              {...register('height', { valueAsNumber: true })}
              className={inputCyber + ' font-mono'}
              placeholder="175"
              type="number"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[10px] text-zinc-500 font-mono">
              CM
            </span>
          </div>
        </div>

        <div className="space-y-3 group">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 group-focus-within:text-yellow-500 transition-colors">
            <Scale className="w-3 h-3" /> Weight
          </label>
          <div className="relative">
            <input
              {...register('weight', { valueAsNumber: true })}
              className={inputCyber + ' font-mono'}
              placeholder="75"
              type="number"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[10px] text-zinc-500 font-mono">
              KG
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
