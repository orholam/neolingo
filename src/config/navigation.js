import { getCourse } from '../data/courses'

export const PRIMARY_NAV = [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Home', icon: '🏠', path: '/home' },
  { id: 'lessons', label: 'Lessons', shortLabel: 'Lessons', icon: '💪', path: '/practice' },
  { id: 'vocabulary', label: 'Vocabulary', shortLabel: 'Words', icon: '📚', path: '/flashcards' },
  {
    id: 'brain',
    label: 'Brain',
    shortLabel: 'Brain',
    icon: '🧠',
    pathFn: (courseId) => `/brain/${courseId || 'dadjo'}`,
  },
]

export const SECONDARY_NAV = [
  {
    id: 'dictionary',
    label: 'Dictionary',
    icon: '📖',
    pathFn: (courseId) => getDictionaryPath(courseId),
  },
  { id: 'languages', label: 'Languages', icon: '🌐', path: '/languages' },
]

export const VOCAB_TABS = [
  { id: 'practice', label: 'Practice' },
  { id: 'mastered', label: 'Mastered' },
  { id: 'history', label: 'History' },
]

export function parseVocabularyTab(tab) {
  if (tab === 'mastered' || tab === 'history') return tab
  return 'practice'
}

export const PAGE_TITLES = {
  '/home': 'Dashboard',
  '/practice': 'Lessons',
  '/flashcards': 'Vocabulary',
  '/languages': 'Languages library',
  '/dictionary': 'Dictionary',
  '/sumerian-dictionary': 'Dictionary',
  '/korean-dictionary': 'Dictionary',
}

export const ROUTES_WITH_SIDEBAR_PANEL = new Set(['/practice', '/flashcards'])

export function getDictionaryPath(courseId) {
  return getCourse(courseId).dictRoute
}

export function resolveNavPath(item, courseId = 'dadjo') {
  if (item.pathFn) return item.pathFn(courseId)
  return item.path
}

export function isFocusRoute(pathname) {
  if (pathname.startsWith('/lesson')) return true
  if (pathname === '/flashcards/new') return true
  if (/^\/flashcards\/[^/]+$/.test(pathname) && pathname !== '/flashcards/new') return true
  return false
}

export function getActiveNavId(pathname) {
  if (pathname === '/home') return 'dashboard'
  if (pathname.startsWith('/practice')) return 'lessons'
  if (pathname.startsWith('/flashcards')) return 'vocabulary'
  if (
    pathname.startsWith('/brain') ||
    pathname.startsWith('/brain-map') ||
    pathname.startsWith('/memory-map')
  ) {
    return 'brain'
  }
  if (pathname.includes('dictionary')) return 'dictionary'
  if (pathname.startsWith('/languages')) return 'languages'
  return null
}

export function getPageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.startsWith('/memory-map/')) return 'Memory map'
  if (pathname.startsWith('/brain-map/')) return 'Semantic map'
  if (pathname.startsWith('/brain/')) return 'Digital brain'
  return 'NeoLingo'
}

export function shouldShowSidebarPanel(pathname) {
  return ROUTES_WITH_SIDEBAR_PANEL.has(pathname)
}

export function getFocusBackTarget(pathname, langId = 'dadjo') {
  if (pathname.startsWith('/lesson')) {
    return { path: '/practice', label: '← Back to Lessons' }
  }
  if (pathname === '/flashcards/new' || /^\/flashcards\/[^/]+$/.test(pathname)) {
    const tab = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('tab')
      : null
    const backPath = tab && tab !== 'practice' ? `/flashcards?tab=${tab}` : '/flashcards'
    return { path: backPath, label: '← Back to Vocabulary' }
  }
  return { path: '/home', label: '← Back to Dashboard' }
}

export function getFocusPageTitle(pathname, lessonName) {
  if (pathname.startsWith('/lesson')) return lessonName || 'Lesson'
  if (pathname === '/flashcards/new') return 'New flashcard session'
  if (/^\/flashcards\/[^/]+$/.test(pathname)) return 'Flashcard practice'
  return 'NeoLingo'
}
