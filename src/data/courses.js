import { dadjoDictionary } from './dadjoDictionary'
import { sumerianDictionary } from './sumerianDictionary'
import { koreanDictionary } from './koreanDictionary'

export const COURSES = {
  dadjo: {
    id: 'dadjo',
    label: 'Dadjo',
    emoji: '🐏',
    languageId: 'Dadjo',
    dictionary: dadjoDictionary,
    dictRoute: '/dictionary',
    accent: '#f59e0b',
    accentDim: '#78350f',
    embeddingsPath: () => import('./dadjoEmbeddings.json'),
  },
  sumerian: {
    id: 'sumerian',
    label: 'Ancient Sumerian',
    emoji: '𒀭',
    languageId: 'Sumerian',
    dictionary: sumerianDictionary,
    dictRoute: '/sumerian-dictionary',
    accent: '#a78bfa',
    accentDim: '#4c1d95',
    embeddingsPath: () => import('./sumerianEmbeddings.json'),
  },
  korean: {
    id: 'korean',
    label: 'Korean',
    emoji: '🇰🇷',
    languageId: 'Korean',
    dictionary: koreanDictionary,
    dictRoute: '/korean-dictionary',
    accent: '#ef4444',
    accentDim: '#7f1d1d',
    embeddingsPath: () => import('./koreanEmbeddings.json'),
  },
}

export function getCourse(id) {
  return COURSES[id] || COURSES.dadjo
}

export function getSelectedCourse() {
  if (typeof localStorage === 'undefined') return COURSES.dadjo
  const stored = localStorage.getItem('selectedCourse') || 'dadjo'
  return COURSES[stored] || COURSES.dadjo
}

export function getLanguageId(courseId) {
  return getCourse(courseId).languageId
}
