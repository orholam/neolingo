import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLearningSync } from '../contexts/LearningSync'

export default function AccountMenu() {
  const { enabled, loading, user, openAuth, signOut } = useAuth()
  const { status } = useLearningSync()
  const location = useLocation()
  const navigate = useNavigate()

  if (!enabled) return null

  if (loading) {
    return (
      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">Account…</span>
    )
  }

  const onLanding = location.pathname === '/'
  const brandBtn =
    'rounded-xl bg-duo-green hover:bg-duo-green-dark px-3 py-1.5 text-sm font-extrabold text-white'

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => openAuth({ mode: 'signin', redirectTo: '/home' })}
          className="rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => openAuth({ mode: 'signup', redirectTo: '/home' })}
          className={brandBtn}
        >
          Create account
        </button>
      </div>
    )
  }

  const syncLabel =
    status === 'imported' ? 'Imported' : status === 'error' ? 'Sync issue' : 'Saved'

  return (
    <div className="flex items-center gap-2">
      {onLanding && (
        <button
          type="button"
          onClick={() => navigate('/home')}
          className={brandBtn}
        >
          Dashboard
        </button>
      )}
      <span className="hidden sm:inline max-w-[140px] truncate text-xs font-semibold text-gray-500 dark:text-gray-400">
        {user.email}
      </span>
      <span className="hidden md:inline text-[10px] uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400">
        {syncLabel}
      </span>
      <button
        type="button"
        onClick={signOut}
        className="rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        Sign out
      </button>
    </div>
  )
}
