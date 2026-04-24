import { createContext, useContext, useState } from 'react'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [selectedCourseId, setSelectedCourseIdState] = useState(() => {
    if (typeof window === 'undefined') return 'dadjo'
    try {
      return window.localStorage.getItem('selectedCourse') || 'dadjo'
    } catch {
      return 'dadjo'
    }
  })

  const setSelectedCourseId = (id) => {
    setSelectedCourseIdState(id)
    try {
      window.localStorage.setItem('selectedCourse', id)
    } catch {
      // ignore
    }
  }

  return (
    <LanguageContext.Provider value={{ selectedCourseId, setSelectedCourseId }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useSelectedLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useSelectedLanguage must be used within LanguageProvider')
  return ctx
}
