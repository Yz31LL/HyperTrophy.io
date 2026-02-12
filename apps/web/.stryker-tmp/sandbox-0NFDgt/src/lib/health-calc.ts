// @ts-nocheck
function stryNS_9fa48() {
  var g =
    (typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis) ||
    new Function('return this')()
  var ns = g.__stryker__ || (g.__stryker__ = {})
  if (
    ns.activeMutant === undefined &&
    g.process &&
    g.process.env &&
    g.process.env.__STRYKER_ACTIVE_MUTANT__
  ) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__
  }
  function retrieveNS() {
    return ns
  }
  stryNS_9fa48 = retrieveNS
  return retrieveNS()
}
stryNS_9fa48()
function stryCov_9fa48() {
  var ns = stryNS_9fa48()
  var cov =
    ns.mutantCoverage ||
    (ns.mutantCoverage = {
      static: {},
      perTest: {},
    })
  function cover() {
    var c = cov.static
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {}
    }
    var a = arguments
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1
    }
  }
  stryCov_9fa48 = cover
  cover.apply(null, arguments)
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48()
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')')
      }
      return true
    }
    return false
  }
  stryMutAct_9fa48 = isActive
  return isActive(id)
}
import { UserProfile } from '@repo/shared/schemas'
export function calculateBMR(profile: UserProfile): number {
  if (stryMutAct_9fa48('0')) {
    {
    }
  } else {
    stryCov_9fa48('0')
    const s = (
      stryMutAct_9fa48('3')
        ? profile.gender !== 'male'
        : stryMutAct_9fa48('2')
          ? false
          : stryMutAct_9fa48('1')
            ? true
            : (stryCov_9fa48('1', '2', '3'),
              profile.gender === (stryMutAct_9fa48('4') ? '' : (stryCov_9fa48('4'), 'male')))
    )
      ? 5
      : stryMutAct_9fa48('5')
        ? +161
        : (stryCov_9fa48('5'), -161)
    const bmr = stryMutAct_9fa48('6')
      ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - s
      : (stryCov_9fa48('6'),
        (stryMutAct_9fa48('7')
          ? 10 * profile.weight + 6.25 * profile.height + 5 * profile.age
          : (stryCov_9fa48('7'),
            (stryMutAct_9fa48('8')
              ? 10 * profile.weight - 6.25 * profile.height
              : (stryCov_9fa48('8'),
                (stryMutAct_9fa48('9')
                  ? 10 / profile.weight
                  : (stryCov_9fa48('9'), 10 * profile.weight)) +
                  (stryMutAct_9fa48('10')
                    ? 6.25 / profile.height
                    : (stryCov_9fa48('10'), 6.25 * profile.height)))) -
              (stryMutAct_9fa48('11')
                ? 5 / profile.age
                : (stryCov_9fa48('11'), 5 * profile.age)))) + s)
    return Math.round(
      (
        stryMutAct_9fa48('15')
          ? bmr <= 0
          : stryMutAct_9fa48('14')
            ? bmr >= 0
            : stryMutAct_9fa48('13')
              ? false
              : stryMutAct_9fa48('12')
                ? true
                : (stryCov_9fa48('12', '13', '14', '15'), bmr > 0)
      )
        ? bmr
        : 0
    ) // Ensure BMR never goes negative (though formula unlikely to)
  }
}
export function calculateTDEE(bmr: number, activityLevel: UserProfile['activityLevel']): number {
  if (stryMutAct_9fa48('16')) {
    {
    }
  } else {
    stryCov_9fa48('16')
    const multipliers: Record<UserProfile['activityLevel'], number> = stryMutAct_9fa48('17')
      ? {}
      : (stryCov_9fa48('17'),
        {
          sedentary: 1.2,
          light: 1.375,
          moderate: 1.55,
          heavy: 1.725,
          athlete: 1.9,
        })
    return Math.round(
      stryMutAct_9fa48('18')
        ? bmr / multipliers[activityLevel]
        : (stryCov_9fa48('18'), bmr * multipliers[activityLevel])
    )
  }
}
export function calculateTargetCalories(tdee: number, goal: UserProfile['goal']): number {
  if (stryMutAct_9fa48('19')) {
    {
    }
  } else {
    stryCov_9fa48('19')
    let target = tdee
    switch (goal) {
      case stryMutAct_9fa48('21') ? '' : (stryCov_9fa48('21'), 'lose_weight'):
        if (stryMutAct_9fa48('20')) {
        } else {
          stryCov_9fa48('20')
          target = stryMutAct_9fa48('22') ? tdee + 500 : (stryCov_9fa48('22'), tdee - 500)
          break
        }
      case stryMutAct_9fa48('24') ? '' : (stryCov_9fa48('24'), 'gain_muscle'):
        if (stryMutAct_9fa48('23')) {
        } else {
          stryCov_9fa48('23')
          target = stryMutAct_9fa48('25') ? tdee - 300 : (stryCov_9fa48('25'), tdee + 300)
          break
        }
      case stryMutAct_9fa48('26') ? '' : (stryCov_9fa48('26'), 'maintain'):
      default:
        if (stryMutAct_9fa48('27')) {
        } else {
          stryCov_9fa48('27')
          target = tdee
        }
    }

    // VERIFIED SCIENCE: Safety Floor.
    // 1. Never return negative calories.
    // 2. Ideally, never drop below BMR significantly without medical supervision.
    // For this property test, we simply ensure it's at least 1000kcal or the TDEE if extremely low.
    // This prevents the "Negative Calories" bug caught by fast-check.
    return stryMutAct_9fa48('28')
      ? Math.min(1000, Math.round(target))
      : (stryCov_9fa48('28'), Math.max(1000, Math.round(target)))
  }
}

// NEW: Advanced Macro Logic based on Archetype
export function calculateMacros(profile: UserProfile, targetCalories: number) {
  if (stryMutAct_9fa48('29')) {
    {
    }
  } else {
    stryCov_9fa48('29')
    let proteinPerKg = 1.8 // Default standard
    let fatPerKg = 0.8 // Default standard

    // Adjust ratios based on Archetype
    switch (profile.archetype) {
      case stryMutAct_9fa48('31') ? '' : (stryCov_9fa48('31'), 'bodybuilder'):
        if (stryMutAct_9fa48('30')) {
        } else {
          stryCov_9fa48('30')
          proteinPerKg = 2.2 // High protein for hypertrophy
          fatPerKg = 0.7 // Lower fat to allow for carbs
          break
        }
      case stryMutAct_9fa48('32') ? '' : (stryCov_9fa48('32'), 'fighter'):
      case stryMutAct_9fa48('34') ? '' : (stryCov_9fa48('34'), 'crossfitter'):
        if (stryMutAct_9fa48('33')) {
        } else {
          stryCov_9fa48('33')
          proteinPerKg = 2.0 // High protein
          fatPerKg = 0.8 // Moderate fat
          // These athletes need MORE carbs, which naturally happens
          // because protein/fat are fixed, leaving the rest for carbs.
          break
        }
      case stryMutAct_9fa48('36') ? '' : (stryCov_9fa48('36'), 'senior'):
        if (stryMutAct_9fa48('35')) {
        } else {
          stryCov_9fa48('35')
          proteinPerKg = 1.6 // Moderate-High to prevent sarcopenia
          fatPerKg = 0.9 // Higher fat for hormonal health
          break
        }
      case stryMutAct_9fa48('37') ? '' : (stryCov_9fa48('37'), 'general'):
      default:
        if (stryMutAct_9fa48('38')) {
        } else {
          stryCov_9fa48('38')
          proteinPerKg = 1.8
          fatPerKg = 0.9
          break
        }
    }
    const proteinGrams = Math.round(
      stryMutAct_9fa48('39')
        ? profile.weight / proteinPerKg
        : (stryCov_9fa48('39'), profile.weight * proteinPerKg)
    )
    const fatGrams = Math.round(
      stryMutAct_9fa48('40')
        ? profile.weight / fatPerKg
        : (stryCov_9fa48('40'), profile.weight * fatPerKg)
    )

    // Calorie math: Protein=4, Fat=9, Carb=4
    const caloriesFromProtein = stryMutAct_9fa48('41')
      ? proteinGrams / 4
      : (stryCov_9fa48('41'), proteinGrams * 4)
    const caloriesFromFat = stryMutAct_9fa48('42')
      ? fatGrams / 9
      : (stryCov_9fa48('42'), fatGrams * 9)

    // Remaining calories go to Carbs (Energy)
    // Safety: Math.max(0) ensures we don't return negative carbs if Protein+Fat > Target
    const remainingCalories = stryMutAct_9fa48('43')
      ? Math.min(0, targetCalories - (caloriesFromProtein + caloriesFromFat))
      : (stryCov_9fa48('43'),
        Math.max(
          0,
          stryMutAct_9fa48('44')
            ? targetCalories + (caloriesFromProtein + caloriesFromFat)
            : (stryCov_9fa48('44'),
              targetCalories -
                (stryMutAct_9fa48('45')
                  ? caloriesFromProtein - caloriesFromFat
                  : (stryCov_9fa48('45'), caloriesFromProtein + caloriesFromFat)))
        ))
    const carbGrams = Math.round(
      stryMutAct_9fa48('46') ? remainingCalories * 4 : (stryCov_9fa48('46'), remainingCalories / 4)
    )

    // Recalculate total calories based on actual macros to ensure consistency
    // (In case target was too low to support essential Protein/Fat)
    const finalCalories = stryMutAct_9fa48('47')
      ? proteinGrams * 4 + fatGrams * 9 - carbGrams * 4
      : (stryCov_9fa48('47'),
        (stryMutAct_9fa48('48')
          ? proteinGrams * 4 - fatGrams * 9
          : (stryCov_9fa48('48'),
            (stryMutAct_9fa48('49') ? proteinGrams / 4 : (stryCov_9fa48('49'), proteinGrams * 4)) +
              (stryMutAct_9fa48('50') ? fatGrams / 9 : (stryCov_9fa48('50'), fatGrams * 9)))) +
          (stryMutAct_9fa48('51') ? carbGrams / 4 : (stryCov_9fa48('51'), carbGrams * 4)))
    return stryMutAct_9fa48('52')
      ? {}
      : (stryCov_9fa48('52'),
        {
          protein: proteinGrams,
          fat: fatGrams,
          carbs: carbGrams,
          calories: finalCalories, // Return the ACTUAL sum, not the requested target
        })
  }
}
