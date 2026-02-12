import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface MacroData {
  name: string
  value: number
  color: string
}

interface NutritionDonutChartProps {
  consumed: { protein: number; carbs: number; fat: number }
  targets: { protein: number; carbs: number; fat: number }
}

export function NutritionDonutChart({ consumed }: Omit<NutritionDonutChartProps, 'targets'>) {
  // Calculate percentages or absolute values for the chart
  const data: MacroData[] = [
    { name: 'Protein', value: consumed.protein, color: '#2563eb' }, // Blue
    { name: 'Carbs', value: consumed.carbs, color: '#eab308' }, // Yellow
    { name: 'Fats', value: consumed.fat, color: '#22c55e' }, // Green
  ]

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={200} height={200}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center -mt-28 mb-16">
        <span className="text-2xl font-bold">
          {Math.round(consumed.protein * 4 + consumed.carbs * 4 + consumed.fat * 9)}
        </span>
        <p className="text-xs text-muted-foreground">kcal logged</p>
      </div>
    </div>
  )
}
