import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  eachDayOfInterval,
} from 'date-fns'
import { cn } from '../../lib/utils'

export interface CalendarProps {
  className?: string
  selected?: Date
  onSelect?: (date: Date) => void
  modifiers?: {
    hasEvents?: Date[]
  }
}

export function Calendar({ className, selected, onSelect, modifiers }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className={cn('p-4 bg-zinc-950 border border-zinc-800 rounded-xl', className)}>
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-sm font-cyber font-bold text-white uppercase tracking-wider">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-[10px] font-bold text-zinc-500 uppercase text-center py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, i) => {
          const isSelected = selected && isSameDay(day, selected)
          const isToday = isSameDay(day, new Date())
          const isCurrentMonth = isSameMonth(day, monthStart)
          const hasEvent = modifiers?.hasEvents?.some(eventDate => isSameDay(day, eventDate))

          return (
            <button
              key={i}
              onClick={() => onSelect?.(day)}
              className={cn(
                'relative h-10 sm:h-12 flex flex-col items-center justify-center rounded-lg text-xs transition-all border',
                !isCurrentMonth
                  ? 'text-zinc-700 border-transparent'
                  : 'text-zinc-300 border-zinc-900',
                isToday && 'bg-yellow-500/5 text-yellow-500 border-yellow-500/20',
                isSelected && 'bg-yellow-500 text-black border-yellow-500 font-bold',
                !isSelected && isCurrentMonth && 'hover:bg-zinc-900 hover:border-zinc-700'
              )}
            >
              <span className="relative z-10">{format(day, 'd')}</span>
              {hasEvent && !isSelected && (
                <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
              )}
              {isToday && !isSelected && (
                <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-yellow-500" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
