import { describe, it, expect } from 'vitest'
import { detectPersonalRecords, getVolumeTrendData, Workout } from './analytics'
import { Timestamp } from 'firebase/firestore'

describe('Workout Analytics', () => {
  const mockWorkouts: Workout[] = [
    {
      id: '1',
      exercises: [
        {
          name: 'Bench Press (Flat)',
          sets: [
            { completed: true, weight: 60, reps: 10 },
            { completed: true, weight: 60, reps: 10 },
          ],
        },
      ],
      completedAt: Timestamp.fromDate(new Date('2024-01-01')),
    },
    {
      id: '2',
      exercises: [
        {
          name: 'Bench Press (Flat)',
          sets: [
            { completed: true, weight: 70, reps: 5 }, // PR Weight
            { completed: true, weight: 60, reps: 12 }, // PR Volume (720 vs 600)
          ],
        },
        {
          name: 'Squat',
          sets: [{ completed: true, weight: 100, reps: 5 }],
        },
      ],
      completedAt: Timestamp.fromDate(new Date('2024-01-02')),
    },
  ]

  describe('detectPersonalRecords', () => {
    it('detects max weight correctly', () => {
      const prs = detectPersonalRecords(mockWorkouts)
      const benchPr = prs.get('Bench Press (Flat)')
      expect(benchPr?.maxWeight).toBe(70)
    })

    it('detects max volume correctly', () => {
      const prs = detectPersonalRecords(mockWorkouts)
      const benchPr = prs.get('Bench Press (Flat)')
      expect(benchPr?.maxVolume).toBe(720)
    })

    it('handles multiple exercises', () => {
      const prs = detectPersonalRecords(mockWorkouts)
      expect(prs.has('Bench Press (Flat)')).toBe(true)
      expect(prs.has('Squat')).toBe(true)
      expect(prs.get('Squat')?.maxWeight).toBe(100)
    })
  })

  describe('getVolumeTrendData', () => {
    it('aggregates daily volume correctly', () => {
      const trend = getVolumeTrendData(mockWorkouts)
      expect(trend).toHaveLength(2)
      expect(trend[0].volume).toBe(1200) // 60*10 + 60*10
      expect(trend[1].volume).toBe(1570)
    })

    it('sorts data by date', () => {
      const trend = getVolumeTrendData(mockWorkouts)
      expect(new Date(trend[0].date).getTime()).toBeLessThan(new Date(trend[1].date).getTime())
    })
  })
})
