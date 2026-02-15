import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from 'firebase/firestore'
import { db, auth } from '../../lib/firebase'
import { Trophy, ArrowLeft, TrendingUp, Users, Shield, ShieldOff } from 'lucide-react'
import { Button } from '@repo/ui/Button'
import { LoadingScreen } from '../../components/ui/LoadingScreen'

interface LeaderboardEntry {
  uid: string
  displayName: string
  volume: number
  lastUpdated: Timestamp
  optIn: boolean
}

export function LeaderboardScreen() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isOptedIn, setIsOptedIn] = useState<boolean | null>(null)

  const currentWeekId = () => {
    const d = new Date()
    const year = d.getFullYear()
    const firstDayOfYear = new Date(year, 0, 1)
    const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000
    const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
    return `${year}-w${weekNum}`
  }

  const weekId = currentWeekId()

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    // 1. Check Opt-In Status
    const checkOptIn = async () => {
      const entryRef = doc(db, 'leaderboards', weekId, 'entries', user.uid)
      const entrySnap = await getDoc(entryRef)
      if (entrySnap.exists()) {
        setIsOptedIn(entrySnap.data().optIn ?? false)
      } else {
        setIsOptedIn(false)
      }
    }
    checkOptIn()

    // 2. Fetch Top Entries (only opted-in users)
    const q = query(
      collection(db, 'leaderboards', weekId, 'entries'),
      orderBy('volume', 'desc'),
      limit(20)
    )

    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(d => d.data() as LeaderboardEntry).filter(entry => entry.optIn)
      setEntries(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [weekId])

  const handleToggleOptIn = async () => {
    const user = auth.currentUser
    if (!user) return
    const newStatus = !isOptedIn

    try {
      await setDoc(
        doc(db, 'leaderboards', weekId, 'entries', user.uid),
        {
          uid: user.uid,
          displayName: user.displayName || 'Anonymous',
          volume: isOptedIn ? 0 : 0, // Reset volume if opting out? No, keep it but filter output.
          optIn: newStatus,
          lastUpdated: new Date(),
        },
        { merge: true }
      )
      setIsOptedIn(newStatus)
    } catch (err) {
      console.error('Error toggling opt-in:', err)
    }
  }

  if (loading) return <LoadingScreen message="Calculating Rankings..." />

  return (
    <div className="min-h-screen bg-[#050508] text-slate-200 p-6 md:p-8 font-['Rajdhani',_sans-serif]">
      <style>{`
        .font-cyber { font-family: 'Orbitron', sans-serif; }
        .glass-panel {
          background: rgba(15, 16, 20, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .rank-gold { color: #fbbf24; text-shadow: 0 0 10px rgba(251, 191, 36, 0.4); }
        .rank-silver { color: #94a3b8; text-shadow: 0 0 10px rgba(148, 163, 184, 0.4); }
        .rank-bronze { color: #b45309; text-shadow: 0 0 10px rgba(180, 83, 9, 0.4); }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full glass-panel hover:bg-white/10 transition-all border border-white/5"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em]">
                  Global Protocol // {weekId}
                </span>
              </div>
              <h1 className="text-4xl font-cyber font-bold tracking-wider text-white">
                Weekly <span className="text-yellow-500">Board</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-[10px] text-zinc-500 font-mono uppercase">Metric</p>
              <p className="text-xs font-bold text-white uppercase tracking-widest">Total Volume</p>
            </div>
            <Button
              onClick={handleToggleOptIn}
              className={`flex gap-2 font-cyber text-xs tracking-widest h-11 px-6 rounded-sm transition-all ${
                isOptedIn
                  ? 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20'
                  : 'bg-yellow-500 text-black font-bold'
              }`}
            >
              {isOptedIn ? (
                <>
                  <Shield className="h-4 w-4" /> OPTED IN
                </>
              ) : (
                <>
                  <ShieldOff className="h-4 w-4" /> JOIN BOARD
                </>
              )}
            </Button>
          </div>
        </header>

        {/* Top 3 Podiums */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map(i => {
            const entry = entries[i]
            if (!entry) return null
            const colors = ['rank-gold', 'rank-silver', 'rank-bronze']
            return (
              <div
                key={entry.uid}
                className="glass-panel p-8 rounded-2xl text-center relative overflow-hidden group"
              >
                <div className={`text-5xl font-cyber font-black mb-2 ${colors[i]}`}>0{i + 1}</div>
                <div className="h-16 w-16 rounded-full bg-zinc-800 border-2 border-white/10 mx-auto flex items-center justify-center font-cyber text-2xl text-white mb-4">
                  {entry.displayName.charAt(0)}
                </div>
                <h3 className="text-lg font-bold text-white uppercase tracking-tight truncate">
                  {entry.displayName}
                </h3>
                <div className="mt-4 flex flex-col items-center">
                  <div className="flex items-center gap-2 text-yellow-500">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xl font-cyber font-bold">
                      {entry.volume.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1">
                    Kgs Lifted
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* List of remaining ranks */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
            <span>Warrior</span>
            <span>Volume Status</span>
          </div>
          <div className="divide-y divide-white/5">
            {entries.length === 0 ? (
              <div className="p-10 text-center space-y-4">
                <Users className="h-10 w-10 text-zinc-800 mx-auto" />
                <p className="text-zinc-500 font-cyber text-sm uppercase">
                  Waiting for transmissions...
                </p>
              </div>
            ) : (
              entries.slice(3).map((entry, i) => (
                <div
                  key={entry.uid}
                  className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-5">
                    <span className="font-mono text-zinc-600 text-sm">{i + 4}</span>
                    <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center font-bold text-zinc-400">
                      {entry.displayName.charAt(0)}
                    </div>
                    <span className="font-bold text-white uppercase tracking-wide group-hover:text-yellow-500 transition-colors">
                      {entry.displayName}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-cyber font-bold text-white">
                      {entry.volume.toLocaleString()}
                    </div>
                    <div className="text-[8px] text-zinc-500 font-mono uppercase">
                      Total Volume // Weekly
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {!isOptedIn && (
          <div className="p-8 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 text-center">
            <h4 className="text-yellow-500 font-cyber font-bold text-lg mb-2 capitalize">
              Join the weekly heat
            </h4>
            <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6">
              Opt-in to compare your weekly training volume with other warriors in the system. Your
              data is only visible to others on the board if you choose to participate.
            </p>
            <Button
              onClick={handleToggleOptIn}
              className="bg-yellow-500 text-black font-bold h-11 px-8 rounded-sm font-cyber"
            >
              ACTIVATE PROTOCOL
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
