import { useState, useEffect } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import { Notification } from '@repo/shared/schemas/notification'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!auth.currentUser) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[]

        setNotifications(docs)
        setUnreadCount(docs.filter(n => !n.read).length)
        setLoading(false)
      },
      error => {
        console.error('Error listening to notifications:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const markAsRead = async (notificationId: string) => {
    try {
      const ref = doc(db, 'notifications', notificationId)
      await updateDoc(ref, { read: true })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!auth.currentUser) return
    try {
      const batch = writeBatch(db)
      notifications
        .filter(n => !n.read)
        .forEach(n => {
          const ref = doc(db, 'notifications', n.id)
          batch.update(ref, { read: true })
        })
      await batch.commit()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const ref = doc(db, 'notifications', notificationId)
      await deleteDoc(ref)
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
}
