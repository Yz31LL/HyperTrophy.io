import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacros,
} from '../../lib/health-calc'
import { UserProfile } from '@repo/shared/schemas'
import { calculateWeeklyVolume, Workout, WeightLog, MuscleGroup } from '../../lib/analytics'
import { EnergyFlux } from './EnergyFlux'
import { NutritionDonutChart } from './NutritionDonutChart'
import { MuscleHeatmap } from './MuscleHeatmap'
import { WeightChart } from './WeightChart'
import { DashboardStatCard } from './DashboardStatCard'
import { LoadingScreen } from '../../components/ui/LoadingScreen'
import { ArrowLeft, User } from 'lucide-react'
import { UserData } from '../../hooks/useUserRole'

export function TraineeDetailScreen() {
  const { uid } = useParams<{ uid: string }>()
  const navigate = useNavigate()

  const [traineeData, setTraineeData] = useState<UserData | null>(null)
  const [traineeProfile, setTraineeProfile] = useState<UserProfile | null>(null)
  const [consumedMacros, setConsumedMacros] = useState({ protein: 0, carbs: 0, fat: 0 })
  const [dailyCaloriesBurned, setDailyCaloriesBurned] = useState(0)
  const [volumeData, setVolumeData] = useState<Record<MuscleGroup, number> | null>(null)
  const [weightHistory, setWeightHistory] = useState<WeightLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return

    const fetchData = async () => {
      // Fetch Trainee Profile (Basic Info)
      const docRef = doc(db, 'users', uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setTraineeData(docSnap.data() as UserData)
      }

      // Fetch Trainee Health Profile (Biometrics)
      const profileRef = doc(db, 'users', uid, 'private_profile', 'main')
      const profileSnap = await getDoc(profileRef)
      if (profileSnap.exists()) {
        setTraineeProfile(profileSnap.data() as UserProfile)
      }
    }
    fetchData()

    // 2. Fetch Meals
    const unsubMeals = onSnapshot(collection(db, 'users', uid, 'meals'), snapshot => {
      let p = 0,
        c = 0,
        f = 0
      snapshot.forEach(doc => {
        const data = doc.data()
        p += Number(data.protein) || 0
        c += Number(data.carbs) || 0
        f += Number(data.fat) || 0
      })
      setConsumedMacros({ protein: p, carbs: c, fat: f })
    })

    // 3. Fetch Workouts
    const unsubWorkouts = onSnapshot(collection(db, 'users', uid, 'workouts'), snapshot => {
      const allWorkouts = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Workout[]
      let burned = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      allWorkouts.forEach(w => {
        const date = w.completedAt?.toDate() || (w.date ? new Date(w.date) : null)
        if (date && date >= today) burned += Number(w.caloriesBurned) || 0
      })
      setDailyCaloriesBurned(burned)
      setVolumeData(calculateWeeklyVolume(allWorkouts))
    })

    // 4. Fetch Weight
    const unsubWeight = onSnapshot(collection(db, 'users', uid, 'weight_logs'), snapshot => {
      const logs = snapshot.docs
        .map(d => ({
          date: d.data().date,
          weight: Number(d.data().weight),
        }))
        .sort((a, b) => b.date.toMillis() - a.date.toMillis())
      setWeightHistory(logs)
      setLoading(false)
    })

    return () => {
      unsubMeals()
      unsubWorkouts()
      unsubWeight()
    }
  }, [uid])

  if (loading) return <LoadingScreen message="Accessing Trainee Intel..." />
  if (!traineeData) return <div className="p-8 text-center text-white">Trainee Not Found</div>

  // Analytics (Same as Dashboard)
  // Combine Trainee Basic Data with Health Profile
  const profileForCalc: UserProfile | null = traineeProfile
    ? {
        ...traineeProfile,
        weight: weightHistory[0]?.weight || traineeProfile.weight || 0,
      }
    : null

  const bmr = profileForCalc ? calculateBMR(profileForCalc) : 0
  const tdee = profileForCalc ? calculateTDEE(bmr, profileForCalc.activityLevel) : 0
  const targetCalories = profileForCalc ? calculateTargetCalories(tdee, profileForCalc.goal) : 0
  const macros = profileForCalc
    ? calculateMacros(profileForCalc, targetCalories)
    : { protein: 0, carbs: 0, fat: 0 }

  const totalConsumed =
    consumedMacros.protein * 4 + consumedMacros.carbs * 4 + consumedMacros.fat * 9

  return (
    <div className="min-h-screen bg-[#050508] text-slate-200 p-6 md:p-8 font-['Rajdhani',_sans-serif]">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full glass-panel hover:bg-white/10 transition-all border border-white/5"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-yellow-500" />
                <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">
                  Trainee Monitoring
                </span>
              </div>
              <h1 className="text-3xl font-cyber font-bold text-white uppercase tracking-tight">
                {traineeData.displayName}
              </h1>
            </div>
          </div>
          <div className="px-4 py-2 glass-panel rounded-lg flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-xs font-bold text-white tracking-widest uppercase">
              Live View Active
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3">
            <EnergyFlux
              totalConsumed={totalConsumed}
              tdee={tdee}
              dailyCaloriesBurned={dailyCaloriesBurned}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel rounded-2xl p-6 min-h-[340px] flex flex-col relative overflow-hidden group">
              <h3 className="text-lg font-cyber font-bold text-white mb-4">Volume Heatmap</h3>
              <div className="flex-1 flex items-center justify-center">
                {volumeData && <MuscleHeatmap volumeData={volumeData} />}
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-lg font-cyber font-bold text-white mb-6">Macro Distribution</h3>
              <div className="flex justify-center">
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
                label="Daily Activity"
                themeColor="#ff0055"
                iconName="local_fire_department"
                imageSrc="/images/cardio.png"
              />
              <DashboardStatCard
                title="Protein"
                value={consumedMacros.protein}
                unit="g"
                label={`Target: ${macros.protein}g`}
                themeColor="#00f3ff"
                imageSrc="/images/protein.jpg"
              />
              <DashboardStatCard
                title="Carbs"
                value={consumedMacros.carbs}
                unit="g"
                label={`Target: ${macros.carbs}g`}
                themeColor="#ffee00"
                imageSrc="/images/carbs.jpg"
              />
              <DashboardStatCard
                title="Fats"
                value={consumedMacros.fat}
                unit="g"
                label={`Target: ${macros.fat}g`}
                themeColor="#00ff9d"
                imageSrc="/images/fats.jpeg"
              />
            </div>

            <div className="glass-panel rounded-2xl p-6 relative">
              <h3 className="text-lg font-cyber font-bold text-white mb-6">Weight Journey</h3>
              <WeightChart history={weightHistory} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
