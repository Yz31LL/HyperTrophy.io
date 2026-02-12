import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// ============================================================================
// CONFIGURATION
// ============================================================================
const PROJECT_ID = 'hypertrophy-io-dev' // Match your emulator config
const IS_EMULATOR = process.env.FIRESTORE_EMULATOR_HOST !== undefined

if (!IS_EMULATOR) {
  console.error('⚠️  DANGER: You are not connected to the Firestore Emulator!')
  console.error('Please set FIRESTORE_EMULATOR_HOST before running this script.')
  process.exit(1)
}

// Initialize Admin SDK
const app = initializeApp({ projectId: PROJECT_ID })
const db = getFirestore(app)

console.log(`🌱 Seeding database for project: ${PROJECT_ID}`)

// ============================================================================
// DATA GENERATORS
// ============================================================================

const seedUsers = async () => {
  console.log('... Seeding Users')

  // 1. Standard Trainee
  const traineeRef = db.collection('users').doc('test-trainee')
  await traineeRef.set({
    uid: 'test-trainee',
    email: 'trainee@example.com',
    displayName: 'Tyler Trainee',
    role: 'trainee',
    createdAt: new Date().toISOString(),
  })

  // Private Profile (Sub-collection)
  await traineeRef.collection('private_profile').doc('main').set({
    gender: 'male',
    age: 28,
    height: 180, // cm
    weight: 80, // kg
    activityLevel: 'moderate',
    goal: 'gain_muscle',
    archetype: 'general',
    dietaryPreference: 'standard',
    updatedAt: new Date().toISOString(),
  })

  // 2. Bodybuilder (for macro testing)
  const bodybuilderRef = db.collection('users').doc('test-bodybuilder')
  await bodybuilderRef.set({
    uid: 'test-bodybuilder',
    email: 'ronnie@example.com',
    displayName: 'Ronnie Coleman',
    role: 'trainee',
    createdAt: new Date().toISOString(),
  })

  await bodybuilderRef.collection('private_profile').doc('main').set({
    gender: 'male',
    age: 35,
    height: 185,
    weight: 120,
    activityLevel: 'heavy',
    goal: 'gain_muscle',
    archetype: 'bodybuilder', // Triggers high protein logic
    dietaryPreference: 'standard',
    updatedAt: new Date().toISOString(),
  })
}

const seedLogs = async () => {
  console.log('... Seeding Daily Logs')

  // Create a log for "Today" for the trainee
  const today = new Date().toISOString().split('T')[0]
  const logId = `test-trainee_${today}`

  await db
    .collection('daily_logs')
    .doc(logId)
    .set({
      userId: 'test-trainee',
      date: today,
      caloriesConsumed: 1250,
      macros: {
        protein: 110,
        fat: 40,
        carbs: 120,
        water: 1500, // ml
      },
      workouts: [
        {
          exerciseId: 'bench-press',
          name: 'Bench Press',
          sets: [
            { weight: 100, reps: 10, rpe: 8 },
            { weight: 100, reps: 8, rpe: 9 },
          ],
        },
      ],
      notes: 'Feeling strong today!',
    })
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
async function main() {
  try {
    await seedUsers()
    await seedLogs()
    console.log('✅ Database seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

main()
