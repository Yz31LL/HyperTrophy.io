import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db, auth } from '../../lib/firebase'
import { Calendar } from '@repo/ui/Calendar'
import { Button } from '@repo/ui/Button'
import { Card, CardContent } from '@repo/ui/Card'
import { ArrowLeft, Plus, Clock, User, Dumbbell } from 'lucide-react'
import { useUserRole } from '../../hooks/useUserRole'
import { LoadingScreen } from '../../components/ui/LoadingScreen'
import { format, isSameDay } from 'date-fns'
import { cn } from '@repo/ui/utils'
import { useCalendarEvents, CalendarEvent } from '../../hooks/useCalendarEvents'
import { useTrainees } from '../../hooks/useTrainees'

export function CalendarScreen() {
  const navigate = useNavigate()
  const { role, loading: roleLoading } = useUserRole()
  const { trainees } = useTrainees()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const { events, loading } = useCalendarEvents()

  const [isAddModalOpen, setAddModalOpen] = useState(false)
  const [newSession, setNewSession] = useState({
    title: '',
    type: 'workout' as CalendarEvent['type'],
    traineeId: '',
    time: '10:00',
  })

  const handleAddEvent = async () => {
    const user = auth.currentUser
    if (!user || !newSession.title || !newSession.traineeId) {
      alert('Please fill in all mission parameters.')
      return
    }

    try {
      const [hours, minutes] = newSession.time.split(':').map(Number)
      const eventDate = new Date(selectedDate)
      eventDate.setHours(hours, minutes, 0, 0)

      const eventData = {
        title: newSession.title,
        type: newSession.type,
        traineeId: newSession.traineeId,
        trainerId: user.uid,
        date: Timestamp.fromDate(eventDate),
        createdAt: serverTimestamp(),
      }

      // 1. Add to trainer's events
      await addDoc(collection(db, `users/${user.uid}/trainer_events`), eventData)

      // 2. Add to trainee's events
      await addDoc(collection(db, `users/${newSession.traineeId}/trainee_events`), eventData)

      setAddModalOpen(false)
      setNewSession({ title: '', type: 'workout', traineeId: '', time: '10:00' })
    } catch (err) {
      console.error('Error adding event:', err)
      alert(`MISSION FAILURE: ${err instanceof Error ? err.message : 'Unknown Error'}`)
    }
  }

  if (loading || roleLoading) return <LoadingScreen message="Syncing Schedule..." />

  const selectedDateEvents = events.filter(event => isSameDay(event.date.toDate(), selectedDate))
  const eventDates = events.map(event => event.date.toDate())

  return (
    <div className="min-h-screen bg-black text-white p-4 max-w-4xl mx-auto space-y-8 font-['Rajdhani',_sans-serif]">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-zinc-400 hover:text-white border border-white/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-cyber font-bold tracking-tight uppercase">
              Command <span className="text-yellow-500">Schedule</span>
            </h1>
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-[0.2em]">
              {role === 'trainer' ? 'Strategic Operations' : 'Personal Trajectory'}
            </p>
          </div>
        </div>

        {role === 'trainer' && (
          <Button
            onClick={() => setAddModalOpen(true)}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold font-cyber px-6"
          >
            <Plus className="h-4 w-4 mr-2" /> NEW SESSION
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CALENDAR COLUMN */}
        <div className="lg:col-span-7">
          <Calendar
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{ hasEvents: eventDates }}
            className="neon-glow"
          />
        </div>

        {/* EVENTS COLUMN */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-lg font-cyber font-bold text-white uppercase">Daily Briefing</h3>
            <span className="text-xs font-mono text-yellow-500/50">
              {format(selectedDate, 'MMM d, yyyy')}
            </span>
          </div>

          <div className="space-y-4">
            {selectedDateEvents.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-white/5 rounded-2xl">
                <Clock className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-xs font-cyber uppercase tracking-widest">
                  No operations scheduled
                </p>
              </div>
            ) : (
              selectedDateEvents.map(event => (
                <Card
                  key={event.id}
                  className="bg-zinc-900/50 border-zinc-800 hover:border-yellow-500/30 transition-colors group relative overflow-hidden"
                >
                  <CardContent className="p-4 flex gap-4">
                    <div
                      className={cn(
                        'w-1 h-full absolute left-0 top-0 rounded-l-2xl',
                        event.type === 'workout' ? 'bg-blue-500' : 'bg-yellow-500'
                      )}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1 text-[10px] font-mono text-zinc-500 uppercase">
                        <span>
                          {event.type} — {format(event.date.toDate(), 'HH:mm')}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white uppercase group-hover:text-yellow-500 transition-colors">
                        {event.title}
                      </h4>
                      {event.traineeId && (
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-zinc-400">
                          <User className="h-3 w-3" />
                          <span>
                            Target:{' '}
                            {trainees.find(t => t.uid === event.traineeId)?.displayName ||
                              'Trainee'}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="p-6 glass-panel rounded-2xl border-white/5 space-y-4">
            <h4 className="text-xs font-cyber font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Dumbbell className="h-3 w-3 text-yellow-500" /> System Metrics
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-600 uppercase font-mono">Monthly Target</p>
                <p className="text-xl font-cyber text-white">
                  24 <span className="text-[10px] text-zinc-500">OPS</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-600 uppercase font-mono">Completed</p>
                <p className="text-xl font-cyber text-green-500">
                  18 <span className="text-[10px] text-zinc-500">DONE</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADD EVENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border-yellow-500/20 space-y-6">
            <h3 className="text-xl font-cyber font-bold text-white uppercase tracking-wider">
              Schedule <span className="text-yellow-500">Session</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500 uppercase">
                  Mission Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Heavy Push Day"
                  className="w-full bg-white/5 border border-white/10 rounded-lg h-11 px-4 text-white placeholder:text-zinc-600 focus:border-yellow-500/50 outline-none transition-all"
                  value={newSession.title}
                  onChange={e => setNewSession({ ...newSession, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">
                    Session Type
                  </label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-lg h-11 px-3 text-white outline-none"
                    value={newSession.type}
                    onChange={e =>
                      setNewSession({
                        ...newSession,
                        type: e.target.value as CalendarEvent['type'],
                      })
                    }
                  >
                    <option value="workout">Workout</option>
                    <option value="check-in">Check-in</option>
                    <option value="meal-plan">Meal Plan</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">
                    Time (24h)
                  </label>
                  <input
                    type="time"
                    className="w-full bg-white/5 border border-white/10 rounded-lg h-11 px-4 text-white outline-none"
                    value={newSession.time}
                    onChange={e => setNewSession({ ...newSession, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500 uppercase">
                  Target Personnel
                </label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-lg h-11 px-3 text-white outline-none"
                  value={newSession.traineeId}
                  onChange={e => setNewSession({ ...newSession, traineeId: e.target.value })}
                >
                  <option value="">Select Trainee</option>
                  {trainees.map(t => (
                    <option key={t.uid} value={t.uid}>
                      {t.displayName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                className="flex-1 border border-white/5 h-12"
                onClick={() => setAddModalOpen(false)}
              >
                ABORT
              </Button>
              <Button
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold h-12"
                onClick={handleAddEvent}
              >
                CONFIRM MISSION
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
