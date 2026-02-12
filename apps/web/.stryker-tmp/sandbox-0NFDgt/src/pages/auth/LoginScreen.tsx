// @ts-nocheck
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../../lib/firebase'
import { AuthLayout } from '../../components/layouts/AuthLayout'
import { Button } from '@repo/ui/Button'
import { AlertCircle, Loader2 } from 'lucide-react'

// Validation Schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginScreen() {
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password)
      navigate('/dashboard') // Redirect to dashboard on success
    } catch (err) {
      console.error(err)
      const error = err as { code?: string }
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        setError('Invalid email or password.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <AuthLayout title="Welcome Back" description="Enter your credentials to access your account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            placeholder="m@example.com"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
          </div>
          <input
            {...register('password')}
            id="password"
            type="password"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md flex items-center gap-2 border border-red-200">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>

        {/* Sign Up Link */}
        <div className="text-center text-sm mt-4">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="underline hover:text-blue-600">
            Sign up
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
