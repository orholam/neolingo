import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useSelectedLanguage } from '../contexts/LanguageContext'
import { COURSES } from '../data/courses'

/** Keep LanguageContext aligned with language-scoped routes (brain, dictionary). */
export function useRouteLanguageSync() {
  const location = useLocation()
  const { selectedCourseId, setSelectedCourseId } = useSelectedLanguage()

  useEffect(() => {
    const path = location.pathname
    let routeCourseId = null

    if (
      path.startsWith('/memory-map/') ||
      path.startsWith('/brain-map/') ||
      path.startsWith('/brain/')
    ) {
      routeCourseId = path.split('/')[2]
    } else if (path === '/dictionary') {
      routeCourseId = 'dadjo'
    } else if (path === '/sumerian-dictionary') {
      routeCourseId = 'sumerian'
    } else if (path === '/korean-dictionary') {
      routeCourseId = 'korean'
    }

    if (routeCourseId && COURSES[routeCourseId] && routeCourseId !== selectedCourseId) {
      setSelectedCourseId(routeCourseId)
    }
  }, [location.pathname, selectedCourseId, setSelectedCourseId])
}
