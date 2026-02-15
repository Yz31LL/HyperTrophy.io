import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Calendar,
  Activity,
  ArrowUpRight,
  TrendingUp,
  LayoutDashboard,
  Bell,
  Search,
} from 'lucide-react'
import { Button } from '@repo/ui/Button'
import { useTrainees } from '../../hooks/useTrainees'
import { InviteCard } from './InviteCard'
import { auth } from '../../lib/firebase'
import { NotificationPanel } from '../../components/NotificationPanel'
import { useNotifications } from '../../hooks/useNotifications'

export function TrainerDashboard() {
  const { trainees, loading } = useTrainees()
  const { unreadCount } = useNotifications()
  const [isNotificationsOpen, setNotificationsOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#050508] text-slate-200 antialiased font-['Rajdhani',_sans-serif]">
      {/* Styles Injection */}
      <style>{`
        .font-cyber { font-family: 'Orbitron', sans-serif; }
        .glass-panel {
          background: rgba(15, 16, 20, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .neon-glow {
          box-shadow: 0 0 15px rgba(234, 179, 8, 0.2);
        }
      `}</style>

      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard className="h-4 w-4 text-yellow-500" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500">
                Command Center // Pro Coach
              </span>
            </div>
            <h1 className="text-4xl font-cyber font-bold tracking-wider text-white">
              Coach <span className="text-yellow-500">Matrix</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell
                className={`h-6 w-6 cursor-pointer transition-colors ${isNotificationsOpen ? 'text-yellow-500' : 'text-zinc-500 hover:text-white'}`}
                onClick={() => setNotificationsOpen(!isNotificationsOpen)}
              />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] text-black font-bold">
                  {unreadCount}
                </div>
              )}

              <NotificationPanel
                isOpen={isNotificationsOpen}
                onClose={() => setNotificationsOpen(false)}
              />
            </div>
            <div className="h-10 w-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-yellow-500 font-cyber mr-2">
              M
            </div>
            <button
              onClick={() => auth.signOut()}
              className="px-6 py-2 rounded bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all text-sm font-semibold tracking-wider text-white"
            >
              SIGN OUT
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-panel p-6 rounded-2xl space-y-2">
                <div className="flex justify-between items-start">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-[10px] text-zinc-500 font-mono">ACTIVE</span>
                </div>
                <div className="text-3xl font-cyber font-bold text-white">
                  {loading ? '...' : trainees.length}
                </div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest">
                  Trainees Managed
                </div>
              </div>
              <div className="glass-panel p-6 rounded-2xl space-y-2">
                <div className="flex justify-between items-start">
                  <Activity className="h-5 w-5 text-green-500" />
                  <span className="text-[10px] text-zinc-500 font-mono">AVG</span>
                </div>
                <div className="text-3xl font-cyber font-bold text-white">
                  {trainees.length > 0 ? '85%' : '0%'}
                </div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest">
                  Client Compliance
                </div>
              </div>
              <div className="glass-panel p-6 rounded-2xl space-y-2 border-yellow-500/20 bg-yellow-500/5">
                <div className="flex justify-between items-start">
                  <TrendingUp className="h-5 w-5 text-yellow-500" />
                  <span className="text-[10px] text-yellow-500/50 font-mono">STREAK</span>
                </div>
                <div className="text-3xl font-cyber font-bold text-white">0</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest">New Leads</div>
              </div>
            </div>

            {/* Trainee Monitor */}
            <div
              className={`glass-panel rounded-2xl p-8 min-h-[400px] flex flex-col ${trainees.length === 0 ? 'justify-center items-center' : 'justify-start'} relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Users className="h-32 w-32" />
              </div>

              {loading ? (
                <div className="flex items-center justify-center space-x-2 text-zinc-500 font-cyber">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
                  <span>Scanning Roster...</span>
                </div>
              ) : trainees.length === 0 ? (
                <div className="text-center space-y-6 max-w-sm relative z-10">
                  <div className="bg-zinc-900/80 p-6 rounded-full inline-block border border-white/5">
                    <Search className="h-10 w-10 text-zinc-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-cyber font-bold text-white">
                      No Trainees Available
                    </h3>
                    <p className="text-zinc-500 text-sm">
                      Your roster is currently empty. Share your invite link to start building your
                      team.
                    </p>
                  </div>
                  <Button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold h-12 px-8 rounded-sm">
                    VIEW INCOMING REQUESTS
                  </Button>
                </div>
              ) : (
                <div className="w-full space-y-4 relative z-10">
                  <h3 className="text-xl font-cyber font-bold text-white mb-6">Active Roster</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trainees.map(trainee => (
                      <Link
                        key={trainee.uid}
                        to={`/trainee-view/${trainee.uid}`}
                        className="glass-panel p-4 rounded-xl border-white/5 bg-white/5 hover:bg-white/10 transition-all group cursor-pointer block"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-zinc-800 flex items-center justify-center font-cyber text-lg text-yellow-500 font-bold border border-white/10">
                            {trainee.displayName?.charAt(0) || 'T'}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-bold text-white uppercase tracking-wider">
                              {trainee.displayName}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono tracking-tighter">
                              {trainee.email}
                            </div>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-zinc-600 group-hover:text-yellow-500 transition-colors" />
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] text-zinc-400 font-bold uppercase">
                              On Track
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-600 font-mono">LVL 04</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Tools */}
          <div className="lg:col-span-4 space-y-6">
            {/* Invite Tool */}
            <InviteCard role="trainer" />

            {/* Schedule Overview */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-cyber font-bold text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" /> Training Calendar
              </h3>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="flex gap-3 items-center p-3 rounded-xl bg-white/5 border border-white/5 opacity-50"
                  >
                    <div className="h-10 w-10 rounded-lg bg-zinc-800 flex flex-col items-center justify-center font-bold">
                      <span className="text-[8px] text-zinc-500">FEB</span>
                      <span className="text-xs text-white">1{i}</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 w-20 bg-zinc-800 rounded mb-1" />
                      <div className="h-1.5 w-12 bg-zinc-800/50 rounded" />
                    </div>
                  </div>
                ))}
                <Button className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold border border-blue-500/20 h-11">
                  MANAGE SCHEDULE
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
