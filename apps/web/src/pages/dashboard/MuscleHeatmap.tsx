import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/Card'
import { MuscleGroup } from '../../lib/analytics'

// Helper to get color based on set volume
// 0 sets = gray, 1-4 = light blue, 5-9 = blue, 10+ = bright orange (overtraining/max)
const getIntensityColor = (sets: number) => {
  if (sets === 0) return '#e2e8f0' // slate-200
  if (sets < 5) return '#93c5fd' // blue-300
  if (sets < 10) return '#3b82f6' // blue-500
  return '#f97316' // orange-500
}

interface MuscleHeatmapProps {
  volumeData: Record<MuscleGroup, number>
}

export function MuscleHeatmap({ volumeData }: MuscleHeatmapProps) {
  // Accessibility Data Table (Hidden visually, available to screen readers)
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
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Weekly Training Load</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-6 relative">
        {a11yTable}

        {/* --- SIMPLIFIED SVG BODY MAP --- */}
        <svg viewBox="0 0 200 300" className="h-64 w-auto">
          {/* Head (neutral) */}
          <circle cx="100" cy="30" r="15" fill="#cbd5e1" />

          {/* SHOULDERS (Left/Right) */}
          <motion.path
            d="M 65 50 Q 100 60 135 50 L 145 70 L 130 80 L 70 80 L 55 70 Z"
            fill={getIntensityColor(volumeData.shoulders)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* CHEST */}
          <motion.path
            d="M 70 80 L 130 80 L 125 110 Q 100 120 75 110 Z"
            fill={getIntensityColor(volumeData.chest)}
            stroke="white"
            strokeWidth="1"
          />

          {/* ARMS (Biceps/Triceps combined) */}
          <motion.rect
            x="40"
            y="70"
            width="20"
            height="60"
            rx="5"
            fill={getIntensityColor(volumeData.arms)}
          />
          <motion.rect
            x="140"
            y="70"
            width="20"
            height="60"
            rx="5"
            fill={getIntensityColor(volumeData.arms)}
          />

          {/* CORE/ABS */}
          <motion.rect
            x="75"
            y="110"
            width="50"
            height="60"
            rx="2"
            fill={getIntensityColor(volumeData.core)}
          />

          {/* LEGS (Quads) */}
          <motion.path
            d="M 75 170 L 95 170 L 95 240 L 80 240 Z"
            fill={getIntensityColor(volumeData.legs)}
          />
          <motion.path
            d="M 105 170 L 125 170 L 120 240 L 105 240 Z"
            fill={getIntensityColor(volumeData.legs)}
          />

          {/* BACK (Represented as silhouette behind or simplistic lat wings) */}
          <path
            d="M 65 50 L 50 100 L 70 110"
            fill="none"
            stroke={getIntensityColor(volumeData.back)}
            strokeWidth="4"
          />
          <path
            d="M 135 50 L 150 100 L 130 110"
            fill="none"
            stroke={getIntensityColor(volumeData.back)}
            strokeWidth="4"
          />
        </svg>

        {/* Legend */}
        <div className="absolute bottom-0 right-0 text-[10px] space-y-1 p-2 bg-white/80 dark:bg-black/50 rounded backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-200" /> Rest
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
