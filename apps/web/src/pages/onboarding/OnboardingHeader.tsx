import { Dumbbell } from 'lucide-react'

interface OnboardingHeaderProps {
  step: number
}

export function OnboardingHeader({ step }: OnboardingHeaderProps) {
  const titles = ['User Profile', 'Lifestyle', 'Verification']

  return (
    <div className="mb-8 text-center">
      <h1 className="text-3xl font-bold tracking-tighter uppercase text-white flex items-center justify-center gap-2 font-chakra">
        <Dumbbell className="text-yellow-500 h-8 w-8" />
        <span className="tracking-widest">
          Hyper<span className="text-yellow-500">Trophy</span>
        </span>
      </h1>
      <p className="text-zinc-500 text-[10px] mt-1 tracking-widest uppercase font-bold font-mono">
        System Initialization // {titles[step]}
      </p>
    </div>
  )
}
