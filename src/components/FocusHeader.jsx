import { useNavigate } from 'react-router-dom'
import HeartsDisplay from './HeartsDisplay'
import ThemeToggle from './ThemeToggle'
import BrainPowerBadge from './BrainPowerBadge'

export default function FocusHeader({
  title,
  backLabel = '← Back',
  backPath,
  showHearts = false,
  hearts,
  maxHearts = 5,
}) {
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 md:px-6 min-h-[3.5rem]">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate(backPath || '/home')}
            className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 whitespace-nowrap transition-colors"
          >
            {backLabel}
          </button>
          {title && (
            <span className="hidden sm:inline text-sm text-gray-500 dark:text-gray-400 truncate">
              · {title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {showHearts && hearts !== undefined && (
            <HeartsDisplay hearts={hearts} maxHearts={maxHearts} />
          )}
          <ThemeToggle />
          <BrainPowerBadge />
        </div>
      </div>
    </header>
  )
}
