import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/Card'
import { WeightLog } from '../../lib/analytics'

interface WeightChartProps {
  history?: WeightLog[]
}

// Mock data for Phase 2 (Phase 3 will fetch real history)
const data = [
  { date: 'Mon', weight: 80.5 },
  { date: 'Tue', weight: 80.2 },
  { date: 'Wed', weight: 80.4 },
  { date: 'Thu', weight: 80.1 },
  { date: 'Fri', weight: 79.9 },
  { date: 'Sat', weight: 79.8 },
  { date: 'Sun', weight: 79.5 },
]

export function WeightChart({ history }: WeightChartProps) {
  // Use history if available, else fallback to mock data for now
  const chartData =
    history && history.length > 0
      ? history
          .map(log => ({
            date: log.date.toDate().toLocaleDateString('en-US', { weekday: 'short' }),
            weight: log.weight,
          }))
          .reverse()
      : data

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Weight Trend</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#888' }}
              dy={10}
            />
            <YAxis
              domain={['auto', 'auto']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#888' }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#2563eb" // Primary Blue
              strokeWidth={3}
              dot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
