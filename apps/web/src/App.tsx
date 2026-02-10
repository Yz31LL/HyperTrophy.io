import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginScreen } from './pages/auth/LoginScreen'
import { SignUpScreen } from './pages/auth/SignUpScreen'
import { useAuth } from './providers/AuthProvider'
import { Header } from '@repo/ui/Header'
import { Button } from '@repo/ui/Button'
import { auth } from './lib/firebase'

// A wrapper to protect routes that require login
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>

  // If not logged in, redirect to login page
  if (!user) return <Navigate to="/login" replace />

  return children
}

// A simple Dashboard for Phase 1
function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Header title="Dashboard" />
      <div className="text-center mt-8 space-y-4">
        <p className="text-xl">
          Welcome back, <strong>{user?.displayName || user?.email}</strong>!
        </p>
        <p className="text-muted-foreground">User ID: {user?.uid}</p>

        <Button variant="destructive" onClick={() => auth.signOut()}>
          Sign Out
        </Button>
      </div>
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignUpScreen />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
