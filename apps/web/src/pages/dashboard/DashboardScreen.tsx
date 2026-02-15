import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'
import { useProfile } from '../../hooks/useProfile'
import { Button } from '@repo/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/Card'
import { Activity, Flame, Dumbbell } from 'lucide-react'
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacros,
} from '../../lib/health-calc'
import { WeightChart } from './WeightChart'
import confetti from 'canvas-confetti'
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'
import { db, auth } from '../../lib/firebase'
import { NutritionDonutChart } from './NutritionDonutChart'
import { MealEntryModal, MealFormValues } from './MealEntryModal'
import { WeightEntryModal } from './WeightEntryModal'
import { MuscleHeatmap } from './MuscleHeatmap'
import { PlateauAlert } from './PlateauAlert'
import {
  calculateWeeklyVolume,
  detectWeightPlateau,
  Workout,
  WeightLog,
  MuscleGroup,
} from '../../lib/analytics'

export function DashboardScreen() {
  const [isMealModalOpen, setMealModalOpen] = useState(false)
  const [isWeightModalOpen, setWeightModalOpen] = useState(false)
  const [consumedMacros, setConsumedMacros] = useState({ protein: 0, carbs: 0, fat: 0 })
  const [dailyCaloriesBurned, setDailyCaloriesBurned] = useState(0)
  const [volumeData, setVolumeData] = useState<Record<MuscleGroup, number> | null>(null)
  const [isPlateau, setIsPlateau] = useState(false)
  const [weightHistory, setWeightHistory] = useState<WeightLog[]>([])
  const [hasCelebrated, setHasCelebrated] = useState(false)

  // --- 1. FETCH MEALS ---
  useEffect(() => {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) return

    const unsub = onSnapshot(collection(db, 'users', firebaseUser.uid, 'meals'), snapshot => {
      let protein = 0
      let carbs = 0
      let fat = 0

      snapshot.forEach(doc => {
        const data = doc.data()
        protein += Number(data.protein) || 0
        carbs += Number(data.carbs) || 0
        fat += Number(data.fat) || 0
      })

      setConsumedMacros({ protein, carbs, fat })
    })

    return () => unsub()
  }, [])

  // --- 2. FETCH WORKOUTS (Heatmap & Calories) ---
  /// --- 2. FETCH WORKOUTS (DEBUG MODE) ---
  useEffect(() => {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) return

    const workoutsRef = collection(db, 'users', firebaseUser.uid, 'workouts')

    const unsub = onSnapshot(workoutsRef, snapshot => {
      const allWorkouts: Workout[] = snapshot.docs.map(
        doc =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Workout
      )

      let totalBurnedToday = 0

      // Set "Start of Today" to Midnight
      const now = new Date()
      now.setHours(0, 0, 0, 0)

      allWorkouts.forEach(workout => {
        let workoutDate: Date | null = null
        const cals = Number(workout.caloriesBurned) || 0

        // Debug Log per workout
        console.log(`- Workout: ${workout.name}, Cals: ${cals}, DateRaw:`, workout.completedAt)

        // Date Logic
        if (workout.completedAt && typeof workout.completedAt.toDate === 'function') {
          workoutDate = workout.completedAt.toDate()
        } else if (workout.date) {
          workoutDate = new Date(workout.date)
        }

        // If date is valid and is today (or future)
        if (workoutDate && workoutDate >= now) {
          totalBurnedToday += cals
        }
      })

      // FIX: Strictly show Today's calories
      setDailyCaloriesBurned(totalBurnedToday)

      // Calculate Heatmap
      const vol = calculateWeeklyVolume(allWorkouts)
      setVolumeData(vol)
    })

    return () => unsub()
  }, [])

  // --- 3. FETCH WEIGHT (Plateau Detection) ---
  useEffect(() => {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) return

    const weightRef = collection(db, 'users', firebaseUser.uid, 'weight_logs')

    const unsub = onSnapshot(weightRef, snapshot => {
      const logs: WeightLog[] = snapshot.docs.map(doc => ({
        date: doc.data().date,
        weight: Number(doc.data().weight),
      }))

      logs.sort((a, b) => b.date.toMillis() - a.date.toMillis())
      setWeightHistory(logs)

      const hasPlateau = detectWeightPlateau(logs)
      setIsPlateau(hasPlateau)
    })

    return () => unsub()
  }, [])

  const { user } = useAuth()
  const { profile, loading } = useProfile()

  // REAL MATH ANALYTICS
  const bmr = profile ? calculateBMR(profile) : 0
  const tdee = profile ? calculateTDEE(bmr, profile.activityLevel) : 0
  const targetCalories = profile ? calculateTargetCalories(tdee, profile.goal) : 0
  const macros = profile
    ? calculateMacros(profile, targetCalories)
    : { protein: 0, carbs: 0, fat: 0 }

  const totalConsumed =
    consumedMacros.protein * 4 + consumedMacros.carbs * 4 + consumedMacros.fat * 9

  // CELEBRATION EFFECT
  useEffect(() => {
    if (loading || !profile || hasCelebrated) return

    // Trigger confetti if daily calorie goal is reached (>= 95% for flexibility)
    if (totalConsumed >= targetCalories * 0.95 && targetCalories > 0) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#EAB308', '#2563EB', '#22C55E'],
      })
      setHasCelebrated(true)
    }
  }, [totalConsumed, targetCalories, loading, hasCelebrated, profile])

  if (loading) return <div className="p-8 text-center">Loading your plan...</div>

  if (!profile) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold">Profile Not Found</h2>
        <p>Please complete your setup to see your dashboard.</p>
        <Link to="/onboarding">
          <Button>Go to Onboarding</Button>
        </Link>
      </div>
    )
  }

  const handleSaveMeal = async (data: MealFormValues) => {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) return

    try {
      await addDoc(collection(db, 'users', firebaseUser.uid, 'meals'), {
        name: data.name,
        protein: Number(data.protein) || 0,
        carbs: Number(data.carbs) || 0,
        fat: Number(data.fat) || 0,
        calories:
          (Number(data.protein) || 0) * 4 +
          (Number(data.carbs) || 0) * 4 +
          (Number(data.fat) || 0) * 9,
        createdAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('Error saving meal:', error)
    }
  }

  // bmr, tdee, targetCalories, macros are already calculated above

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Hi, {user?.displayName}</h1>
          <p className="text-muted-foreground">Today's Targets</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => auth.signOut()}>
          Sign Out
        </Button>
      </div>

      {/* ALERT SYSTEM */}
      <PlateauAlert isDetected={isPlateau} />
      {/* NEW: ENERGY BALANCE CARD (THE MATH) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-3 bg-zinc-900 border-zinc-800">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* EAT */}
            <div className="text-center">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Eaten</p>
              <p className="text-3xl font-bold text-blue-500">{Math.round(totalConsumed)}</p>
            </div>

            {/* MATH OPERATOR */}
            <div className="text-zinc-600 font-bold text-xl">-</div>

            {/* BURN (Base + Active) */}
            <div className="text-center">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                Burned (Total)
              </p>
              <div className="flex flex-col items-center">
                <p className="text-3xl font-bold text-orange-500">
                  {Math.round(tdee + dailyCaloriesBurned)}
                </p>
                <span className="text-[10px] text-zinc-500">
                  ({Math.round(tdee)} Life + {dailyCaloriesBurned} Gym)
                </span>
              </div>
            </div>

            {/* MATH OPERATOR */}
            <div className="text-zinc-600 font-bold text-xl">=</div>

            {/* NET RESULT */}
            <div className="text-center">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                Net Balance
              </p>
              <p
                className={`text-3xl font-bold ${totalConsumed > tdee + dailyCaloriesBurned ? 'text-red-500' : 'text-green-500'}`}
              >
                {Math.round(totalConsumed - (tdee + dailyCaloriesBurned))}
              </p>
              <p className="text-[10px] text-zinc-400">
                {totalConsumed > tdee + dailyCaloriesBurned
                  ? 'Surplus (Gaining)'
                  : 'Deficit (Losing)'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. HEATMAP (Left Column) */}
        {volumeData && (
          <div className="md:col-span-1">
            <MuscleHeatmap volumeData={volumeData} />
          </div>
        )}

        {/* 2. DETAILED STATS (Center/Right Columns) */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {/* Calories Burned */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Flame className="h-4 w-4 text-red-500" /> Burned (Today)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-red-500">
                {dailyCaloriesBurned} <span className="text-sm text-muted-foreground">kcal</span>
              </div>
              <p className="text-xs text-muted-foreground">from logged workouts</p>
            </CardContent>
          </Card>

          {/* Protein */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" /> Protein
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-blue-600">{consumedMacros.protein}g</div>
              <p className="text-xs text-muted-foreground">target: {macros.protein}g</p>
            </CardContent>
          </Card>

          {/* Carbs */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" /> Carbs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-yellow-600">{consumedMacros.carbs}g</div>
              <p className="text-xs text-muted-foreground">target: {macros.carbs}g</p>
            </CardContent>
          </Card>

          {/* Fats */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" /> Fats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-green-600">{consumedMacros.fat}g</div>
              <p className="text-xs text-muted-foreground">target: {macros.fat}g</p>
            </CardContent>
          </Card>
        </div>

        {/* 3. MACRO PROGRESS (Full Width or Side) */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" /> Macro Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[240px]">
            <NutritionDonutChart consumed={consumedMacros} targets={macros} />
          </CardContent>
        </Card>

        {/* 4. WEIGHT CHART (Remaining width) */}
        <div className="md:col-span-2">
          <WeightChart history={weightHistory} />
        </div>
      </div>

      {/* LOG BUTTONS */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => setMealModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 shadow-lg transition-transform active:scale-[0.98]"
        >
          Log Nutrition +
        </Button>
        <Button
          onClick={() => setWeightModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg transition-transform active:scale-[0.98]"
        >
          Log Weight +
        </Button>
      </div>

      {/* WORKOUT LINK */}
      <Card className="bg-zinc-900 border-zinc-800 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <Dumbbell className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="font-bold text-lg text-white">Workout Session</p>
                <p className="text-sm text-zinc-400">Log your training for today</p>
              </div>
            </div>
            <Link to="/workout">
              <Button className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold">
                Start Log
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <MealEntryModal
        isOpen={isMealModalOpen}
        onClose={() => setMealModalOpen(false)}
        onSave={handleSaveMeal}
      />

      {/* NEW WEIGHT MODAL */}
      <WeightEntryModal isOpen={isWeightModalOpen} onClose={() => setWeightModalOpen(false)} />
    </div>
  )
}
