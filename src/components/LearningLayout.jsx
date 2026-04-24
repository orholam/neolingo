import { Outlet, NavLink } from 'react-router-dom'
import { useProgress } from '../hooks/useProgress'
import { useSelectedLanguage } from '../contexts/LanguageContext'
import Header from './Header'
import MiniSemanticMap from './MiniSemanticMap'

const DAILY_GOAL = 20

export default function LearningLayout() {
  const { progress } = useProgress()
  const { selectedCourseId } = useSelectedLanguage()

  const currentXP = progress.dailyXP || 0
  const totalXP = progress.totalXP || 0

  const tabClass = ({ isActive }) =>
    `px-4 py-1.5 text-sm font-semibold rounded-full transition-colors flex items-center gap-1.5 ${
      isActive
        ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 shadow-sm'
        : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
    }`

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header variant="main" />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-8 flex gap-6">
        {/* Left: tab bar + page content */}
        <div className="flex-1 min-w-0">
          {/* Section tabs */}
          <div className="mb-6 inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700">
            <NavLink to="/practice" end className={tabClass}>
              <span>💪</span>
              <span>Practice</span>
            </NavLink>
            <NavLink to="/flashcards" end className={tabClass}>
              <span>📚</span>
              <span>Vocabulary</span>
            </NavLink>
          </div>

          {/* Child page renders here */}
          <Outlet />
        </div>

        {/* Right sidebar — stays mounted, never reloads between tabs */}
        <div className="w-80 shrink-0 hidden md:block">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden sticky top-20 shadow-sm">
            <div className="px-4 pt-4 pb-3">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3 text-lg">
                XP Progress
              </h3>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">📦</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">Daily Goal</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                <div
                  className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((currentXP / DAILY_GOAL) * 100, 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {currentXP} / {DAILY_GOAL} XP
              </p>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total XP</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{totalXP}</p>
              </div>
            </div>

            <MiniSemanticMap courseId={selectedCourseId} />
          </div>
        </div>
      </div>
    </div>
  )
}
