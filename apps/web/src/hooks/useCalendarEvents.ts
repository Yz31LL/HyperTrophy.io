import { useState, useEffect } from 'react'
import { collection, query, onSnapshot, Timestamp, where, orderBy, limit } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import { useUserRole } from './useUserRole'

export interface CalendarEvent {
  id: string
  title: string
  date: Timestamp
  type: 'workout' | 'check-in' | 'meal-plan'
  traineeId?: string
  trainerId?: string
  traineeName?: string
  description?: string
}

export function useCalendarEvents(options?: { limitToNext?: number }) {
  const { role, loading: roleLoading } = useUserRole()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = auth.currentUser
    if (!user || roleLoading) return

    // Trainers listen to their own 'trainer_events'
    // Trainees listen to their own 'trainee_events'
    const collectionPath =
      role === 'trainer' ? `users/${user.uid}/trainer_events` : `users/${user.uid}/trainee_events`

    let q = query(collection(db, collectionPath), orderBy('date', 'asc'))

    if (options?.limitToNext) {
      const now = Timestamp.now()
      q = query(q, where('date', '>=', now), limit(options.limitToNext))
    }

    const unsub = onSnapshot(
      q,
      snapshot => {
        const eventData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as CalendarEvent[]
        setEvents(eventData)
        setLoading(false)
      },
      error => {
        console.error('Error fetching calendar events:', error)
        setLoading(false)
      }
    )

    return () => unsub()
  }, [role, roleLoading, options?.limitToNext])

  return { events, loading }
}
