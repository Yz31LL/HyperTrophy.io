import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, getDocs, limit, orderBy } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { calculateTraineeRisk, RiskProfile, Workout, WeightLog } from '../lib/analytics'

import { Timestamp } from 'firebase/firestore'

export interface Trainee {
  uid: string
  displayName: string
  email: string
  role: 'trainee'
  createdAt: Timestamp
  updatedAt: Timestamp
  trainerId: string
  riskProfile?: RiskProfile
}

export function useTrainees() {
  const [trainees, setTrainees] = useState<Trainee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth.currentUser) {
      setTrainees([])
      setLoading(false)
      return
    }

    // Query for users where trainerId matches current user's UID
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'trainee'),
      where('trainerId', '==', auth.currentUser.uid)
    )

    const unsubscribe = onSnapshot(
      q,
      async snapshot => {
        const traineesData = await Promise.all(
          snapshot.docs.map(async d => {
            const data = d.data() as Trainee
            const uid = d.id

            // Fetch recent data for risk analysis
            // Optimization: Only fetch what's needed for analytics (last 14 days/entries)
            const [workoutsSnap, weightSnap] = await Promise.all([
              getDocs(
                query(
                  collection(db, 'users', uid, 'workouts'),
                  orderBy('completedAt', 'desc'),
                  limit(10)
                )
              ),
              getDocs(
                query(
                  collection(db, 'users', uid, 'weight_logs'),
                  orderBy('date', 'desc'),
                  limit(14)
                )
              ),
            ])

            const workouts = workoutsSnap.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            })) as Workout[]
            const weightLogs = weightSnap.docs.map(doc => doc.data()) as WeightLog[]

            const riskProfile = calculateTraineeRisk(workouts, weightLogs)

            return {
              ...data,
              uid,
              riskProfile,
            }
          })
        )
        setTrainees(traineesData)
        setLoading(false)
      },
      err => {
        console.error('Error fetching trainees:', err)
        setError('Failed to fetch trainees')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { trainees, loading, error }
}
