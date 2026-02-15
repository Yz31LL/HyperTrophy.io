import { useState } from 'react'
import { UserPlus, Copy, Check, Link as LinkIcon, Loader2, XCircle } from 'lucide-react'
import { useUserRole } from '../../hooks/useUserRole'

interface InviteCardProps {
  role: 'trainer' | 'trainee'
  className?: string
}

export function InviteCard({ role, className = '' }: InviteCardProps) {
  const { userData, trainerName, linkTrainerByCode } = useUserRole()
  const [copied, setCopied] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [isLinking, setIsLinking] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const copyToClipboard = () => {
    if (!userData?.inviteCode) return
    navigator.clipboard.writeText(userData.inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleApplyCode = async () => {
    if (!manualCode.trim()) return
    setIsLinking(true)
    setMessage(null)

    const result = await linkTrainerByCode(manualCode)

    if (result.success) {
      setMessage({ type: 'success', text: result.message })
      setManualCode('')
    } else {
      setMessage({ type: 'error', text: result.message })
    }
    setIsLinking(false)
  }

  return (
    <div
      className={`glass-panel rounded-2xl p-6 border-yellow-500/30 bg-yellow-500/5 relative overflow-hidden ${className}`}
    >
      <div className="absolute -right-4 -top-4 bg-yellow-500 h-16 w-16 rotate-45 opacity-10" />

      <h3 className="text-lg font-cyber font-bold text-white mb-4 flex items-center gap-2">
        <UserPlus className="h-5 w-5 text-yellow-500" />
        {role === 'trainer' ? 'Recruit Trainees' : 'Legacy Connection'}
      </h3>

      <div className="space-y-5">
        {/* INVITE CODE DISPLAY (For Trainers & Referrals) */}
        <div className="bg-black/40 border border-white/10 rounded-lg p-4 group hover:border-yellow-500/50 transition-colors">
          <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2 block">
            {role === 'trainer' ? 'Your Personal Invite Code' : 'Share Your Referral Code'}
          </label>
          <div className="flex justify-between items-center gap-4">
            <span className="text-2xl font-cyber font-bold text-white tracking-[0.2em]">
              {userData?.inviteCode || '--------'}
            </span>
            <button
              onClick={copyToClipboard}
              className="p-2 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all border border-white/5 group-hover:border-yellow-500/30"
              title="Copy Code"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* CONNECTION STATUS */}
        <div className="space-y-4">
          {trainerName ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <LinkIcon className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-[9px] text-blue-400/70 uppercase font-bold tracking-widest">
                  {role === 'trainer' ? 'Mentor coach' : 'Connected Coach'}
                </p>
                <p className="text-sm font-cyber font-bold text-white">{trainerName}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder={role === 'trainer' ? 'LINK TO MENTOR CODE' : 'ENTER COACH CODE'}
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value.toUpperCase())}
                  className="w-full bg-black/60 border border-white/10 rounded p-3 text-sm font-cyber text-white placeholder:text-zinc-600 focus:border-yellow-500/50 outline-none transition-all"
                />
                <button
                  onClick={handleApplyCode}
                  disabled={isLinking || !manualCode}
                  className="absolute right-2 top-1.5 bottom-1.5 px-4 bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-bold rounded text-[10px] transition-all"
                >
                  {isLinking ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : 'LINK'}
                </button>
              </div>
              {message && (
                <div
                  className={`flex items-center gap-2 text-[10px] font-bold uppercase transition-all ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}
                >
                  {message.type === 'error' && <XCircle className="h-3 w-3" />}
                  {message.text}
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-[10px] text-zinc-500 uppercase tracking-tighter text-center leading-relaxed">
          {role === 'trainer'
            ? 'Clients linked via code receive your programming instantly'
            : 'Help your network forge their legacy. Shared codes grant referral bonus'}
        </p>
      </div>
    </div>
  )
}
