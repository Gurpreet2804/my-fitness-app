'use client' // tells Next.js this file runs in the browser
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Page() {
  // ---------------- STATE ----------------
  const router = useRouter()
  const [user, setUser] = useState<any>(null)       // stores the logged-in user
  const [email, setEmail] = useState('')            // email input value
  const [password, setPassword] = useState('')      // password input value
  const [message, setMessage] = useState('')        // status message for feedback
  const [loading, setLoading] = useState(false)

  // ---------------- EFFECT ----------------
  // runs when the page first loads to check if a user is already logged in
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) console.error(error)
      setUser(data.session?.user ?? null)
      if (data.session?.user) {
        router.push('/dashboard')
      }
    }
    getUser()
  }, [router])

  // ---------------- HANDLERS ----------------
  // Signup new user with email + password
  const handleSignup = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setMessage(error.message)
    else setMessage('✅ Check your email for a confirmation link!')
    setLoading(false)
  }

  // Login existing user
  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
    else {
      setMessage('✅ Logged in!')
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  const handleForgotPassword = async () => {
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/profile/edit`,
    })
    if (error) setMessage(error.message)
    else setMessage('📧 Password reset email sent.')
    setLoading(false)
  }

  const handleLoginWithGoogle = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) {
      setMessage(error.message)
      setLoading(false)
    }
  }

  // Logout current user
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // ---------------- RENDER ----------------
  // If user is logged in → show welcome + logout button
  if (user) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">Welcome, {user.email}</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    )
  }

  // Otherwise → show signup/login form
  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Sign Up / Login</h1>

      {/* Email input */}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 mb-2 w-full rounded"
      />

      {/* Password input */}
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 mb-2 w-full rounded"
      />

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSignup}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          {loading ? 'Working…' : 'Sign Up'}
        </button>
        <button
          onClick={handleLogin}
          className="bg-green-500 text-white px-4 py-2 rounded w-full"
        >
          {loading ? 'Working…' : 'Login'}
        </button>
      </div>

      <button
        onClick={handleForgotPassword}
        className="mt-2 underline text-sm"
        disabled={loading || !email}
      >
        Forgot password?
      </button>

      <div className="mt-4">
        <button
          onClick={handleLoginWithGoogle}
          className="bg-red-500 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          Continue with Google
        </button>
      </div>

      {/* Status message */}
      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  )
}
