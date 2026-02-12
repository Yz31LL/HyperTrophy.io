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

export function DashboardScreen() {
  const [isMealModalOpen, setMealModalOpen] = useState(false)
  const [consumedMacros, setConsumedMacros] = useState({ protein: 0, carbs: 0, fat: 0 })
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

  const { user } = useAuth()
  const { profile, loading } = useProfile()

  if (loading) return <div className="p-8 text-center">Loading your plan...</div>

  // If no profile exists, force them to onboarding
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
    if (!firebaseUser) {
      console.error('User not logged in')
      return
    }

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

      console.log('Meal saved to Firebase')
    } catch (error) {
      console.error('Error saving meal:', error)
    }
  }

  // Recalculate targets based on the profile data
  const bmr = calculateBMR(profile)
  const tdee = calculateTDEE(bmr, profile.activityLevel)
  const targetCalories = calculateTargetCalories(tdee, profile.goal)
  const macros = calculateMacros(profile, targetCalories)

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Hi, {user?.displayName}</h1>
          <p className="text-muted-foreground">Today's Targets</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => auth.signOut()}>
          Sign Out
        </Button>
      </div>

      {/* Primary Stats & Progress Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Macro Progress (Donut Chart) */}
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

        {/* 2. Detailed Stats Grid */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {/* Calories Card */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" /> Calories
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{targetCalories}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round(
                  consumedMacros.protein * 4 + consumedMacros.carbs * 4 + consumedMacros.fat * 9
                )}{' '}
                kcal logged
              </p>
            </CardContent>
          </Card>

          {/* Protein Card */}
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

          {/* Fats Card */}
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

          {/* Carbs Card */}
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
        </div>
      </div>

      {/* Weight Chart section */}
      <div className="w-full">
        <WeightChart />
      </div>

      {/* Action Button */}
      <Button
        onClick={() => setMealModalOpen(true)}
        className="w-full bg-green-600 hover:bg-green-700 shadow-lg transition-transform active:scale-[0.98]"
      >
        Log Nutrition +
      </Button>

      {/* Workout Link section */}
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

      {/* Modal */}
      <MealEntryModal
        isOpen={isMealModalOpen}
        onClose={() => setMealModalOpen(false)}
        onSave={handleSaveMeal}
      />
    </div>
  )
}
