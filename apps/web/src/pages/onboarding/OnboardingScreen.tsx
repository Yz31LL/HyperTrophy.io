import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { UserProfileSchema, type UserProfile } from '@repo/shared/schemas'
import { Button } from '@repo/ui/Button'
import { z } from 'zod'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@repo/ui/Card'
import { auth, db } from '../../lib/firebase'
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacros,
} from '../../lib/health-calc'
import { Loader2, ArrowRight, ArrowLeft, Check, X } from 'lucide-react' // Added 'X' icon

// Steps definition
const STEPS = [
  { title: 'Biometrics', desc: "Let's get your baseline numbers." },
  { title: 'Lifestyle and Goals', desc: 'How active are you and what do you want to achieve?' },
  { title: 'Your Verified Plan', desc: 'Here is the science-backed math for your body.' },
]

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

// Define Input type to allow optional fields (handled by Zod defaults)
type UserProfileInput = z.input<typeof UserProfileSchema>

export function OnboardingScreen() {
  const [step, setStep] = useState(0)
  const [results, setResults] = useState<HealthResults | null>(null)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserProfileInput, undefined, UserProfile>({
    resolver: zodResolver(UserProfileSchema),
    defaultValues: {
      gender: 'male',
      age: 25,
      height: 170,
      weight: 70,
      activityLevel: 'sedentary',
      goal: 'maintain',
      dietaryPreference: 'standard',
      archetype: 'general',
    },
    mode: 'onChange',
  })

  // Watch values for real-time preview
  const formData = watch() as UserProfile

  const handleNext = async () => {
    let fieldsToValidate: (keyof UserProfileInput)[] = []

    if (step === 0) fieldsToValidate = ['age', 'gender', 'height', 'weight']
    if (step === 1) fieldsToValidate = ['activityLevel', 'goal']

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      if (step === 1) {
        // Run the Math Engine before moving to Step 3
        const bmr = calculateBMR(formData)
        const tdee = calculateTDEE(bmr, formData.activityLevel)
        const targetCalories = calculateTargetCalories(tdee, formData.goal)
        const macros = calculateMacros(formData, targetCalories)

        setResults({ bmr, tdee, macros })
      }
      setStep(s => s + 1)
    }
  }

  // UPDATED: Handle Back/Cancel Logic
  const handleBack = () => {
    if (step === 0) {
      // If on first step, go back to login
      navigate('/login')
    } else {
      // Otherwise go to previous step
      setStep(s => s - 1)
    }
  }

  const onSubmit = async (data: UserProfile) => {
    if (!auth.currentUser) return

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

      // Step D: Now save the Profile to the sub-collection
      await setDoc(profileRef, {
        ...data,
        ...results, // Save the calculated BMR/Macros
        updatedAt: serverTimestamp(),
      })

      // Success! Redirect to dashboard
      navigate('/dashboard')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile. Please check console for details.')
    }
  }

  // Helper class for dark inputs
  const inputClass =
    'flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500'

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4">
      {/* Background Gradient Effect */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-black to-black pointer-events-none" />

      <Card className="w-full max-w-lg z-10 bg-zinc-950 border-zinc-800 shadow-2xl">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={`flex items-center ${i <= step ? 'text-yellow-500' : 'text-zinc-600'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    i <= step
                      ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500 font-bold'
                      : 'border-zinc-700 text-zinc-700'
                  } mr-2`}
                >
                  {i + 1}
                </div>
                <span className="hidden sm:inline text-sm font-medium">{s.title}</span>
              </div>
            ))}
          </div>
          <CardTitle className="text-white">{STEPS[step].title}</CardTitle>
          <CardDescription className="text-zinc-400">{STEPS[step].desc}</CardDescription>
        </CardHeader>

        <CardContent>
          <form id="onboarding-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* --- STEP 0: BIOMETRICS --- */}
            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Gender</label>
                  <select {...register('gender')} className={inputClass}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Age</label>
                  <input
                    type="number"
                    {...register('age', { valueAsNumber: true })}
                    className={inputClass}
                    placeholder="years"
                  />
                  {errors.age && <p className="text-red-500 text-xs">{errors.age.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Height (cm)</label>
                  <input
                    type="number"
                    {...register('height', { valueAsNumber: true })}
                    className={inputClass}
                    placeholder="cm"
                  />
                  {errors.height && <p className="text-red-500 text-xs">{errors.height.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Weight (kg)</label>
                  <input
                    type="number"
                    {...register('weight', { valueAsNumber: true })}
                    className={inputClass}
                    placeholder="kg"
                  />
                  {errors.weight && <p className="text-red-500 text-xs">{errors.weight.message}</p>}
                </div>
              </div>
            )}

            {/* --- STEP 1: LIFESTYLE --- */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Activity Level</label>
                  <select {...register('activityLevel')} className={inputClass}>
                    <option value="sedentary">Sedentary (Office job, little exercise)</option>
                    <option value="light">Light (Exercise 1-3 days/week)</option>
                    <option value="moderate">Moderate (Exercise 3-5 days/week)</option>
                    <option value="heavy">Heavy (Exercise 6-7 days/week)</option>
                    <option value="athlete">Athlete (Physical job + hard training)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Archetype Strategy</label>
                  <p className="text-xs text-zinc-500">
                    This adjusts your macro split (e.g. Bodybuilders get more protein).
                  </p>
                  <select {...register('archetype')} className={inputClass}>
                    <option value="general">General Fitness (Balanced)</option>
                    <option value="bodybuilder">Bodybuilder (High Protein)</option>
                    <option value="fighter">Fighter (High Carb / Explosive)</option>
                    <option value="crossfitter">CrossFitter (High Work Capacity)</option>
                    <option value="senior">Senior (Longevity & Maintenance)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Primary Goal</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['lose_weight', 'maintain', 'gain_muscle'].map(g => (
                      <div
                        key={g}
                        className={`cursor-pointer rounded-lg border p-4 text-center transition-all ${
                          formData.goal === g
                            ? 'border-yellow-500 bg-yellow-500/10 text-white shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                            : 'border-zinc-800 hover:border-zinc-600 text-zinc-400'
                        }`}
                        onClick={() => {
                          setValue('goal', g as UserProfile['goal'], { shouldValidate: true })
                        }}
                      >
                        <input type="radio" value={g} {...register('goal')} className="sr-only" />
                        <span className="capitalize font-medium text-sm">
                          {g.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --- STEP 2: RESULTS --- */}
            {step === 2 && results && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* BMR Card */}
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg text-center shadow-sm">
                    <div className="text-sm text-zinc-500 font-medium">BMR</div>
                    <div className="text-2xl font-bold text-white mt-1">{results.bmr}</div>
                    <div className="text-[10px] text-zinc-600 uppercase tracking-wider">
                      kcal/day
                    </div>
                  </div>

                  {/* TDEE Card */}
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg text-center shadow-sm">
                    <div className="text-sm text-zinc-500 font-medium">TDEE</div>
                    <div className="text-2xl font-bold text-white mt-1">{results.tdee}</div>
                    <div className="text-[10px] text-zinc-600 uppercase tracking-wider">
                      Maintenance
                    </div>
                  </div>

                  {/* Target Card */}
                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg text-center shadow-sm">
                    <div className="text-sm text-yellow-500 font-medium">Target</div>
                    <div className="text-2xl font-bold text-yellow-400 mt-1">
                      {results.macros.calories}
                    </div>
                    <div className="text-[10px] text-yellow-500/70 uppercase tracking-wider">
                      kcal/day
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-zinc-300">Daily Macro Split</h4>
                  {/* Progress Bar Track */}
                  <div className="h-4 w-full bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-600" style={{ width: '40%' }} />
                    <div className="h-full bg-green-600" style={{ width: '30%' }} />
                    <div className="h-full bg-yellow-600" style={{ width: '30%' }} />
                  </div>

                  {/* Legend */}
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mr-2 shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                      Protein: <span className="text-white ml-1">{results.macros.protein}g</span>
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-600 mr-2 shadow-[0_0_8px_rgba(22,163,74,0.5)]" />
                      Fats: <span className="text-white ml-1">{results.macros.fat}g</span>
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-yellow-600 mr-2 shadow-[0_0_8px_rgba(202,138,4,0.5)]" />
                      Carbs: <span className="text-white ml-1">{results.macros.carbs}g</span>
                    </span>
                  </div>
                </div>

                {/* Science Note */}
                <div className="bg-yellow-500/5 p-4 rounded-md border border-yellow-500/20 text-sm text-yellow-200/80">
                  <strong className="text-yellow-400">Verified Science Note:</strong> These numbers
                  are based on the Mifflin-St Jeor equation. We will adjust them based on your
                  actual progress over the next 2 weeks.
                </div>
              </div>
            )}
          </form>
        </CardContent>

        {/* UPDATED FOOTER WITH CANCEL BUTTON */}
        <CardFooter className="flex justify-between border-t border-zinc-900 pt-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            {step === 0 ? (
              <>
                <X className="mr-2 h-4 w-4" /> Cancel
              </>
            ) : (
              <>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </>
            )}
          </Button>

          {step < 2 ? (
            <Button onClick={handleNext} className="bg-yellow-500 text-black hover:bg-yellow-400">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="bg-yellow-500 text-black hover:bg-yellow-400"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Save & Start Journey
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
