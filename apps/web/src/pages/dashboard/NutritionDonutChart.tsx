import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { History } from 'lucide-react'

interface MacroData {
  name: string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    payload: MacroData
  }>
}

interface NutritionDonutChartProps {
  consumed: { protein: number; carbs: number; fat: number }
  targets: { protein: number; carbs: number; fat: number }
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0]
    return (
      <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg shadow-xl min-w-[100px]">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
            style={{ backgroundColor: data.payload.color, color: data.payload.color }}
          />
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            {data.name}
          </span>
        </div>
        <div className="text-xl font-bold text-white flex items-baseline gap-1">
          {data.value}
          <span className="text-xs text-zinc-500 font-normal">g</span>
        </div>
      </div>
    )
  }
  return null
}

export function NutritionDonutChart({ consumed, targets }: NutritionDonutChartProps) {
  const navigate = useNavigate()

  const data: MacroData[] = [
    { name: 'Protein', value: consumed.protein, color: '#3b82f6' },
    { name: 'Carbs', value: consumed.carbs, color: '#eab308' },
    { name: 'Fats', value: consumed.fat, color: '#22c55e' },
  ]

  const activeData = data.filter(d => d.value > 0)

  const totalConsumed = Math.round(consumed.protein * 4 + consumed.carbs * 4 + consumed.fat * 9)
  const totalTarget = targets.protein * 4 + targets.carbs * 4 + targets.fat * 9
  const percentComplete =
    totalTarget > 0 ? Math.min(100, Math.round((totalConsumed / totalTarget) * 100)) : 0

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="h-[200px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={activeData}
              cx="50%"
              cy="50%"
              // FIXED: Reduced radius sizes to prevent clipping
              innerRadius={55} // Was 60
              outerRadius={75} // Was 80
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={1500}
            >
              {activeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'transparent' }}
              wrapperStyle={{ outline: 'none', zIndex: 50 }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 pb-6">
          <span className="text-3xl font-bold text-white">{percentComplete}%</span>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Goal</p>
        </div>
      </div>

      {/* Bottom Info & Button */}
      <div className="mt-2 flex flex-col items-center gap-2 z-10">
        <span className="text-sm font-medium text-zinc-400">
          {totalConsumed} / {Math.round(totalTarget)} kcal
        </span>

        <button
          onClick={() => navigate('/history')}
          className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-blue-500 hover:text-blue-400 transition-colors px-2 py-1 rounded hover:bg-blue-500/10"
        >
          <History className="w-3 h-3" /> History
        </button>
      </div>
    </div>
  )
}
