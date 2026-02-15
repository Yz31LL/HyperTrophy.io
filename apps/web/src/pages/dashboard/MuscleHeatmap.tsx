import { useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/Card'
import { MuscleGroup } from '../../lib/analytics'

// --- CONFIGURATION ---

// Helper to get color based on set volume
// Darker grey (#334155) for 0 sets prevents the "bright light" look in dark mode
const getIntensityColor = (sets: number) => {
  if (sets === 0) return '#334155'
  if (sets < 5) return '#93c5fd' // blue-300
  if (sets < 10) return '#3b82f6' // blue-500
  return '#f97316' // orange-500
}

interface MuscleHeatmapProps {
  volumeData: Record<MuscleGroup, number>
}

// Define specific props for the sub-components to fix the "any" error
interface BodyPartProps {
  volumeData: Record<MuscleGroup, number>
}

export function MuscleHeatmap({ volumeData }: MuscleHeatmapProps) {
  const [isBackView, setIsBackView] = useState(false)

  // Accessibility Data Table (Hidden visually)
  const a11yTable = (
    <div className="sr-only">
      <h3>Weekly Volume by Muscle Group</h3>
      <table>
        <thead>
          <tr>
            <th>Muscle</th>
            <th>Sets</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(volumeData).map(([muscle, sets]) => (
            <tr key={muscle}>
              <td>{muscle}</td>
              <td>{sets} sets</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Weekly Training Load</CardTitle>
        <button
          onClick={() => setIsBackView(!isBackView)}
          className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors z-10"
        >
          <RefreshCw className="w-3 h-3" />
          {isBackView ? 'Show Front' : 'Show Back'}
        </button>
      </CardHeader>

      <CardContent
        className="flex items-center justify-center p-6 relative min-h-[300px]"
        style={{ perspective: '1000px' }}
      >
        {a11yTable}

        {/* 3D FLIP CONTAINER */}
        <motion.div
          className="relative w-full h-64 flex justify-center items-center"
          initial={false}
          animate={{ rotateY: isBackView ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* --- FRONT VIEW --- */}
          <div
            className="absolute inset-0 flex justify-center items-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <FrontBody volumeData={volumeData} />
          </div>

          {/* --- BACK VIEW --- */}
          <div
            className="absolute inset-0 flex justify-center items-center"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <BackBody volumeData={volumeData} />
          </div>
        </motion.div>

        {/* Legend */}
        <div className="absolute bottom-0 right-0 text-[10px] space-y-1 p-2 bg-background/80 rounded backdrop-blur-sm border border-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-700" /> Rest
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" /> Active
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500" /> Max
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// --- SUB COMPONENTS FOR SVG PATHS ---

const FrontBody = ({ volumeData }: BodyPartProps) => (
  <svg viewBox="0 0 200 300" className="h-64 w-auto drop-shadow-xl">
    {/* Head */}
    <circle cx="100" cy="30" r="15" fill="#94a3b8" />

    {/* SHOULDERS (Front Delts) */}
    <path
      d="M 65 50 Q 100 60 135 50 L 145 70 L 130 80 L 70 80 L 55 70 Z"
      fill={getIntensityColor(volumeData.shoulders)}
      stroke="#020817"
      strokeWidth="2"
    />

    {/* CHEST (Pecs) - White stroke removed */}
    <path
      d="M 70 80 L 130 80 L 125 110 Q 100 120 75 110 Z"
      fill={getIntensityColor(volumeData.chest)}
      stroke="#020817"
      strokeWidth="2"
    />

    {/* ARMS (Biceps) */}
    <rect
      x="40"
      y="70"
      width="20"
      height="50"
      rx="5"
      fill={getIntensityColor(volumeData.arms)}
      stroke="#020817"
      strokeWidth="2"
    />
    <rect
      x="140"
      y="70"
      width="20"
      height="50"
      rx="5"
      fill={getIntensityColor(volumeData.arms)}
      stroke="#020817"
      strokeWidth="2"
    />

    {/* FOREARMS */}
    <rect
      x="38"
      y="125"
      width="18"
      height="40"
      rx="4"
      fill={getIntensityColor(volumeData.arms)}
      opacity="0.8"
    />
    <rect
      x="144"
      y="125"
      width="18"
      height="40"
      rx="4"
      fill={getIntensityColor(volumeData.arms)}
      opacity="0.8"
    />

    {/* CORE/ABS */}
    <path
      d="M 75 110 L 125 110 L 120 160 L 80 160 Z"
      fill={getIntensityColor(volumeData.core)}
      stroke="#020817"
      strokeWidth="2"
    />

    {/* LEGS (Quads) */}
    <path
      d="M 80 160 L 98 160 L 95 230 L 75 220 Z"
      fill={getIntensityColor(volumeData.legs)}
      stroke="#020817"
      strokeWidth="2"
    />
    <path
      d="M 102 160 L 120 160 L 125 220 L 105 230 Z"
      fill={getIntensityColor(volumeData.legs)}
      stroke="#020817"
      strokeWidth="2"
    />

    {/* CALVES (Front) */}
    <path
      d="M 78 235 L 92 235 L 90 280 L 80 280 Z"
      fill={getIntensityColor(volumeData.legs)}
      opacity="0.9"
    />
    <path
      d="M 108 235 L 122 235 L 120 280 L 110 280 Z"
      fill={getIntensityColor(volumeData.legs)}
      opacity="0.9"
    />
  </svg>
)

const BackBody = ({ volumeData }: BodyPartProps) => (
  <svg viewBox="0 0 200 300" className="h-64 w-auto drop-shadow-xl">
    {/* Head (Back) */}
    <circle cx="100" cy="30" r="15" fill="#94a3b8" />

    {/* TRAPS (Upper Back) */}
    <path
      d="M 85 50 L 115 50 L 100 80 Z"
      fill={getIntensityColor(volumeData.back)}
      stroke="#020817"
      strokeWidth="2"
    />

    {/* SHOULDERS (Rear Delts) */}
    <path
      d="M 55 60 L 85 50 L 80 75 L 50 80 Z"
      fill={getIntensityColor(volumeData.shoulders)}
      stroke="#020817"
      strokeWidth="2"
    />
    <path
      d="M 145 60 L 115 50 L 120 75 L 150 80 Z"
      fill={getIntensityColor(volumeData.shoulders)}
      stroke="#020817"
      strokeWidth="2"
    />

    {/* LATS (Wings) */}
    <path
      d="M 70 80 L 130 80 L 120 130 L 100 140 L 80 130 Z"
      fill={getIntensityColor(volumeData.back)}
      stroke="#020817"
      strokeWidth="2"
    />

    {/* ARMS (Triceps) */}
    <rect
      x="40"
      y="70"
      width="22"
      height="50"
      rx="5"
      fill={getIntensityColor(volumeData.arms)}
      stroke="#020817"
      strokeWidth="2"
    />
    <rect
      x="138"
      y="70"
      width="22"
      height="50"
      rx="5"
      fill={getIntensityColor(volumeData.arms)}
      stroke="#020817"
      strokeWidth="2"
    />

    {/* LOWER BACK / GLUTES */}
    <path
      d="M 75 140 L 125 140 L 130 170 L 70 170 Z"
      fill={getIntensityColor(volumeData.back)}
      opacity="0.9"
      stroke="#020817"
      strokeWidth="2"
    />

    {/* LEGS (Hamstrings) */}
    <path
      d="M 72 175 L 95 175 L 92 230 L 70 230 Z"
      fill={getIntensityColor(volumeData.legs)}
      stroke="#020817"
      strokeWidth="2"
    />
    <path
      d="M 105 175 L 128 175 L 130 230 L 108 230 Z"
      fill={getIntensityColor(volumeData.legs)}
      stroke="#020817"
      strokeWidth="2"
    />

    {/* CALVES (Back View) */}
    <path d="M 75 235 L 90 235 L 85 270 L 78 270 Z" fill={getIntensityColor(volumeData.legs)} />
    <path d="M 110 235 L 125 235 L 122 270 L 115 270 Z" fill={getIntensityColor(volumeData.legs)} />
  </svg>
)
