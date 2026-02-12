import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { OnboardingScreen } from './pages/onboarding/OnboardingScreen'
import { LoginScreen } from './pages/auth/LoginScreen'
import { SignUpScreen } from './pages/auth/SignUpScreen'
import { DashboardScreen } from './pages/dashboard/DashboardScreen'
import { useAuth } from './providers/AuthProvider'
import { WorkoutSession } from './pages/workout/WorkoutSession'

// A wrapper to protect routes that require login
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>

  // If not logged in, redirect to login page
  if (!user) return <Navigate to="/login" replace />

  return children
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignUpScreen />} />

        {/* NEW: Onboarding Route (Protected) */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workout"
          element={
            <ProtectedRoute>
              <WorkoutSession />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardScreen />
            </ProtectedRoute>
          }
        />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
