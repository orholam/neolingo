import { useEffect, useState } from 'react'
import {
  LANGUAGES,
  getDefaultLanguagePlan,
  normalizeLanguagePlan,
} from '../data/languages'

const STORAGE_KEY = 'languagePlan'

export function useLanguagePlan() {
  const [plan, setPlan] = useState(() => {
    if (typeof window === 'undefined') {
      return getDefaultLanguagePlan()
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (!stored) return getDefaultLanguagePlan()
      const parsed = JSON.parse(stored)
      return normalizeLanguagePlan(parsed)
    } catch {
      return getDefaultLanguagePlan()
    }
  })

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan))
      }
    } catch {
      // Ignore storage errors
    }
  }, [plan])

  const toggleLanguage = (id) => {
    setPlan((current) => {
      if (current.includes(id)) {
        return current.filter((langId) => langId !== id)
      }
      return [...current, id]
    })
  }

  const isInPlan = (id) => plan.includes(id)

  const enabledLanguages = LANGUAGES.filter((lang) => plan.includes(lang.id))

  return {
    plan,
    toggleLanguage,
    isInPlan,
    enabledLanguages,
    allLanguages: LANGUAGES,
  }
}

