// @ts-nocheck
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './style.css'
import { QueryProvider } from './providers/QueryProvider'
import { AuthProvider } from './providers/AuthProvider'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <QueryProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryProvider>
  </StrictMode>
)
