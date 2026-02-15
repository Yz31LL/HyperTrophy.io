import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'
import { useProfile } from '../../hooks/useProfile'
import { Button } from '@repo/ui/Button'
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
import { EnergyFlux } from './EnergyFlux'
import { DashboardStatCard } from './DashboardStatCard'
import { ActionButtonSection } from './ActionButtonSection'

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
      const now = new Date()
      now.setHours(0, 0, 0, 0)

      allWorkouts.forEach(workout => {
        let workoutDate: Date | null = null
        const cals = Number(workout.caloriesBurned) || 0

        if (workout.completedAt && typeof workout.completedAt.toDate === 'function') {
          workoutDate = workout.completedAt.toDate()
        } else if (workout.date) {
          workoutDate = new Date(workout.date)
        }

        if (workoutDate && workoutDate >= now) {
          totalBurnedToday += cals
        }
      })

      setDailyCaloriesBurned(totalBurnedToday)
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

  if (loading)
    return (
      <div className="p-8 text-center bg-black text-white min-h-screen">Loading your plan...</div>
    )

  if (!profile) {
    return (
      <div className="p-8 text-center space-y-4 bg-black text-white min-h-screen">
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

  return (
    <div className="min-h-screen bg-[#050508] text-slate-200 antialiased selection:bg-[#00f3ff] selection:text-black font-['Rajdhani',_sans-serif]">
      {/* Styles Injection */}
      <style>{`
        :root {
            --neon-blue: #00f3ff;
            --neon-orange: #ff9100;
            --neon-green: #00ff9d;
            --neon-red: #ff0055;
            --neon-yellow: #ffee00;
            --bg-dark: #050508;
            --card-bg: #0f1014;
        }
        .font-cyber {
            font-family: 'Orbitron', sans-serif;
        }
        .glass-panel {
            background: rgba(15, 16, 20, 0.6);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.3);
        }
        .neon-text {
            text-shadow: 0 0 8px currentColor;
        }
      `}</style>

      <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-4xl font-cyber font-bold tracking-wider text-white">
              HYPER<span className="text-[#00f3ff]">TROPHY</span>
            </h1>
            <p className="text-slate-400 font-medium text-lg mt-1 tracking-wide">
              Welcome back,{' '}
              <span className="text-white">{user?.displayName?.split(' ')[0] || 'Member'}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 rounded-full bg-[#00ff9d]/10 border border-[#00ff9d]/20 text-[#00ff9d] text-xs font-bold uppercase tracking-wider animate-pulse">
              System Online
            </span>
            <button
              onClick={() => auth.signOut()}
              className="px-6 py-2 rounded bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all text-sm font-semibold tracking-wider text-white"
            >
              SIGN OUT
            </button>
          </div>
        </header>

        {/* ALERT SYSTEM */}
        <PlateauAlert isDetected={isPlateau} />

        <EnergyFlux
          totalConsumed={totalConsumed}
          tdee={tdee}
          dailyCaloriesBurned={dailyCaloriesBurned}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel rounded-2xl p-6 min-h-[340px] flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-50 text-white">
                <span className="material-symbols-outlined text-3xl">accessibility_new</span>
              </div>
              <h3 className="text-lg font-cyber font-bold text-white mb-4">Volume Heatmap</h3>
              <div className="flex-1 flex items-center justify-center relative">
                {volumeData ? (
                  <MuscleHeatmap volumeData={volumeData} />
                ) : (
                  <div className="text-center space-y-2 z-10">
                    <p className="text-sm text-slate-400">Loading Heatmap...</p>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-cyber font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00f3ff]">pie_chart</span>
                  Macro Distribution
                </h3>
              </div>
              <div className="flex flex-col items-center justify-center py-4">
                <NutritionDonutChart consumed={consumedMacros} targets={macros} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DashboardStatCard
                title="Active Burn"
                value={dailyCaloriesBurned}
                unit="kcal"
                label="Daily Activity Level"
                imageSrc="/images/cardio.png"
                themeColor="#ff0055"
                iconName="local_fire_department"
              />
              <DashboardStatCard
                title="Protein"
                value={consumedMacros.protein}
                unit="g"
                label={`Target: ${macros.protein}g`}
                target={macros.protein}
                imageSrc="/images/protein.jpg"
                themeColor="#00f3ff"
              />
              <DashboardStatCard
                title="Carbs"
                value={consumedMacros.carbs}
                unit="g"
                label={`Target: ${macros.carbs}g`}
                target={macros.carbs}
                imageSrc="/images/carbs.jpg"
                themeColor="#ffee00"
              />
              <DashboardStatCard
                title="Fats"
                value={consumedMacros.fat}
                unit="g"
                label={`Target: ${macros.fat}g`}
                target={macros.fat}
                imageSrc="/images/fats.jpeg"
                themeColor="#00ff9d"
              />
            </div>

            <div className="glass-panel rounded-2xl p-6 relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-cyber font-bold text-white">Weight Trajectory</h3>
                <div className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded">Past Logs</div>
              </div>
              <WeightChart history={weightHistory} />
            </div>
          </div>
        </div>

        <ActionButtonSection
          onLogMeal={() => setMealModalOpen(true)}
          onLogWeight={() => setWeightModalOpen(true)}
        />

        <div className="text-center pb-8 opacity-40">
          <p className="text-[10px] font-mono tracking-[0.3em] uppercase">
            HyperTrophy Pro // v2.4.0 // System Operational
          </p>
        </div>
      </div>

      <MealEntryModal
        isOpen={isMealModalOpen}
        onClose={() => setMealModalOpen(false)}
        onSave={handleSaveMeal}
      />

      <WeightEntryModal isOpen={isWeightModalOpen} onClose={() => setWeightModalOpen(false)} />
    </div>
  )
}
