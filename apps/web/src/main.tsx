import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './style.css'
import { QueryProvider } from './providers/QueryProvider'
import { AuthProvider } from './providers/AuthProvider'
import posthog, { type PostHogInterface } from 'posthog-js'

// Initialize PostHog
if (typeof window !== 'undefined') {
  const posthogKey = import.meta.env.VITE_POSTHOG_KEY
  const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com'

  if (posthogKey) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      loaded: (ph: PostHogInterface) => {
        if (import.meta.env.DEV) ph.debug()
      },
    })
  }
}

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <QueryProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryProvider>
  </StrictMode>
)
