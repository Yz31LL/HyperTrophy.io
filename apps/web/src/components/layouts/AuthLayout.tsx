import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* BACKGROUND LAYER */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-black to-black pointer-events-none z-0" />

      {/* GLOWING HEADER */}
      <div className="z-10 mb-8 text-center relative">
        <h1 className="font-hyper-custom text-6xl md:text-8xl font-bold tracking-wider text-glow uppercase">
          Hyper<span className="text-yellow-500">Trophy</span>
        </h1>
        <p className="text-zinc-400 mt-2 text-sm uppercase tracking-[0.2em]">Forge Your Legacy</p>
      </div>

      {/* CONTENT CARD */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-white p-6 rounded-xl shadow-2xl shadow-yellow-500/5">
          {/* Optional Title/Description passed from Login/Signup screens */}
          <div className="mb-6 text-center space-y-1">
            {title && <h2 className="text-2xl font-bold">{title}</h2>}
            {description && <p className="text-zinc-400 text-sm">{description}</p>}
          </div>

          {/* The Form (Children) */}
          {children}
        </div>
      </div>

      {/* FOOTER */}
      <div className="z-10 mt-8 text-zinc-600 text-sm relative">
        <Link to="/" className="hover:text-zinc-400 transition-colors">
          &copy; 2024 HyperTrophy.io
        </Link>
      </div>
    </div>
  )
}
