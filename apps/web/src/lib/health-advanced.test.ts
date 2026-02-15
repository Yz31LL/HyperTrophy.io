import { describe, it, expect } from 'vitest'
import { calculateOneRepMax, calculateIdealWeight } from './health-advanced'

describe('Advanced Health Formulas', () => {
  describe('One-Rep Max (Epley Formula)', () => {
    it('calculates 1RM correctly for standard values', () => {
      // 100kg for 10 reps: 100 * (1 + 10/30) = 133.33 -> 133
      expect(calculateOneRepMax(100, 10)).toBe(133)
    })

    it('returns the same weight if reps are 1', () => {
      expect(calculateOneRepMax(100, 1)).toBe(100)
    })

    it('handles zero weight or reps correctly', () => {
      expect(calculateOneRepMax(0, 10)).toBe(0)
      expect(calculateOneRepMax(100, 0)).toBe(100)
    })
  })

  describe('Ideal Body Weight (Devine Formula)', () => {
    it('calculates ideal weight for a 180cm male', () => {
      // Male: 50 + 2.3 * ((180/2.54) - 60)
      // 180cm = 70.866 inches
      // 50 + 2.3 * (70.866 - 60) = 50 + 2.3 * 10.866 = 50 + 24.9918 = 74.99 -> 75
      expect(calculateIdealWeight(180, 'male')).toBe(75)
    })

    it('calculates ideal weight for a 165cm female', () => {
      // Female: 45.5 + 2.3 * ((165/2.54) - 60)
      // 165cm = 64.96 inches
      // 45.5 + 2.3 * (64.96 - 60) = 45.5 + 2.3 * 4.96 = 45.5 + 11.408 = 56.908 -> 57
      expect(calculateIdealWeight(165, 'female')).toBe(57)
    })

    it('handles very short heights by returning base weight', () => {
      // If height < 152.4cm (60 inches), return 50 for male, 45.5 for female
      expect(calculateIdealWeight(150, 'male')).toBe(50)
      expect(calculateIdealWeight(150, 'female')).toBe(46) // Rounding 45.5
    })
  })
})
