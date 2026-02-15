import { Check, Activity, Target, FileCheck } from 'lucide-react'

interface OnboardingStepperProps {
  step: number
}

export function OnboardingStepper({ step }: OnboardingStepperProps) {
  const steps = [
    { icon: Activity, label: 'Biometrics' },
    { icon: Target, label: 'Goals' },
    { icon: FileCheck, label: 'Plan' },
  ]

  return (
    <div className="border-b border-white/5 bg-zinc-900/50 p-6">
      <div className="flex justify-between items-center relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-800 -z-10 transform -translate-y-1/2" />
        {steps.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-2 bg-[#09090b] px-2 z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                i <= step
                  ? 'text-yellow-500 border-yellow-500 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                  : 'text-zinc-600 border-zinc-800 bg-zinc-900'
              }`}
            >
              {i < step ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                i <= step ? 'text-yellow-500' : 'text-zinc-600'
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
