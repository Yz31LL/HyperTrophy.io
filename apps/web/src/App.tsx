import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { OnboardingScreen } from './pages/onboarding/OnboardingScreen'
import { TrainerOnboarding } from './pages/onboarding/TrainerOnboarding'
import { LoginScreen } from './pages/auth/LoginScreen'
import { SignUpScreen } from './pages/auth/SignUpScreen'
import { DashboardScreen } from './pages/dashboard/DashboardScreen'
import { TrainerDashboard } from './pages/dashboard/TrainerDashboard'
import { useAuth } from './providers/AuthProvider'
import { WorkoutSession } from './pages/workout/WorkoutSession'
import { HistoryScreen } from './pages/dashboard/HistoryScreen'

import { LoadingScreen } from './components/ui/LoadingScreen'

import { useUserRole } from './hooks/useUserRole'
import { TraineeDetailScreen } from './pages/dashboard/TraineeDetailScreen'
import { TrainerExerciseLibrary } from './pages/dashboard/TrainerExerciseLibrary'
import { LeaderboardScreen } from './pages/dashboard/LeaderboardScreen'
import { CalendarScreen } from './pages/dashboard/CalendarScreen'

// A wrapper to protect routes that require login
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: JSX.Element
  allowedRoles?: ('trainer' | 'trainee')[]
}) {
  const { user, loading: authLoading } = useAuth()
  const { role, loading: roleLoading } = useUserRole()

  if (authLoading || (user && roleLoading)) {
    return <LoadingScreen message="Establishing Connection" />
  }

  // If not logged in, redirect to login page
  if (!user) return <Navigate to="/login" replace />

  // If logged in but role doesn't match
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to={role === 'trainer' ? '/trainer-dashboard' : '/dashboard'} replace />
  }

  return children
}

export function App() {
  const { user } = useAuth()
  const { role, loading } = useUserRole()

  // Base redirect logic for home page
  const getHomeRedirect = () => {
    if (loading) return <LoadingScreen message="Identifying User" />
    if (!user) return <Navigate to="/login" replace />
    return <Navigate to={role === 'trainer' ? '/trainer-dashboard' : '/dashboard'} replace />
  }
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignUpScreen />} />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute allowedRoles={['trainee']}>
              <OnboardingScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer-onboarding"
          element={
            <ProtectedRoute allowedRoles={['trainer']}>
              <TrainerOnboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workout"
          element={
            <ProtectedRoute allowedRoles={['trainee']}>
              <WorkoutSession />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['trainee']}>
              <DashboardScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer-dashboard"
          element={
            <ProtectedRoute allowedRoles={['trainer']}>
              <TrainerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainee-view/:uid"
          element={
            <ProtectedRoute allowedRoles={['trainer']}>
              <TraineeDetailScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer-library"
          element={
            <ProtectedRoute allowedRoles={['trainer']}>
              <TrainerExerciseLibrary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute allowedRoles={['trainee']}>
              <HistoryScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute allowedRoles={['trainee']}>
              <LeaderboardScreen />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarScreen />
            </ProtectedRoute>
          }
        />
        {/* Default Redirect */}
        <Route path="/" element={getHomeRedirect()} />
      </Routes>
    </BrowserRouter>
  )
}
