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
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'
import { db, auth } from '../../lib/firebase'
import { NutritionDonutChart } from './NutritionDonutChart'
import { MealEntryModal, MealFormValues } from './MealEntryModal'
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
  const [consumedMacros, setConsumedMacros] = useState({ protein: 0, carbs: 0, fat: 0 })
  const [dailyCaloriesBurned, setDailyCaloriesBurned] = useState(0)
  const [volumeData, setVolumeData] = useState<Record<MuscleGroup, number> | null>(null)
  const [isPlateau, setIsPlateau] = useState(false)
  const [weightHistory, setWeightHistory] = useState<WeightLog[]>([])

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

  const bmr = calculateBMR(profile)
  const tdee = calculateTDEE(bmr, profile.activityLevel)
  const targetCalories = calculateTargetCalories(tdee, profile.goal)
  const macros = calculateMacros(profile, targetCalories)

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
            <NutritionDonutChart consumed={consumedMacros} />
          </CardContent>
        </Card>

        {/* 4. WEIGHT CHART (Remaining width) */}
        <div className="md:col-span-2">
          <WeightChart history={weightHistory} />
        </div>
      </div>

      {/* LOG MEAL BUTTON */}
      <Button
        onClick={() => setMealModalOpen(true)}
        className="w-full bg-green-600 hover:bg-green-700 shadow-lg transition-transform active:scale-[0.98]"
      >
        Log Nutrition +
      </Button>

      {/* WORKOUT LINK */}
      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Dumbbell className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-semibold text-sm">Workout Session</p>
                <p className="text-xs text-muted-foreground">Log your training for today</p>
              </div>
            </div>
            <Link to="/workout">
              <Button size="sm">Start Log</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <MealEntryModal
        isOpen={isMealModalOpen}
        onClose={() => setMealModalOpen(false)}
        onSave={handleSaveMeal}
      />
    </div>
  )
}
