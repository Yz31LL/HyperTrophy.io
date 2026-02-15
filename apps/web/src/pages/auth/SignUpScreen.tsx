import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { doc, setDoc, serverTimestamp, query, where, getDocs, collection } from 'firebase/firestore'
import { db, auth } from '../../lib/firebase'
import { AuthLayout } from '../../components/layouts/AuthLayout'
import { Button } from '@repo/ui/Button'
import { AlertCircle, Loader2, GraduationCap, UserCircle } from 'lucide-react'

const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

// Validation Schema
const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    role: z.enum(['trainer', 'trainee'], {
      required_error: 'Please select a role',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type SignUpForm = z.infer<typeof signupSchema>

export function SignUpScreen() {
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const referralCode = searchParams.get('invite')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: referralCode ? 'trainee' : 'trainee',
    },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: SignUpForm) => {
    setError(null)
    try {
      let resolvedTrainerId: string | null = null

      // Resolve trainer from invite code if present
      if (referralCode) {
        const trainersQuery = query(
          collection(db, 'users'),
          where('inviteCode', '==', referralCode.toUpperCase())
        )
        const trainerSnapshot = await getDocs(trainersQuery)
        if (!trainerSnapshot.empty) {
          resolvedTrainerId = trainerSnapshot.docs[0].id
        }
      }

      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)

      // 2. Update their Display Name and save role to Firestore
      if (userCredential.user) {
        const uid = userCredential.user.uid
        await updateProfile(userCredential.user, {
          displayName: data.name,
        })

        // Save to Firestore
        await setDoc(doc(db, 'users', uid), {
          uid,
          email: data.email,
          displayName: data.name,
          role: data.role,
          trainerId: data.role === 'trainee' ? resolvedTrainerId : null,
          inviteCode: generateInviteCode(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }

      if (data.role === 'trainer') {
        navigate('/trainer-onboarding')
      } else {
        navigate('/onboarding')
      }
    } catch (err) {
      console.error(err)
      const error = err as { code?: string }
      if (error.code === 'auth/email-already-in-use') {
        setError('That email is already taken.')
      } else {
        setError('Failed to create account. Please try again.')
      }
    }
  }

  return (
    <AuthLayout title="Create an Account" description="Enter your details to get started">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Select Your Path</label>
          <div className="grid grid-cols-2 gap-4">
            <label className="cursor-pointer group">
              <input {...register('role')} type="radio" value="trainee" className="sr-only peer" />
              <div className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/80 peer-checked:border-yellow-500 peer-checked:bg-yellow-500/10 transition-all">
                <UserCircle
                  className={`h-8 w-8 mb-2 ${selectedRole === 'trainee' ? 'text-yellow-500' : 'text-zinc-500'}`}
                />
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${selectedRole === 'trainee' ? 'text-yellow-500' : 'text-zinc-400'}`}
                >
                  Trainee
                </span>
                <span className="text-[10px] text-zinc-600 mt-1">Start Training</span>
              </div>
            </label>

            <label className="cursor-pointer group">
              <input {...register('role')} type="radio" value="trainer" className="sr-only peer" />
              <div className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/80 peer-checked:border-yellow-500 peer-checked:bg-yellow-500/10 transition-all">
                <GraduationCap
                  className={`h-8 w-8 mb-2 ${selectedRole === 'trainer' ? 'text-yellow-500' : 'text-zinc-500'}`}
                />
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${selectedRole === 'trainer' ? 'text-yellow-500' : 'text-zinc-400'}`}
                >
                  Trainer
                </span>
                <span className="text-[10px] text-zinc-600 mt-1">Coach Others</span>
              </div>
            </label>
          </div>
          {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
        </div>

        {/* Name Field */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Full Name
          </label>
          <input
            {...register('name')}
            id="name"
            type="text"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            autoComplete="off"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            {...register('password')}
            id="password"
            type="password"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </label>
          <input
            {...register('confirmPassword')}
            id="confirmPassword"
            type="password"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md flex items-center gap-2 border border-red-200">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create Account
        </Button>

        <div className="text-center text-sm mt-4">
          Already have an account?{' '}
          <Link to="/login" className="underline hover:text-blue-600">
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
