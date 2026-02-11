import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { UserProfileSchema, type UserProfile } from '@repo/shared/schemas'
import { Button } from '@repo/ui/Button'
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
import { Loader2, ArrowRight, ArrowLeft, Check } from 'lucide-react'

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
  } = useForm<UserProfile>({
    resolver: zodResolver(UserProfileSchema) as import('react-hook-form').Resolver<UserProfile>,
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

  // Watch values for real-time preview if needed
  const formData = watch() as UserProfile

  const handleNext = async () => {
    let fieldsToValidate: (keyof UserProfile)[] = []

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

  const handleBack = () => setStep(s => s - 1)

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
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={`flex items-center ${i <= step ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${i <= step ? 'border-primary bg-primary/10' : 'border-muted'} mr-2`}
                >
                  {i + 1}
                </div>
                <span className="hidden sm:inline text-sm font-medium">{s.title}</span>
              </div>
            ))}
          </div>
          <CardTitle>{STEPS[step].title}</CardTitle>
          <CardDescription>{STEPS[step].desc}</CardDescription>
        </CardHeader>

        <CardContent>
          <form id="onboarding-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* STEP 1: BIOMETRICS */}
            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gender</label>
                  <select
                    {...register('gender')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Age</label>
                  <input
                    type="number"
                    {...register('age', { valueAsNumber: true })}
                    className="flex h-10 w-full rounded-md border border-input px-3"
                    placeholder="Years"
                  />
                  {errors.age && <p className="text-red-500 text-xs">{errors.age.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Height (cm)</label>
                  <input
                    type="number"
                    {...register('height', { valueAsNumber: true })}
                    className="flex h-10 w-full rounded-md border border-input px-3"
                    placeholder="cm"
                  />
                  {errors.height && <p className="text-red-500 text-xs">{errors.height.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Weight (kg)</label>
                  <input
                    type="number"
                    {...register('weight', { valueAsNumber: true })}
                    className="flex h-10 w-full rounded-md border border-input px-3"
                    placeholder="kg"
                  />
                  {errors.weight && <p className="text-red-500 text-xs">{errors.weight.message}</p>}
                </div>
              </div>
            )}

            {/* STEP 2: LIFESTYLE */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Activity Level</label>
                  <select
                    {...register('activityLevel')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="sedentary">Sedentary (Office job, little exercise)</option>
                    <option value="light">Light (Exercise 1-3 days/week)</option>
                    <option value="moderate">Moderate (Exercise 3-5 days/week)</option>
                    <option value="heavy">Heavy (Exercise 6-7 days/week)</option>
                    <option value="athlete">Athlete (Physical job + hard training)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Primary Goal</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['lose_weight', 'maintain', 'gain_muscle'].map(g => (
                      <div
                        key={g}
                        className={`cursor-pointer rounded-lg border-2 p-4 text-center hover:border-primary transition-colors ${formData.goal === g ? 'border-primary bg-primary/5' : 'border-muted'}`}
                        onClick={() => {
                          setValue('goal', g as UserProfile['goal'], { shouldValidate: true })
                        }}
                      >
                        <input type="radio" value={g} {...register('goal')} className="sr-only" />
                        <span className="capitalize font-medium">{g.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: RESULTS & CONFIRMATION */}
            {step === 2 && results && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-center">
                    <div className="text-sm text-muted-foreground">BMR</div>
                    <div className="text-2xl font-bold">{results.bmr}</div>
                    <div className="text-xs text-muted-foreground">kcal/day</div>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-center">
                    <div className="text-sm text-muted-foreground">TDEE</div>
                    <div className="text-2xl font-bold">{results.tdee}</div>
                    <div className="text-xs text-muted-foreground">Maintenance</div>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg text-center">
                    <div className="text-sm text-primary font-medium">Target</div>
                    <div className="text-2xl font-bold text-primary">{results.macros.calories}</div>
                    <div className="text-xs text-primary/80">kcal/day</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Daily Macro Split</h4>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-500" style={{ width: '40%' }} />
                    <div className="h-full bg-green-500" style={{ width: '30%' }} />
                    <div className="h-full bg-yellow-500" style={{ width: '30%' }} />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-1" /> Protein:{' '}
                      {results.macros.protein}g
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-1" /> Fats:{' '}
                      {results.macros.fat}g
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1" /> Carbs:{' '}
                      {results.macros.carbs}g
                    </span>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-200 dark:border-yellow-900 text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Verified Science Note:</strong> These numbers are based on the Mifflin-St
                  Jeor equation. We will adjust them based on your actual progress over the next 2
                  weeks.
                </div>
              </div>
            )}
          </form>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={step === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          {step < 2 ? (
            <Button onClick={handleNext}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
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
