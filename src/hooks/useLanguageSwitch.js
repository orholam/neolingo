import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelectedLanguage } from '../contexts/LanguageContext'
import { getDictionaryPath } from '../config/navigation'
import { getCourse } from '../data/courses'

/**
 * Single entry point for changing the active language.
 * Updates global context/localStorage and keeps language-scoped routes in sync.
 */
export function useLanguageSwitch() {
  const navigate = useNavigate()
  const location = useLocation()
  const { selectedCourseId, setSelectedCourseId } = useSelectedLanguage()

  const switchLanguage = useCallback(
    (courseId) => {
      if (!courseId || courseId === selectedCourseId) return

      setSelectedCourseId(courseId)

      const path = location.pathname
      const search = location.search

      if (path.startsWith('/memory-map/')) {
        navigate(`/memory-map/${courseId}`, { replace: true })
        return
      }
      if (path.startsWith('/brain-map/')) {
        navigate(`/brain-map/${courseId}`, { replace: true })
        return
      }
      if (path.startsWith('/brain/')) {
        navigate(`/brain/${courseId}`, { replace: true })
        return
      }
      if (path.includes('dictionary')) {
        navigate(getDictionaryPath(courseId), { replace: true })
        return
      }
      if (path === '/flashcards/new') {
        navigate(`/flashcards/new${search}`, { replace: true })
        return
      }
      if (/^\/flashcards\/[^/]+$/.test(path) && path !== '/flashcards/new') {
        navigate('/flashcards?tab=history', { replace: true })
        return
      }
      if (path.startsWith('/lesson')) {
        navigate('/practice', { replace: true })
      }
    },
    [location.pathname, location.search, navigate, selectedCourseId, setSelectedCourseId]
  )

  const course = getCourse(selectedCourseId)

  return { selectedCourseId, course, switchLanguage, setSelectedCourseId }
}

export function useSelectedCourse() {
  const { selectedCourseId } = useSelectedLanguage()
  return getCourse(selectedCourseId)
}
