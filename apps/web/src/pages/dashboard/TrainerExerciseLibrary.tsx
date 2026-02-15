import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db, auth } from '../../lib/firebase'
import { Dumbbell, Trash2, ArrowLeft, BookOpen } from 'lucide-react'
import { Button } from '@repo/ui/Button'
import { LoadingScreen } from '../../components/ui/LoadingScreen'
import { MuscleGroup } from '../../lib/analytics'

interface CustomExercise {
  id: string
  name: string
  category: string
  muscleGroup: MuscleGroup
  description: string
  createdAt: Timestamp
}

export function TrainerExerciseLibrary() {
  const navigate = useNavigate()
  const [exercises, setExercises] = useState<CustomExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)

  // Form State
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('Strength')
  const [newMuscle, setNewMuscle] = useState<MuscleGroup>('chest')
  const [newDesc, setNewDesc] = useState('')

  useEffect(() => {
    if (!auth.currentUser) return

    const q = query(collection(db, 'users', auth.currentUser.uid, 'custom_exercises'))

    const unsubscribe = onSnapshot(q, snapshot => {
      const docs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as CustomExercise[]
      setExercises(docs)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth.currentUser || !newName) return

    try {
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'custom_exercises'), {
        name: newName,
        category: newCategory,
        muscleGroup: newMuscle,
        description: newDesc,
        createdAt: serverTimestamp(),
      })

      setNewName('')
      setNewDesc('')
      setIsAdding(false)
    } catch (error) {
      console.error('Error adding exercise:', error)
      alert('Failed to add exercise')
    }
  }

  const handleDelete = async (id: string) => {
    if (!auth.currentUser || !window.confirm('Delete this exercise?')) return
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'custom_exercises', id))
    } catch (error) {
      console.error('Error deleting exercise:', error)
    }
  }

  if (loading) return <LoadingScreen message="Loading Matrix Library..." />

  return (
    <div className="min-h-screen bg-[#050508] text-slate-200 p-6 md:p-8 font-['Rajdhani',_sans-serif]">
      {/* Styles Injection */}
      <style>{`
        .font-cyber { font-family: 'Orbitron', sans-serif; }
        .glass-panel {
          background: rgba(15, 16, 20, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/trainer-dashboard')}
              className="p-2 rounded-full glass-panel hover:bg-white/10 transition-all border border-white/5"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-4 w-4 text-yellow-500" />
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em]">
                  Master Database // v1.0
                </span>
              </div>
              <h1 className="text-4xl font-cyber font-bold tracking-wider text-white">
                Exercise <span className="text-yellow-500">Library</span>
              </h1>
            </div>
          </div>

          <Button
            onClick={() => setIsAdding(true)}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold h-12 px-8 rounded-sm font-cyber tracking-wider"
          >
            NEW PROTOCOL
          </Button>
        </header>

        {isAdding && (
          <div className="glass-panel p-8 rounded-2xl border-yellow-500/20 bg-yellow-500/5 animate-in slide-in-from-top duration-300">
            <h3 className="text-xl font-cyber font-bold text-white mb-6 uppercase tracking-widest">
              Register New Exercise
            </h3>
            <form onSubmit={handleAddExercise} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                    Exercise Name
                  </label>
                  <input
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Matrix Squat"
                    className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  >
                    <option>Strength</option>
                    <option>Hypertrophy</option>
                    <option>Endurance</option>
                    <option>Power</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                    Target Muscle
                  </label>
                  <select
                    value={newMuscle}
                    onChange={e => setNewMuscle(e.target.value as MuscleGroup)}
                    className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors capitalize"
                  >
                    <option value="chest">Chest</option>
                    <option value="back">Back</option>
                    <option value="legs">Legs</option>
                    <option value="shoulders">Shoulders</option>
                    <option value="arms">Arms</option>
                    <option value="core">Core</option>
                    <option value="cardio">Cardio</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1 h-full flex flex-col">
                  <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                    Description / Form Cues
                  </label>
                  <textarea
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder="Instructions for the trainee..."
                    className="flex-1 w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors resize-none"
                  />
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end gap-4 mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAdding(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  CANCEL
                </Button>
                <Button
                  type="submit"
                  className="bg-white text-black font-bold h-12 px-10 rounded-sm hover:bg-yellow-500 transition-all font-cyber"
                >
                  SAVE PROTOCOL
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.length === 0 && !isAdding && (
            <div className="md:col-span-3 py-20 text-center glass-panel rounded-2xl border-dashed border-white/10">
              <Dumbbell className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-500 font-cyber uppercase tracking-widest text-sm">
                Library is currently empty
              </p>
              <button
                onClick={() => setIsAdding(true)}
                className="mt-4 text-yellow-500 hover:text-yellow-400 text-xs font-bold uppercase tracking-widest underline underline-offset-4"
              >
                Create First Protocol
              </button>
            </div>
          )}

          {exercises.map(ex => (
            <div key={ex.id} className="glass-panel p-6 rounded-2xl group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDelete(ex.id)}
                  className="p-2 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-start gap-4 mb-4">
                <div className="h-10 w-10 rounded bg-zinc-900 border border-white/5 flex items-center justify-center">
                  <Dumbbell className="h-5 w-5 text-yellow-500/50" />
                </div>
                <div>
                  <div className="px-2 py-0.5 rounded-full bg-white/5 text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1 inline-block">
                    {ex.category}
                  </div>
                  <h4 className="text-lg font-cyber font-bold text-white uppercase truncate max-w-[180px]">
                    {ex.name}
                  </h4>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest">
                    Focus:
                  </span>
                  <span className="text-[10px] text-white font-bold uppercase tracking-wider">
                    {ex.muscleGroup}
                  </span>
                </div>
                {ex.description && (
                  <p className="text-xs text-zinc-500 line-clamp-2 italic">"{ex.description}"</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
