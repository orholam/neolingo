import { useStreak } from '../hooks/useStreak'
import { useGems } from '../hooks/useGems'
import ThemeToggle from './ThemeToggle'
import AccountMenu from './AccountMenu'

export default function TopBar({ title }) {
  const { streak } = useStreak()
  const { gems } = useGems()

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-50 truncate md:text-xl">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <ThemeToggle />
          {streak > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xl">🔥</span>
              <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">{streak}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="text-xl">💎</span>
            <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">{gems}</span>
          </div>
          <AccountMenu />
        </div>
      </div>
    </header>
  )
}
