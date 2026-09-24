import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function AuthModal({ open, onClose }) {
  const { signIn, signUp, authMode, setAuthMode, completeAuthRedirect } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const emailRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setError('')
    setNotice('')
    setBusy(false)
    const id = window.setTimeout(() => emailRef.current?.focus(), 50)
    return () => window.clearTimeout(id)
  }, [open, authMode])

  useEffect(() => {
    if (!open) return
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      if (authMode === 'signup') {
        const { data, error: signUpError } = await signUp(email.trim(), password)
        if (signUpError) throw signUpError
        if (!data.session) {
          setNotice('Check your email to confirm your account, then sign in. We’ll take you to your dashboard after that.')
          setAuthMode('signin')
          return
        }
        onClose()
        completeAuthRedirect()
        return
      }
      const { error: signInError } = await signIn(email.trim(), password)
      if (signInError) throw signInError
      onClose()
      completeAuthRedirect()
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        aria-label="Close sign in"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-md rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-7 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Close"
        >
          ×
        </button>
        <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-500 mb-2">
          {authMode === 'signup' ? 'Create account' : 'Welcome back'}
        </p>
        <h2 id="auth-modal-title" className="text-2xl font-black tracking-tight text-gray-900 dark:text-gray-50 mb-1 pr-8">
          {authMode === 'signup' ? 'Save your progress' : 'Sign in to continue'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
          {authMode === 'signup'
            ? 'After you create an account, we take you to your dashboard and can import progress already on this device.'
            : 'You’ll land on your learning dashboard. Streaks, flashcards, and mastered words stay on this account.'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Email</span>
            <input
              ref={emailRef}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Password</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
            />
          </label>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {notice && <p className="text-sm text-indigo-600 dark:text-indigo-400">{notice}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 disabled:opacity-60"
          >
            {busy ? 'Working…' : authMode === 'signup' ? 'Create account and continue' : 'Sign in to dashboard'}
          </button>
        </form>
        <button
          type="button"
          className="mt-4 w-full text-sm font-semibold text-indigo-600 dark:text-indigo-400"
          onClick={() => {
            setAuthMode(authMode === 'signup' ? 'signin' : 'signup')
            setError('')
            setNotice('')
          }}
        >
          {authMode === 'signup' ? 'Already have an account? Sign in' : 'Need an account? Create one'}
        </button>
      </div>
    </div>
  )
}
