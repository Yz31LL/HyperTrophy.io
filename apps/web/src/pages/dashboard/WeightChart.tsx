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

export function WeightChart({ history }: WeightChartProps) {
  // 1. Process Data: Convert Firestore Timestamps to JS Dates & Sort
  const chartData =
    history && history.length > 0
      ? history
          .map(log => {
            // Handle Firestore Timestamp (has .toDate()) or standard Date
            const dateObj =
              log.date && typeof log.date.toDate === 'function'
                ? log.date.toDate()
                : new Date(log.date as unknown as string)

            return {
              rawDate: dateObj,
              dateLabel: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), // e.g. "Jan 1"
              weight: log.weight,
            }
          })
          // Dashboard passes desc (Newest First), so we reverse to show timeline (Oldest -> Newest)
          .reverse()
      : []

  if (chartData.length === 0) {
    return (
      <Card className="col-span-2 bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-400">Weight Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-zinc-500">
          <p>No weight data logged yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-2 bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-200">Weight Trend</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
            <XAxis
              dataKey="dateLabel"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#71717a' }} // Zinc-500
              dy={10}
              minTickGap={30} // Prevents bunching up if you have many logs
            />
            <YAxis
              domain={['dataMin - 2', 'dataMax + 2']} // Adds padding so the line isn't at the edge
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#71717a' }}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b', // Zinc-950
                borderColor: '#27272a', // Zinc-800
                borderRadius: '8px',
                color: '#fff',
              }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#a1a1aa' }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#2563eb" // Blue-600 (Matches your Protein/Macro colors)
              strokeWidth={3}
              dot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#60a5fa' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
