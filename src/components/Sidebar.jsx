import { useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useLanguagePlan } from '../hooks/useLanguagePlan'
import { useLanguageSwitch } from '../hooks/useLanguageSwitch'
import { getCourse } from '../data/courses'
import {
  PRIMARY_NAV,
  SECONDARY_NAV,
  getActiveNavId,
  resolveNavPath,
} from '../config/navigation'

function navLinkClass(isActive) {
  return `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
    isActive
      ? 'bg-indigo-600 text-white shadow-sm'
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
  }`
}

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { enabledLanguages } = useLanguagePlan()
  const { selectedCourseId, switchLanguage, setSelectedCourseId } = useLanguageSwitch()
  const activeId = getActiveNavId(location.pathname)
  const course = getCourse(selectedCourseId)

  useEffect(() => {
    if (!enabledLanguages.length) return
    const existsInPlan = enabledLanguages.some((lang) => lang.id === selectedCourseId)
    if (!existsInPlan) {
      setSelectedCourseId(enabledLanguages[0]?.id || 'dadjo')
    }
  }, [enabledLanguages, selectedCourseId, setSelectedCourseId])

  return (
    <aside className="hidden md:flex md:flex-col md:w-60 lg:w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 h-[calc(100vh-0px)] sticky top-0">
      <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-800">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
        >
          <span className="text-2xl">🦉</span>
          <span className="font-extrabold text-lg tracking-tight text-gray-900 dark:text-gray-50">
            Neo<span className="text-indigo-500">Lingo</span>
          </span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Learn
        </p>
        {PRIMARY_NAV.map((item) => {
          const to = resolveNavPath(item, selectedCourseId)
          const isActive = activeId === item.id
          return (
            <NavLink key={item.id} to={to} className={() => navLinkClass(isActive)}>
              <span className="text-lg leading-none w-6 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          )
        })}

        <p className="px-3 mt-6 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Resources
        </p>
        {SECONDARY_NAV.map((item) => {
          const to = resolveNavPath(item, selectedCourseId)
          const isActive = activeId === item.id
          return (
            <NavLink key={item.id} to={to} className={() => navLinkClass(isActive)}>
              <span className="text-lg leading-none w-6 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Current language
        </p>
        <div className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{course.emoji}</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {course.label}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {enabledLanguages.map((lang) => (
              <button
                key={lang.id}
                type="button"
                title={lang.name}
                onClick={() => switchLanguage(lang.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-base border transition-colors ${
                  lang.id === selectedCourseId
                    ? 'bg-indigo-600 border-indigo-600 shadow-sm'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                }`}
              >
                {lang.flag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
