import { motion } from 'framer-motion'
import { Dumbbell } from 'lucide-react'

export function LoadingScreen({ message = 'Initializing System' }: { message?: string }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#09090b] text-white"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(234,179,8,0.1),transparent_70%)] pointer-events-none" />

      <div className="relative flex flex-col items-center">
        {/* Pulsing Icon */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="mb-6 relative"
        >
          <div className="absolute inset-0 blur-xl bg-yellow-500/20 rounded-full" />
          <Dumbbell className="h-16 w-16 text-yellow-500 relative z-10" aria-hidden="true" />
        </motion.div>

        {/* Logo Text */}
        <div className="text-3xl font-bold tracking-tighter uppercase font-chakra mb-2">
          Hyper<span className="text-yellow-500 font-black">Trophy</span>
        </div>

        {/* Loading Message */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em] animate-pulse">
              {message}
            </span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 1] }}
              className="w-1.5 h-1.5 bg-yellow-500 rounded-full mb-0.5"
            />
          </div>

          {/* Progress Bar Simulation */}
          <div className="w-48 h-1 bg-zinc-900 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500 to-transparent w-full"
            />
          </div>
        </div>
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  )
}
