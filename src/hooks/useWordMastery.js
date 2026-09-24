import { useState, useEffect, useMemo, useCallback, useRef } from 'react'

const MASTERED_KEY = 'languageMasteredWords'
const SESSION_SIZE = 20

function loadMastered() {
  if (typeof localStorage === 'undefined') return {}
  try {
    const stored = localStorage.getItem(MASTERED_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed && typeof parsed === 'object') return parsed
    }
  } catch (e) {
    console.error('Error loading mastered words:', e)
  }
  return {}
}

function saveMastered(data) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(MASTERED_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Error saving mastered words:', e)
  }
}

export function getWordId(entry, index) {
  const headword = entry && entry.headword ? entry.headword : 'word'
  return `${headword}::${index}`
}

function pickWeightedRandom(items) {
  if (!items.length) return null
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
  if (totalWeight <= 0) {
    return items[Math.floor(Math.random() * items.length)]
  }
  let threshold = Math.random() * totalWeight
  for (let i = 0; i < items.length; i += 1) {
    threshold -= items[i].weight
    if (threshold <= 0) return items[i]
  }
  return items[items.length - 1]
}

function shuffleArray(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickSessionWords(dictionaryEntries, masteredIds) {
  const candidates = []
  dictionaryEntries.forEach((entry, index) => {
    const id = getWordId(entry, index)
    if (masteredIds.has(id)) return
    candidates.push({ id, entry, index })
  })
  const shuffled = shuffleArray(candidates)
  return shuffled.slice(0, SESSION_SIZE)
}

export function useWordMastery(languageId, dictionaryEntries, options = {}) {
  const { onWordCompleted, reviewSessionSize = SESSION_SIZE } = options
  const [masteredState, setMasteredState] = useState(() => loadMastered())
  const masteredForLang = masteredState[languageId] || []
  const masteredIds = useMemo(() => new Set(masteredForLang), [masteredForLang])

  const [sessionWords, setSessionWords] = useState(() => {
    if (!Array.isArray(dictionaryEntries) || !dictionaryEntries.length) return {}
    const picks = pickSessionWords(dictionaryEntries, new Set(masteredForLang))
    const words = {}
    picks.forEach((p) => {
      words[p.id] = { mastery: 0, correctCount: 0, incorrectCount: 0, index: p.index }
    })
    return words
  })

  const [lastWordId, setLastWordId] = useState(null)
  const initialized = useRef(false)
  const languageIdRef = useRef(languageId)

  // Reset session when the active language changes
  useEffect(() => {
    if (languageIdRef.current === languageId) return
    languageIdRef.current = languageId
    initialized.current = false

    if (!Array.isArray(dictionaryEntries) || !dictionaryEntries.length) {
      setSessionWords({})
      setLastWordId(null)
      return
    }

    const ids = new Set(masteredState[languageId] || [])
    const picks = pickSessionWords(dictionaryEntries, ids)
    const words = {}
    picks.forEach((p) => {
      words[p.id] = { mastery: 0, correctCount: 0, incorrectCount: 0, index: p.index }
    })
    setSessionWords(words)
    setLastWordId(null)
  }, [languageId, dictionaryEntries, masteredState])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    if (!Array.isArray(dictionaryEntries) || !dictionaryEntries.length) return
    if (Object.keys(sessionWords).length > 0) return
    const picks = pickSessionWords(dictionaryEntries, masteredIds)
    const words = {}
    picks.forEach((p) => {
      words[p.id] = { mastery: 0, correctCount: 0, incorrectCount: 0, index: p.index }
    })
    setSessionWords(words)
  }, [dictionaryEntries, masteredIds, sessionWords])

  useEffect(() => {
    saveMastered(masteredState)
  }, [masteredState])

  // Fire onWordCompleted exactly once per word, the moment its session
  // mastery crosses from <5 into >=5 (i.e. the word is "done" for this
  // session, whether it took one try or several).
  const onWordCompletedRef = useRef(onWordCompleted)
  useEffect(() => {
    onWordCompletedRef.current = onWordCompleted
  }, [onWordCompleted])

  const prevSessionWordsRef = useRef(sessionWords)
  useEffect(() => {
    const prev = prevSessionWordsRef.current
    if (prev !== sessionWords) {
      Object.keys(sessionWords).forEach((wordId) => {
        const prevWord = prev[wordId]
        const currWord = sessionWords[wordId]
        const prevMastery = prevWord ? prevWord.mastery : 0
        if (currWord.mastery >= 5 && prevMastery < 5) {
          onWordCompletedRef.current?.(wordId, { incorrectCount: currWord.incorrectCount || 0 })
        }
      })
      prevSessionWordsRef.current = sessionWords
    }
  }, [sessionWords])

  const activeWordEntries = useMemo(() => {
    if (!Array.isArray(dictionaryEntries)) return []
    const list = []
    Object.keys(sessionWords).forEach((wordId) => {
      const wordState = sessionWords[wordId]
      const entry = dictionaryEntries[wordState.index]
      if (!entry) return
      const entryWithIndex = { ...entry, __index: wordState.index }
      list.push({ id: wordId, state: wordState, entry: entryWithIndex })
    })
    return list.sort((a, b) => a.state.index - b.state.index)
  }, [sessionWords, dictionaryEntries])

  const sessionMasteredEntries = useMemo(
    () => activeWordEntries.filter((item) => item.state.mastery >= 5),
    [activeWordEntries]
  )

  const allSessionMastered = activeWordEntries.length > 0 && sessionMasteredEntries.length === activeWordEntries.length

  const stats = useMemo(() => {
    const byMastery = { '-1': 0, 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    activeWordEntries.forEach((item) => {
      const value = item.state.mastery
      if (value <= -1) byMastery['-1'] += 1
      else if (value >= 5) byMastery[5] += 1
      else byMastery[value] = (byMastery[value] || 0) + 1
    })
    return {
      totalActive: activeWordEntries.length,
      totalSessionMastered: sessionMasteredEntries.length,
      totalUniversalMastered: masteredForLang.length,
      allSessionMastered,
      byMastery,
    }
  }, [activeWordEntries, sessionMasteredEntries, masteredForLang, allSessionMastered])

  const getNextWord = useCallback(() => {
    if (!activeWordEntries.length) return null

    const unmastered = activeWordEntries.filter((item) => item.state.mastery < 5)
    if (!unmastered.length) return null

    const weighted = unmastered.map((item) => {
      const mastery = item.state.mastery
      let weight = 1
      if (mastery <= 0) weight = 5
      else if (mastery === 1) weight = 4
      else if (mastery === 2) weight = 3
      else if (mastery === 3) weight = 3
      else if (mastery === 4) weight = 2
      else weight = 1
      return { id: item.id, entry: item.entry, mastery, weight }
    })

    let chosen = pickWeightedRandom(weighted)
    if (chosen && chosen.id === lastWordId && weighted.length > 1) {
      chosen = pickWeightedRandom(weighted)
    }
    if (!chosen) return null
    return { id: chosen.id, entry: chosen.entry, mastery: chosen.mastery }
  }, [activeWordEntries, lastWordId])

  const recordResult = useCallback(
    (wordId, wasCorrect) => {
      setSessionWords((prev) => {
        const prevWordState = prev[wordId]
        if (!prevWordState) return prev
        let newMastery
        if (wasCorrect) {
          newMastery = Math.min(5, (prevWordState.mastery || 0) + 1)
        } else {
          newMastery = -1
        }
        return {
          ...prev,
          [wordId]: {
            ...prevWordState,
            mastery: newMastery,
            correctCount: wasCorrect ? (prevWordState.correctCount || 0) + 1 : prevWordState.correctCount || 0,
            incorrectCount: !wasCorrect ? (prevWordState.incorrectCount || 0) + 1 : prevWordState.incorrectCount || 0,
          },
        }
      })
      setLastWordId(wordId)
    },
    []
  )

  const commitMastered = useCallback(() => {
    const newMasteredIds = []
    Object.keys(sessionWords).forEach((wordId) => {
      if (sessionWords[wordId].mastery >= 5) {
        newMasteredIds.push(wordId)
      }
    })
    if (!newMasteredIds.length) return []

    setMasteredState((prev) => {
      const existing = new Set(prev[languageId] || [])
      newMasteredIds.forEach((id) => existing.add(id))
      const next = { ...prev, [languageId]: Array.from(existing) }
      saveMastered(next)
      return next
    })

    return newMasteredIds
  }, [sessionWords, languageId])

  const startNewSession = useCallback(() => {
    if (!Array.isArray(dictionaryEntries) || !dictionaryEntries.length) return
    const latestMastered = loadMastered()
    const latestIds = new Set(latestMastered[languageId] || [])
    const picks = pickSessionWords(dictionaryEntries, latestIds)
    const words = {}
    picks.forEach((p) => {
      words[p.id] = { mastery: 0, correctCount: 0, incorrectCount: 0, index: p.index }
    })
    setSessionWords(words)
    setLastWordId(null)
  }, [dictionaryEntries, languageId])

  const startReviewSession = useCallback(() => {
    if (!Array.isArray(dictionaryEntries) || !dictionaryEntries.length) return
    const latestMastered = loadMastered()
    const latestIds = new Set(latestMastered[languageId] || [])
    if (latestIds.size === 0) return

    const candidates = []
    dictionaryEntries.forEach((entry, index) => {
      const id = getWordId(entry, index)
      if (!latestIds.has(id)) return
      candidates.push({ id, entry, index })
    })
    const shuffled = shuffleArray(candidates)
    const picks = shuffled.slice(0, reviewSessionSize)
    const words = {}
    picks.forEach((p) => {
      words[p.id] = { mastery: 0, correctCount: 0, incorrectCount: 0, index: p.index }
    })
    setSessionWords(words)
    setLastWordId(null)
  }, [dictionaryEntries, languageId, reviewSessionSize])

  const getActiveWords = useCallback(
    () =>
      activeWordEntries.map((item) => ({
        id: item.id,
        entry: item.entry,
        mastery: item.state.mastery,
      })),
    [activeWordEntries]
  )

  const getUniversalMasteredWords = useCallback(() => {
    if (!Array.isArray(dictionaryEntries)) return []
    const results = []
    dictionaryEntries.forEach((entry, index) => {
      const id = getWordId(entry, index)
      if (masteredIds.has(id)) {
        results.push({ id, entry })
      }
    })
    return results
  }, [dictionaryEntries, masteredIds])

  const addMastered = useCallback(
    (wordId) => {
      setMasteredState((prev) => {
        const existing = new Set(prev[languageId] || [])
        if (existing.has(wordId)) return prev
        existing.add(wordId)
        const next = { ...prev, [languageId]: Array.from(existing) }
        saveMastered(next)
        return next
      })
    },
    [languageId]
  )

  const removeMastered = useCallback(
    (wordId) => {
      setMasteredState((prev) => {
        const existing = prev[languageId] || []
        const updated = existing.filter((id) => id !== wordId)
        const next = { ...prev, [languageId]: updated }
        saveMastered(next)
        return next
      })
    },
    [languageId]
  )

  const resetMastered = useCallback(() => {
    setMasteredState((prev) => {
      const next = { ...prev }
      delete next[languageId]
      saveMastered(next)
      return next
    })
  }, [languageId])

  const replaceAllMastered = useCallback((newState) => {
    if (!newState || typeof newState !== 'object') return
    saveMastered(newState)
    setMasteredState(newState)
  }, [])

  return {
    getNextWord,
    recordResult,
    getActiveWords,
    getUniversalMasteredWords,
    commitMastered,
    startNewSession,
    startReviewSession,
    addMastered,
    removeMastered,
    resetMastered,
    replaceAllMastered,
    stats,
  }
}
