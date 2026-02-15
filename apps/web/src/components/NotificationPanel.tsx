import { Bell, X, Check, Trash2 } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications()

  if (!isOpen) return null

  return (
    <div className="absolute top-16 right-0 w-80 md:w-96 glass-panel rounded-2xl shadow-2xl z-50 border border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-yellow-500" />
          <h3 className="text-sm font-cyber font-bold text-white uppercase tracking-wider">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-yellow-500 text-[10px] text-black font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[10px] text-zinc-400 hover:text-white transition-colors uppercase font-bold tracking-tighter"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors text-zinc-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm italic">
            No transmissions detected.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-4 hover:bg-white/5 transition-colors group relative ${!notif.read ? 'bg-yellow-500/5' : ''}`}
              >
                {!notif.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500" />
                )}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white mb-1 leading-tight">
                      {notif.title}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-2">{notif.message}</p>
                    <span className="text-[10px] text-zinc-600 font-mono">
                      {notif.createdAt?.toDate
                        ? formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true })
                        : 'just now'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="p-1 hover:bg-yellow-500/20 rounded text-yellow-500"
                        title="Mark as read"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="p-1 hover:bg-red-500/20 rounded text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
