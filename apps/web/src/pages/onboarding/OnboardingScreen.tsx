import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { UserProfileSchema, type UserProfile } from '@repo/shared/schemas'
import { z } from 'zod'
import { auth, db } from '../../lib/firebase'
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacros,
} from '../../lib/health-calc'

// Modular Components
import { OnboardingHeader } from './OnboardingHeader'
import { OnboardingStepper } from './OnboardingStepper'
import { BiometricsStep } from './BiometricsStep'
import { LifestyleStep } from './LifestyleStep'
import { PlanStep } from './PlanStep'
import { OnboardingFooter } from './OnboardingFooter'

// Define Input type
export type UserProfileInput = z.input<typeof UserProfileSchema>

interface HealthResults {
  bmr: number
  tdee: number
  macros: {
    protein: number
    fat: number
    carbs: number
    calories: number
  }
}

export function OnboardingScreen() {
  const [step, setStep] = useState(0)
  const [results, setResults] = useState<HealthResults | null>(null)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { isSubmitting },
  } = useForm<UserProfileInput, undefined, UserProfile>({
    resolver: zodResolver(UserProfileSchema),
    defaultValues: {
      gender: 'male',
      age: 25,
      height: 175,
      weight: 75,
      activityLevel: 'moderate',
      goal: 'gain_muscle',
      dietaryPreference: 'standard',
      archetype: 'bodybuilder',
    },
    mode: 'onChange',
  })

  const formData = watch() as UserProfile

  const handleNext = async () => {
    let fieldsToValidate: (keyof UserProfileInput)[] = []
    if (step === 0) fieldsToValidate = ['age', 'gender', 'height', 'weight']
    if (step === 1) fieldsToValidate = ['activityLevel', 'goal', 'archetype']

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      if (step === 1) {
        const bmr = calculateBMR(formData)
        const tdee = calculateTDEE(bmr, formData.activityLevel)
        const targetCalories = calculateTargetCalories(tdee, formData.goal)
        const macros = calculateMacros(formData, targetCalories)
        setResults({ bmr, tdee, macros })
      }
      setStep(s => s + 1)
    }
  }

  const handleBack = () => {
    if (step === 0) navigate('/login')
    else setStep(s => s - 1)
  }

  const onSubmit = async (data: UserProfile) => {
    if (!auth.currentUser || !results) return

    try {
      const uid = auth.currentUser.uid
      const userRef = doc(db, 'users', uid)
      const profileRef = doc(db, 'users', uid, 'private_profile', 'main')

      await setDoc(
        userRef,
        {
          uid: uid,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName,
          role: 'trainee',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )

      await setDoc(profileRef, {
        ...data,
        ...results,
        updatedAt: serverTimestamp(),
      })

      navigate('/dashboard')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile.')
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-white flex items-center justify-center p-4 relative overflow-hidden selection:bg-yellow-500 selection:text-black">
      {/* Background Grid & Gradient */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(234,179,8,0.08),transparent_70%)] pointer-events-none z-0" />
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent opacity-50 z-50" />

      <div className="w-full max-w-2xl z-10 relative">
        <OnboardingHeader step={step} />

        <div className="relative bg-[#18181b]/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-yellow-500/30 rounded-tl-xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-yellow-500/30 rounded-br-xl pointer-events-none" />

          <OnboardingStepper step={step} />

          <div className="p-8 pt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                {step === 0 && <BiometricsStep register={register} />}
                {step === 1 && <LifestyleStep register={register} watch={watch} />}
                {step === 2 && results && <PlanStep results={results} />}
              </motion.div>
            </AnimatePresence>
          </div>

          <OnboardingFooter
            step={step}
            handleBack={handleBack}
            handleNext={handleNext}
            handleSubmit={handleSubmit(onSubmit)}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* System Info */}
        <div className="mt-6 flex justify-between items-center text-[10px] text-zinc-700 font-mono uppercase tracking-[0.2em] px-2 font-bold">
          <span>HyperTrophy Pro v2.4.0</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> System Online
          </span>
        </div>
      </div>

      <style>{`
        .font-chakra { font-family: 'Chakra Petch', sans-serif; }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
