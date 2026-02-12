// @ts-nocheck
import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { UserProfile } from '@repo/shared/schemas'

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth.currentUser) return

    // Real-time listener for the profile
    // If the user updates their weight later, the dashboard updates instantly!
    const unsub = onSnapshot(
      doc(db, 'users', auth.currentUser.uid, 'private_profile', 'main'),
      doc => {
        if (doc.exists()) {
          setProfile(doc.data() as UserProfile)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => unsub()
  }, [])

  return { profile, loading }
}
