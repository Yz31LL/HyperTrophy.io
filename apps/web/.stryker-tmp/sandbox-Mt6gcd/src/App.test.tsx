// @ts-nocheck
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from './App'

// Mock the Auth Context
// We simulate a user who is NOT logged in
vi.mock('./providers/AuthProvider', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock the Firebase imports so we don't try to connect during tests
vi.mock('./lib/firebase', () => ({
  auth: {},
  db: {},
}))

describe('App Routing', () => {
  it('redirects to login screen by default', () => {
    render(<App />)

    // Check if the Login Screen title is visible
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()

    // Check if the Sign In button is present
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders the sign up link', () => {
    render(<App />)
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument()
  })
})
