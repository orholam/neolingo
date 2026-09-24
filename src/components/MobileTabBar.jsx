import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useSelectedLanguage } from '../contexts/LanguageContext'
import {
  PRIMARY_NAV,
  SECONDARY_NAV,
  getActiveNavId,
  resolveNavPath,
} from '../config/navigation'

function tabClass(isActive) {
  return `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 min-w-0 transition-colors ${
    isActive
      ? 'text-indigo-600 dark:text-indigo-400'
      : 'text-gray-500 dark:text-gray-400'
  }`
}

export default function MobileTabBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { selectedCourseId } = useSelectedLanguage()
  const [moreOpen, setMoreOpen] = useState(false)
  const activeId = getActiveNavId(location.pathname)
  const moreActive = ['dictionary', 'languages'].includes(activeId)

  return (
    <>
      {moreOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMoreOpen(false)}
          aria-hidden="true"
        />
      )}

      {moreOpen && (
        <div className="md:hidden fixed bottom-[4.5rem] inset-x-3 z-50 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">More</p>
          </div>
          <div className="p-2 space-y-1">
            {SECONDARY_NAV.map((item) => {
              const to = resolveNavPath(item, selectedCourseId)
              const isActive = activeId === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setMoreOpen(false)
                    navigate(to)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-left transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-stretch h-16 px-1">
          {PRIMARY_NAV.map((item) => {
            const to = resolveNavPath(item, selectedCourseId)
            const isActive = activeId === item.id
            return (
              <NavLink key={item.id} to={to} className={tabClass(isActive)}>
                <span className="text-xl leading-none">{item.icon}</span>
                <span className="text-[10px] font-semibold truncate max-w-full px-1">
                  {item.shortLabel}
                </span>
              </NavLink>
            )
          })}
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className={tabClass(moreActive || moreOpen)}
          >
            <span className="text-xl leading-none">⋯</span>
            <span className="text-[10px] font-semibold">More</span>
          </button>
        </div>
      </nav>
    </>
  )
}
