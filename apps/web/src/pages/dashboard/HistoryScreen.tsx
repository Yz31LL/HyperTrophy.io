import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoadingScreen } from '../../components/ui/LoadingScreen'
import {
  collection,
  query,
  orderBy,
  getDocs,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { db, auth } from '../../lib/firebase'
import { Button } from '@repo/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/Card'
import { ArrowLeft, Dumbbell, Utensils, Calendar, Clock, Flame, Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { MealEntryModal, MealFormValues } from './MealEntryModal'

// --- TYPES ---
interface WorkoutLog {
  id: string
  name: string
  category: string
  durationMinutes: number
  caloriesBurned: number
  completedAt: Timestamp | null
}

interface MealLog {
  id: string
  name: string
  protein: number
  carbs: number
  fat: number
  calories: number
  createdAt: Timestamp | null
}

type Tab = 'workouts' | 'nutrition'

export function HistoryScreen() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('nutrition')
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([])
  const [meals, setMeals] = useState<MealLog[]>([])
  const [loading, setLoading] = useState(true)

  // --- EDITING STATE ---
  const [isMealModalOpen, setMealModalOpen] = useState(false)
  const [editingMeal, setEditingMeal] = useState<MealLog | null>(null)

  // FETCH DATA
  const fetchData = async () => {
    const user = auth.currentUser
    if (!user) return

    try {
      // 1. Fetch Workouts
      const workoutsRef = collection(db, 'users', user.uid, 'workouts')
      const workoutsQuery = query(workoutsRef, orderBy('completedAt', 'desc'))
      const workoutSnapshot = await getDocs(workoutsQuery)
      const workoutData = workoutSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as WorkoutLog[]
      setWorkouts(workoutData)

      // 2. Fetch Meals
      const mealsRef = collection(db, 'users', user.uid, 'meals')
      const mealsQuery = query(mealsRef, orderBy('createdAt', 'desc'))
      const mealSnapshot = await getDocs(mealsQuery)
      const mealData = mealSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MealLog[]
      setMeals(mealData)
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // --- ACTIONS ---

  // 1. DELETE ITEM
  const handleDelete = async (collectionName: 'workouts' | 'meals', id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    const user = auth.currentUser
    if (!user) return

    try {
      await deleteDoc(doc(db, 'users', user.uid, collectionName, id))
      // Refresh local state without reloading
      if (collectionName === 'workouts') {
        setWorkouts(prev => prev.filter(w => w.id !== id))
      } else {
        setMeals(prev => prev.filter(m => m.id !== id))
      }
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Failed to delete item')
    }
  }

  // 2. OPEN EDIT MEAL
  const handleEditMealClick = (meal: MealLog) => {
    setEditingMeal(meal)
    setMealModalOpen(true)
  }

  // 3. SAVE EDITED MEAL
  const handleUpdateMeal = async (data: MealFormValues) => {
    const user = auth.currentUser
    if (!user || !editingMeal) return

    try {
      const mealRef = doc(db, 'users', user.uid, 'meals', editingMeal.id)

      await updateDoc(mealRef, {
        name: data.name,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        calories: data.protein * 4 + data.carbs * 4 + data.fat * 9,
      })

      // Refresh data
      fetchData()
      setEditingMeal(null)
    } catch (error) {
      console.error('Error updating meal:', error)
    }
  }

  // Helper to format timestamps safely
  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'Unknown Date'
    const date =
      timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp as unknown as string)
    return format(date, 'MMM d, yyyy • h:mm a')
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 max-w-2xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard')}
          className="text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Activity History</h1>
      </div>

      {/* TABS */}
      <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
        <button
          onClick={() => setActiveTab('workouts')}
          className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'workouts'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Dumbbell className="h-4 w-4" /> Workouts
        </button>
        <button
          onClick={() => setActiveTab('nutrition')}
          className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'nutrition'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Utensils className="h-4 w-4" /> Nutrition
        </button>
      </div>

      {/* CONTENT LIST */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <LoadingScreen message="Retrieving History" />
          </div>
        ) : activeTab === 'workouts' ? (
          // WORKOUTS LIST
          workouts.length === 0 ? (
            <div className="text-center py-10 text-zinc-500">No workouts logged yet.</div>
          ) : (
            workouts.map(workout => (
              <Card key={workout.id} className="bg-zinc-900 border-zinc-800 relative group">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base text-white">{workout.name}</CardTitle>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(workout.completedAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-red-500 font-bold text-sm">
                        <Flame className="h-4 w-4" />
                        {workout.caloriesBurned}
                      </div>

                      {/* DELETE BUTTON (Workouts) */}
                      <button
                        onClick={() => handleDelete('workouts', workout.id)}
                        className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-xs text-zinc-400">
                    <span className="bg-zinc-800 px-2 py-1 rounded">{workout.category}</span>
                    <span className="flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded">
                      <Clock className="h-3 w-3" /> {workout.durationMinutes} min
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )
        ) : // NUTRITION LIST
        meals.length === 0 ? (
          <div className="text-center py-10 text-zinc-500">No meals logged yet.</div>
        ) : (
          meals.map(meal => (
            <Card key={meal.id} className="bg-zinc-900 border-zinc-800 relative group">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base text-white">{meal.name}</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(meal.createdAt)}
                    </div>
                  </div>

                  {/* EDIT / DELETE CONTROLS */}
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-white mr-2">{meal.calories} kcal</div>

                    <button
                      onClick={() => handleEditMealClick(meal)}
                      className="text-zinc-500 hover:text-blue-400 transition-colors p-1"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDelete('meals', meal.id)}
                      className="text-zinc-500 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-zinc-300">{meal.protein}g P</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="text-zinc-300">{meal.carbs}g C</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-zinc-300">{meal.fat}g F</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* EDIT MODAL */}
      <MealEntryModal
        isOpen={isMealModalOpen}
        onClose={() => {
          setMealModalOpen(false)
          setEditingMeal(null)
        }}
        onSave={handleUpdateMeal}
        initialData={editingMeal}
      />
    </div>
  )
}
