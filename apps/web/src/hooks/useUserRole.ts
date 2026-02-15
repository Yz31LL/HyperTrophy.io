import { useState, useEffect } from 'react'
import {
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  query,
  collection,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export interface UserData {
  uid: string
  email: string
  displayName: string
  role: 'trainer' | 'trainee'
  trainerId?: string
  inviteCode?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export function useUserRole() {
  const [role, setRole] = useState<'trainer' | 'trainee' | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [trainerName, setTrainerName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid)
      const userDoc = await getDoc(userRef)
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData

        // Auto-migrate: populate missing inviteCode
        if (!data.inviteCode) {
          const newCode = generateInviteCode()
          await updateDoc(userRef, { inviteCode: newCode })
          data.inviteCode = newCode
        }

        setRole(data.role)
        setUserData(data)

        // Fetch trainer name if applicable
        if (data.trainerId) {
          const trainerDoc = await getDoc(doc(db, 'users', data.trainerId))
          if (trainerDoc.exists()) {
            setTrainerName(trainerDoc.data().displayName || 'Coach')
          }
        } else {
          setTrainerName(null)
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!auth.currentUser) {
      setRole(null)
      setUserData(null)
      setTrainerName(null)
      setLoading(false)
      return
    }

    fetchUser(auth.currentUser.uid)
  }, [])

  const linkTrainerByCode = async (code: string) => {
    if (!auth.currentUser) return { success: false, message: 'Not logged in' }

    try {
      const q = query(collection(db, 'users'), where('inviteCode', '==', code.trim().toUpperCase()))
      const snapshot = await getDocs(q).catch(err => {
        console.error('Firestore Query Error:', err)
        throw new Error('Database connection failed')
      })

      if (snapshot.empty) {
        return { success: false, message: 'Invalid Invite Code' }
      }

      const trainerId = snapshot.docs[0].id
      const trainerData = snapshot.docs[0].data()

      if (trainerData.role !== 'trainer') {
        return { success: false, message: 'This code is not from a Trainer' }
      }

      if (trainerId === auth.currentUser.uid) {
        return { success: false, message: 'You cannot link to yourself' }
      }

      const userRef = doc(db, 'users', auth.currentUser.uid)
      await updateDoc(userRef, { trainerId }).catch(err => {
        console.error('Firestore Update Error:', err)
        throw new Error('Update failed')
      })

      // Create Notifications for both parties
      const timestamp = serverTimestamp()

      // Notification for Trainee
      await addDoc(collection(db, 'notifications'), {
        userId: auth.currentUser.uid,
        title: 'Linking Successful',
        message: `You are now connected to ${trainerData.displayName}.`,
        type: 'LINK_SUCCESS',
        read: false,
        createdAt: timestamp,
      })

      // Notification for Trainer
      await addDoc(collection(db, 'notifications'), {
        userId: trainerId,
        title: 'New Trainee Linked',
        message: `${auth.currentUser.displayName || 'A new trainee'} has joined your roster.`,
        type: 'LINK_SUCCESS',
        read: false,
        createdAt: timestamp,
      })

      // Refresh local state
      await fetchUser(auth.currentUser.uid)
      return { success: true, message: `Connected to ${trainerData.displayName}` }
    } catch (error: unknown) {
      console.error('Error linking trainer:', error)
      const message = error instanceof Error ? error.message : 'System Error. Try again.'
      return { success: false, message }
    }
  }

  return {
    role,
    userData,
    trainerName,
    loading,
    linkTrainerByCode,
    refreshProfile: () => auth.currentUser && fetchUser(auth.currentUser.uid),
  }
}
