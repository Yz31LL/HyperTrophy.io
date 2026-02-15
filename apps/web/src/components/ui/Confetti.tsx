import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const CONFETTI_COLORS = ['#EAB308', '#FACC15', '#FFFFFF', '#CA8A04'] // Gold, Yellow, White, Dark Gold

interface ConfettiProps {
  active: boolean
}

export function Confetti({ active }: ConfettiProps) {
  const [particles, setParticles] = useState<number[]>([])

  useEffect(() => {
    if (active) {
      // Generate 50 particles
      const newParticles = Array.from({ length: 50 }).map((_, i) => i)
      setParticles(newParticles)

      // Cleanup after animation (3 seconds)
      const timer = setTimeout(() => setParticles([]), 3000)
      return () => clearTimeout(timer)
    }
  }, [active])

  if (!active && particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex justify-center overflow-hidden">
      {particles.map(i => (
        <ConfettiParticle key={i} />
      ))}
    </div>
  )
}

function ConfettiParticle() {
  // Random physics parameters
  const randomX = Math.random() * 400 - 200 // Spread horizontal -200 to 200
  const randomY = Math.random() * -300 - 100 // Shoot up -100 to -400
  const randomRotate = Math.random() * 360
  const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]

  return (
    <motion.div
      initial={{ x: 0, y: '100vh', opacity: 1, scale: 0.5 }} // Start from bottom center
      animate={{
        x: randomX,
        y: [null, randomY, '100vh'], // Go up, then fall down
        rotate: [0, randomRotate, randomRotate + 180],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 2.5 + Math.random(), // Random duration between 2.5s and 3.5s
        ease: [0.25, 0.1, 0.25, 1], // Cubic bezier for "pop" feel
      }}
      style={{
        width: '10px',
        height: '10px',
        backgroundColor: color,
        position: 'absolute',
        top: '50%', // Start near middle/bottom
        borderRadius: Math.random() > 0.5 ? '50%' : '2px', // Mix of circles and squares
      }}
    />
  )
}
