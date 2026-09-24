import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStreak } from '../hooks/useStreak'
import { useGems } from '../hooks/useGems'
import { useLanguagePlan } from '../hooks/useLanguagePlan'
import { useLanguageSwitch } from '../hooks/useLanguageSwitch'
import HeartsDisplay from './HeartsDisplay'
import ThemeToggle from './ThemeToggle'

function Header({ 
  variant = 'main', // 'main' | 'simple'
  title,
  showHearts = false,
  hearts,
  maxHearts = 5,
  onBack,
  backLabel = '← Exit',
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { streak } = useStreak()
  const { gems } = useGems()
  const { enabledLanguages } = useLanguagePlan()
  const { selectedCourseId, switchLanguage, setSelectedCourseId } = useLanguageSwitch()
  const [hoveredLangId, setHoveredLangId] = useState(null)

  useEffect(() => {
    // Ensure selected course stays in sync with enabled languages
    if (!enabledLanguages.length) return
    const existsInPlan = enabledLanguages.some((lang) => lang.id === selectedCourseId)
    if (!existsInPlan) {
      setSelectedCourseId(enabledLanguages[0]?.id || 'dadjo')
    }
  }, [enabledLanguages, selectedCourseId, setSelectedCourseId])

  const primaryLangId = selectedCourseId || enabledLanguages[0]?.id || 'dadjo'

  const isBrainView = location.pathname.startsWith('/brain')
    || location.pathname.startsWith('/brain-map')
    || location.pathname.startsWith('/memory-map')

  const handleGoToLearning = () => {
    if (!location.pathname.startsWith('/home')) {
      navigate('/home')
    }
  }

  const handleGoToBrain = () => {
    navigate(`/brain/${primaryLangId}`)
  }

  const handleSelectLanguage = (langId) => {
    switchLanguage(langId)
    if (location.pathname.startsWith('/languages')) {
      navigate('/home')
    }
  }

  const renderBrandAndControls = () => (
    <div className="flex items-center space-x-6 relative">
      {/* Logo + name (matches Landing) */}
      <button
        onClick={() => navigate('/home')}
        className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
      >
        <span className="text-2xl">🦉</span>
        <span className="font-extrabold text-lg tracking-tight text-gray-900 dark:text-gray-50">
          Neo<span className="text-indigo-500">Lingo</span>
        </span>
      </button>

      {/* Chosen languages as circles */}
      <div className="hidden sm:flex items-center gap-3">
        {enabledLanguages.map((lang) => {
          const isHovered = hoveredLangId === lang.id
          const isActive = !location.pathname.startsWith('/languages') && lang.id === selectedCourseId
          return (
            <div key={lang.id} className="relative flex flex-col items-center">
              <button
                type="button"
                className={`w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-sm border hover:translate-y-0.5 transition-transform ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700'
                }`}
                onClick={() => handleSelectLanguage(lang.id)}
                onMouseEnter={() => setHoveredLangId(lang.id)}
                onMouseLeave={() => setHoveredLangId((current) => (current === lang.id ? null : current))}
              >
                <span className="leading-none">{lang.flag}</span>
              </button>
              {isHovered && (
                <div className="absolute left-1/2 -translate-x-1/2 top-11 mt-1 whitespace-nowrap px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs font-semibold shadow-lg">
                  {lang.name}
                </div>
              )}
            </div>
          )
        })}

        {/* Plus circle to go to language library */}
        <button
          type="button"
          onClick={() => navigate('/languages')}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold border transition-colors ${
            location.pathname.startsWith('/languages')
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-800'
          }`}
          title="Languages library"
        >
          +
        </button>

        {/* Toggle between Learning and Digital Brain */}
        <div className="ml-4 inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleGoToLearning}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
              !isBrainView
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 shadow-sm'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            Learning
          </button>
          <button
            type="button"
            onClick={handleGoToBrain}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors flex items-center gap-1 ${
              isBrainView
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 shadow-sm'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            <span className="text-sm">🧠</span>
            <span>Digital brain</span>
          </button>
        </div>
      </div>
    </div>
  )

  if (variant === 'main') {
    return (
      <header className="fixed top-0 inset-x-0 z-50 border-b border-gray-100 dark:border-gray-800/80 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {renderBrandAndControls()}

            <div className="flex items-center space-x-3">
              <ThemeToggle />
              {streak > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="text-2xl">🔥</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{streak}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <span className="text-2xl">🐏</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{gems}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-gray-100 dark:border-gray-800/80 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {renderBrandAndControls()}
            <button
              onClick={onBack || (() => navigate('/home'))}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm whitespace-nowrap"
            >
              {backLabel}
            </button>
          </div>
          <div className="flex items-center space-x-3 justify-end flex-1">
            {title && (
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{title}</div>
            )}
            {showHearts && hearts !== undefined && (
              <HeartsDisplay hearts={hearts} maxHearts={maxHearts} />
            )}
            <ThemeToggle />
            <div className="flex items-center space-x-1">
              <span className="text-xl">🐏</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">{gems}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
