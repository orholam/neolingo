import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { clearLocalSnapshot } from '../lib/learningState'
import { prepareLearningLogout } from '../lib/learningSyncBridge'
import AuthModal from '../components/AuthModal'

const AuthContext = createContext(null)
export const POST_AUTH_HOME_KEY = 'neolingoGoHome'

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('signin')
  const [redirectTo, setRedirectTo] = useState('/home')

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let cancelled = false
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
    })

    return () => {
      cancelled = true
      data.subscription.unsubscribe()
    }
  }, [])

  const openAuth = useCallback((options = {}) => {
    setAuthMode(options.mode === 'signup' ? 'signup' : 'signin')
    const fallback = location.pathname === '/' ? '/home' : null
    setRedirectTo(options.redirectTo === undefined ? fallback : options.redirectTo)
    setAuthOpen(true)
  }, [location.pathname])

  const closeAuth = useCallback(() => setAuthOpen(false), [])

  const completeAuthRedirect = useCallback(() => {
    // Always land on the dashboard after an explicit sign-in / sign-up.
    const dest = redirectTo || '/home'
    try {
      sessionStorage.setItem(POST_AUTH_HOME_KEY, dest)
    } catch {
      // ignore
    }
    // Hard navigation so a LearningSync hydrate reload cannot cancel a soft route change.
    window.location.assign(dest)
  }, [redirectTo])

  const signUp = useCallback(async (email, password) => {
    if (!supabase) return { data: null, error: new Error('Supabase is not configured') }
    return supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/home` },
    })
  }, [])

  const signIn = useCallback(async (email, password) => {
    if (!supabase) return { data: null, error: new Error('Supabase is not configured') }
    return supabase.auth.signInWithPassword({ email, password })
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    try {
      sessionStorage.removeItem(POST_AUTH_HOME_KEY)
    } catch {
      // ignore
    }
    // Flush cloud while the session is still valid, then wipe local progress
    // so a logged-out browser does not keep showing the account's lessons.
    await prepareLearningLogout()
    await supabase.auth.signOut()
    clearLocalSnapshot()
    window.location.assign('/')
  }, [])

  const value = useMemo(
    () => ({
      enabled: isSupabaseConfigured,
      loading,
      session,
      user,
      authMode,
      setAuthMode,
      openAuth,
      closeAuth,
      completeAuthRedirect,
      signUp,
      signIn,
      signOut,
    }),
    [
      loading,
      session,
      user,
      authMode,
      openAuth,
      closeAuth,
      completeAuthRedirect,
      signUp,
      signIn,
      signOut,
    ],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal open={authOpen} onClose={closeAuth} />
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function usePostAuthRedirect() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (loading || !user) return
    let next = null
    try {
      next = sessionStorage.getItem(POST_AUTH_HOME_KEY)
    } catch {
      return
    }
    if (!next) return
    try {
      sessionStorage.removeItem(POST_AUTH_HOME_KEY)
    } catch {
      // ignore
    }
    if (location.pathname !== next) navigate(next, { replace: true })
  }, [user, loading, location.pathname, navigate])
}
