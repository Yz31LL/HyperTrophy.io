import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Button } from '@repo/ui/Button'
import { X, Send, Megaphone } from 'lucide-react'
import { Trainee } from '../hooks/useTrainees'

interface BroadcastModalProps {
  isOpen: boolean
  onClose: () => void
  trainees: Trainee[]
}

export function BroadcastModal({ isOpen, onClose, trainees }: BroadcastModalProps) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  if (!isOpen) return null

  const handleSend = async () => {
    if (!message || trainees.length === 0) return
    setIsSending(true)

    try {
      const promises = trainees.map(trainee =>
        addDoc(collection(db, 'notifications'), {
          userId: trainee.uid,
          title: 'Broadcast from Coach',
          message: message,
          type: 'info',
          read: false,
          createdAt: serverTimestamp(),
        })
      )

      await Promise.all(promises)
      setMessage('')
      onClose()
      alert(`Broadcast sent to ${trainees.length} trainees.`)
    } catch (error) {
      console.error('Error sending broadcast:', error)
      alert('Failed to send broadcast.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-lg rounded-2xl border-yellow-500/20 overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Megaphone className="h-5 w-5 text-yellow-500" />
            <h3 className="text-xl font-cyber font-bold text-white uppercase tracking-wider">
              Broadcast System
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-mono uppercase tracking-widest">
              Recipients
            </span>
            <span className="bg-yellow-500 text-black px-3 py-1 rounded text-xs font-bold font-cyber">
              {trainees.length} UNITS
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] ml-1">
              Transmission Content
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Enter message for all trainees..."
              className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-yellow-500 transition-colors resize-none font-sans"
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={isSending || !message || trainees.length === 0}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold h-14 rounded-xl font-cyber tracking-widest group"
          >
            {isSending ? (
              'TRANSMITTING...'
            ) : (
              <div className="flex items-center justify-center gap-2">
                INITIATE BROADCAST
                <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
