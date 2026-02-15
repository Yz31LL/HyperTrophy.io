import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

import { Timestamp } from 'firebase/firestore'

export interface Trainee {
  uid: string
  displayName: string
  email: string
  role: 'trainee'
  createdAt: Timestamp
  updatedAt: Timestamp
  trainerId: string
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
      snapshot => {
        const traineesData = snapshot.docs.map(doc => ({
          ...doc.data(),
        })) as Trainee[]
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
