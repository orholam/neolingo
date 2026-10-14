import { useCallback, useSyncExternalStore } from 'react'
import {
  LANGUAGES,
  getDefaultLanguagePlan,
  normalizeLanguagePlan,
} from '../data/languages'

const STORAGE_KEY = 'languagePlan'

function readPlan() {
  if (typeof window === 'undefined') return getDefaultLanguagePlan()

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return getDefaultLanguagePlan()
    return normalizeLanguagePlan(JSON.parse(stored))
  } catch {
    return getDefaultLanguagePlan()
  }
}

let plan = readPlan()
const listeners = new Set()

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return plan
}

function getServerSnapshot() {
  return getDefaultLanguagePlan()
}

function commitPlan(next) {
  plan = next
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan))
    }
  } catch {
    // Ignore storage errors
  }
  for (const listener of listeners) listener()
}

export function useLanguagePlan() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggleLanguage = useCallback((id) => {
    const next = plan.includes(id) ? plan.filter((langId) => langId !== id) : [...plan, id]
    commitPlan(next.length > 0 ? next : plan)
  }, [])

  const isInPlan = (id) => current.includes(id)
  const enabledLanguages = LANGUAGES.filter((lang) => current.includes(lang.id))

  return {
    plan: current,
    toggleLanguage,
    isInPlan,
    enabledLanguages,
    allLanguages: LANGUAGES,
  }
}
