import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useProgress } from '../hooks/useProgress'
import { useSelectedLanguage } from '../contexts/LanguageContext'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import MobileTabBar from './MobileTabBar'
import MiniSemanticMap from './MiniSemanticMap'
import { getPageTitle, shouldShowSidebarPanel } from '../config/navigation'
import { useRouteLanguageSync } from '../hooks/useRouteLanguageSync'
import VocabularySidebarPanel from './VocabularySidebarPanel'
import { useLearningSync } from '../contexts/LearningSync'

const DAILY_GOAL = 20

function XPSidebarPanel() {
  const { progress } = useProgress()
  const { selectedCourseId } = useSelectedLanguage()
  const currentXP = progress.dailyXP || 0
  const totalXP = progress.totalXP || 0

  return (
    <aside className="hidden lg:block w-72 shrink-0">
      <div className="sticky top-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 pt-4 pb-3">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3 text-lg">XP Progress</h3>
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
    </aside>
  )
}

function SidebarPanel({ pathname }) {
  if (pathname === '/flashcards') {
    return <VocabularySidebarPanel />
  }
  return <XPSidebarPanel />
}

export default function AppShell() {
  const location = useLocation()
  useRouteLanguageSync()
  const title = getPageTitle(location.pathname)
  const showPanel = shouldShowSidebarPanel(location.pathname)
  const { status } = useLearningSync()
  const [importNotice, setImportNotice] = useState(false)

  useEffect(() => {
    if (status === 'imported') setImportNotice(true)
  }, [status])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-20 md:pb-0">
        <TopBar title={title} />
        {importNotice && (
          <div className="mx-4 mt-4 md:mx-6 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-3">
            <span>This device’s progress was copied into your account.</span>
            <button
              type="button"
              className="font-semibold"
              onClick={() => setImportNotice(false)}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex-1 flex gap-6 px-4 py-6 md:px-6 max-w-[1600px] mx-auto w-full">
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
          {showPanel && <SidebarPanel pathname={location.pathname} />}
        </div>
      </div>

      <MobileTabBar />
    </div>
  )
}
