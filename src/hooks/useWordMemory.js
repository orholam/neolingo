import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  createInitialMemory,
  createPermanentMemory,
  createBackfilledMemory,
  isPermanentMemory,
  applyReviewCompletion,
  computeShortTermMemory,
  MEMORY_STORAGE_KEY,
} from '../utils/wordMemory'
import { isLearningHydrating, requestLearningSync } from '../lib/learningSyncBridge'
import { anchorBrainPower } from '../utils/brainPower'

// v2: earlier versions incorrectly backfilled every pre-existing mastered
// word as "just reviewed" (STM=10). Bumping the key discards that bad data
// so everything re-initializes under the corrected backfill logic below.
const MEMORY_KEY = MEMORY_STORAGE_KEY

const FRENCH_KNOWN_PROMOTED_KEY = 'frenchKnownWordsPromoted_v1'

function promoteExistingFrenchKnown(data) {
  if (typeof localStorage === 'undefined') return data
  if (localStorage.getItem(FRENCH_KNOWN_PROMOTED_KEY)) return data
  localStorage.setItem(FRENCH_KNOWN_PROMOTED_KEY, '1')

  const french = data.French
  if (!french || typeof french !== 'object') return data

  const now = Date.now()
  let changed = false
  const nextFrench = {}
  Object.entries(french).forEach(([id, entry]) => {
    if (isPermanentMemory(entry)) {
      nextFrench[id] = entry
      return
    }
    changed = true
    nextFrench[id] = {
      ...createPermanentMemory(now),
      reviewCount: entry?.reviewCount || 0,
      firstLearnedAt: entry?.firstLearnedAt || now,
    }
  })
  if (!changed) return data
  return { ...data, French: nextFrench }
}

function loadMemory() {
  if (typeof localStorage === 'undefined') return {}
  try {
    const stored = localStorage.getItem(MEMORY_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed && typeof parsed === 'object') {
        const promoted = promoteExistingFrenchKnown(parsed)
        if (promoted !== parsed) {
          localStorage.setItem(MEMORY_KEY, JSON.stringify(promoted))
        }
        return promoted
      }
    } else {
      promoteExistingFrenchKnown({})
    }
  } catch (e) {
    console.error('Error loading word memory:', e)
  }
  return {}
}

function saveMemory(data) {
  if (typeof localStorage === 'undefined') return
  // During cloud hydrate, skip persisting auto-backfill stubs — they would
  // race the sync merge and erase real lastReviewedAt history.
  if (isLearningHydrating()) return
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(data))
    requestLearningSync()
  } catch (e) {
    console.error('Error saving word memory:', e)
  }
}

function commitPractice(prev, languageId, nextForLang, now = Date.now()) {
  const next = { ...prev, [languageId]: nextForLang }
  saveMemory(next)
  // Backfill and cloud hydrate are not practice. Only real learn/review/
  // already-knew updates should move the "last practiced" anchor.
  if (!isLearningHydrating()) anchorBrainPower(languageId, nextForLang, now)
  return next
}

/**
 * Tracks long-term/short-term memory metadata for mastered words.
 * `masteredIds` should be the current list/Set of mastered word IDs for
 * `languageId` (e.g. from useWordMastery).
 *
 * Any mastered id missing an entry is auto-backfilled as "unknown history"
 * (short-term memory starts at the floor, not the ceiling - we have no
 * evidence it was just reviewed), and auto-pruned once no longer mastered.
 * Callers that know a word was *just* learned right now (e.g. finishing a
 * learn session) should call `markFresh` for it immediately, which gives it
 * the true "just learned" state (short-term memory at its peak) instead.
 */
export function useWordMemory(languageId, masteredIds) {
  const [memoryState, setMemoryState] = useState(() => loadMemory())
  const memoryForLang = memoryState[languageId] || {}

  const masteredIdList = useMemo(
    () => (masteredIds ? Array.from(masteredIds) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [masteredIds ? Array.from(masteredIds).sort().join(',') : '']
  )

  useEffect(() => {
    if (!languageId) return
    setMemoryState((prev) => {
      const existing = prev[languageId] || {}
      const idSet = new Set(masteredIdList)
      let changed = false
      const next = {}

      idSet.forEach((id) => {
        if (existing[id]) {
          next[id] = existing[id]
        } else {
          // Unknown history (pre-existing mastered word, bulk import, etc.) -
          // assume it hasn't been reviewed, not that it was just reviewed.
          next[id] = createBackfilledMemory()
          changed = true
        }
      })

      Object.keys(existing).forEach((id) => {
        if (!idSet.has(id)) changed = true
      })

      if (!changed && Object.keys(existing).length === Object.keys(next).length) {
        return prev
      }

      const nextState = { ...prev, [languageId]: next }
      saveMemory(nextState)
      return nextState
    })
  }, [languageId, masteredIdList])

  /** Words the learner already knew: LTM and STM sit at 10, and review skips them. */
  const markPermanent = useCallback(
    (wordIds) => {
      const ids = Array.isArray(wordIds) ? wordIds : [wordIds]
      if (!ids.length) return
      setMemoryState((prev) => {
        const existingForLang = prev[languageId] || {}
        const nextForLang = { ...existingForLang }
        const now = Date.now()
        let changed = false
        ids.forEach((id) => {
          if (isPermanentMemory(nextForLang[id])) return
          const existing = nextForLang[id]
          nextForLang[id] = {
            ...createPermanentMemory(now),
            reviewCount: existing?.reviewCount || 0,
            firstLearnedAt: existing?.firstLearnedAt || now,
          }
          changed = true
        })
        if (!changed) return prev
        return commitPractice(prev, languageId, nextForLang, now)
      })
    },
    [languageId]
  )

  /** Mark word(s) as *just* learned right now: LTM=1, STM at its peak. */
  const markFresh = useCallback(
    (wordIds) => {
      const ids = Array.isArray(wordIds) ? wordIds : [wordIds]
      if (!ids.length) return
      setMemoryState((prev) => {
        const existingForLang = prev[languageId] || {}
        const nextForLang = { ...existingForLang }
        const now = Date.now()
        let changed = false
        ids.forEach((id) => {
          if (nextForLang[id]?.firstLearnedAt) return
          nextForLang[id] = createInitialMemory(now)
          changed = true
        })
        if (!changed) return prev
        return commitPractice(prev, languageId, nextForLang, now)
      })
    },
    [languageId]
  )

  const clearLanguage = useCallback(() => {
    setMemoryState((prev) => {
      if (!prev[languageId]) return prev
      const next = { ...prev }
      delete next[languageId]
      saveMemory(next)
      return next
    })
  }, [languageId])

  const recordReviewCompletion = useCallback(
    (wordId, { struggled = false } = {}) => {
      setMemoryState((prev) => {
        const existingForLang = prev[languageId] || {}
        const existingEntry = existingForLang[wordId]
        const now = Date.now()
        const updatedEntry = applyReviewCompletion(existingEntry, { struggled, now })
        const nextForLang = { ...existingForLang, [wordId]: updatedEntry }
        return commitPractice(prev, languageId, nextForLang, now)
      })
    },
    [languageId]
  )

  const getMemory = useCallback(
    (wordId, now = Date.now()) => {
      const entry = memoryForLang[wordId]
      if (!entry) return null
      return {
        longTermMemory: entry.longTermMemory,
        shortTermMemory: computeShortTermMemory(entry, now),
        lastReviewedAt: entry.lastReviewedAt,
        firstLearnedAt: entry.firstLearnedAt,
        reviewCount: entry.reviewCount || 0,
      }
    },
    [memoryForLang]
  )

  const getAllMemory = useCallback(
    (now = Date.now()) => {
      const result = {}
      Object.keys(memoryForLang).forEach((wordId) => {
        const entry = memoryForLang[wordId]
        result[wordId] = {
          longTermMemory: entry.longTermMemory,
          shortTermMemory: computeShortTermMemory(entry, now),
          lastReviewedAt: entry.lastReviewedAt,
          firstLearnedAt: entry.firstLearnedAt,
          reviewCount: entry.reviewCount || 0,
        }
      })
      return result
    },
    [memoryForLang]
  )

  // Stable object identity: getMemory/getAllMemory only change when
  // memoryForLang actually changes, so consumers that memoize on this
  // object (e.g. MemoryMap's graphData) don't recompute on unrelated
  // re-renders (like hovering a node).
  return useMemo(
    () => ({
      getMemory,
      getAllMemory,
      markFresh,
      markPermanent,
      clearLanguage,
      recordReviewCompletion,
    }),
    [getMemory, getAllMemory, markFresh, markPermanent, clearLanguage, recordReviewCompletion]
  )
}
