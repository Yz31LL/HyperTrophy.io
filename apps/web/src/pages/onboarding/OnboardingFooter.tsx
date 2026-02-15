import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'

interface OnboardingFooterProps {
  step: number
  handleBack: () => void
  handleNext: () => void
  handleSubmit: () => void
  isSubmitting: boolean
}

export function OnboardingFooter({
  step,
  handleBack,
  handleNext,
  handleSubmit,
  isSubmitting,
}: OnboardingFooterProps) {
  return (
    <div className="border-t border-white/5 p-6 flex flex-col sm:flex-row justify-between items-center bg-zinc-900/10 gap-4">
      <button
        type="button"
        onClick={handleBack}
        className="w-full sm:w-auto text-zinc-500 hover:text-white flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors group px-4 py-2 rounded-lg hover:bg-white/5 font-mono"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>{step === 0 ? 'Abort' : 'Back'}</span>
      </button>

      {step < 2 ? (
        <button
          type="button"
          onClick={handleNext}
          className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3.5 px-8 rounded-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transform hover:-translate-y-0.5 font-chakra uppercase leading-none"
        >
          <span>NEXT PHASE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto relative group overflow-hidden bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-3.5 rounded-sm font-bold text-sm flex items-center justify-center transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] font-chakra uppercase leading-none"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Check className="mr-2 h-5 w-5 font-bold" />
              SAVE & START JOURNEY
            </>
          )}
        </button>
      )}
    </div>
  )
}
