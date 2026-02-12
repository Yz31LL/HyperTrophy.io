// @ts-nocheck
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
import { auth } from '../../lib/firebase'

export function DashboardScreen() {
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

      {/* Primary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" /> Calories
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{targetCalories}</div>
            <p className="text-xs text-muted-foreground">kcal goal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Protein</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-blue-600">{macros.protein}g</div>
            <p className="text-xs text-muted-foreground">muscle repair</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fats</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-green-600">{macros.fat}g</div>
            <p className="text-xs text-muted-foreground">hormone health</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Carbs</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-yellow-600">{macros.carbs}g</div>
            <p className="text-xs text-muted-foreground">energy fuel</p>
          </CardContent>
        </Card>
      </div>

      {/* NEW: Weight Chart */}
      <div className="w-full">
        <WeightChart />
      </div>

      {/* Actions Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-blue-500" />
              Log Workout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Track your sets, reps, and RPE for today.
            </p>
            <Button className="w-full" disabled>
              Coming in Phase 3
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Log Nutrition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Track your meals against your macro targets.
            </p>
            <Button className="w-full" variant="outline" disabled>
              Coming in Phase 3
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
