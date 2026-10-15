// One vocabulary score for a language.
//
// Each memorized word contributes √(short-term memory / 10): a word you just
// practiced adds 1, a half-awake word adds about 0.7, and a word that has
// almost faded adds about 0.3. The square root keeps a few perfect words from
// hiding a pile of sleepy ones, while every memorized word still counts.
//
// The displayed number is rounded. An anchor saved after each learn, review,
// or "already knew" mark is what the score page compares against, so the
// drop is "since you last practiced," not since the page happened to render.

import {
  MAX_MEMORY,
  applyReviewCompletion,
  computeShortTermMemory,
  createBackfilledMemory,
  createInitialMemory,
  readStoredMemory,
} from './wordMemory'

export const BRAIN_POWER_ANCHOR_KEY = 'languageBrainPower_v1'

// Reuse a reading across quick navigations. Invalidate whenever practice
// writes a new anchor, and always recompute on a real page visit after this.
export const BRAIN_POWER_CACHE_MS = 60 * 1000

let displayCache = { key: null, at: 0, reading: null }

function masteredIdKey(masteredIds) {
  if (!Array.isArray(masteredIds)) return '*'
  return masteredIds.join('\0')
}

/** Mastered words only. A word with no memory record yet counts as faded. */
export function scoreEntries(storedEntries, masteredIds) {
  if (!Array.isArray(masteredIds)) return storedEntries || {}
  const stored = storedEntries || {}
  const next = {}
  for (const id of masteredIds) {
    next[id] = stored[id] || createBackfilledMemory()
  }
  return next
}

export function wordBrainPower(shortTermMemory) {
  const stm = Math.min(MAX_MEMORY, Math.max(0, Number(shortTermMemory) || 0))
  if (stm <= 0) return 0
  return Math.sqrt(stm / MAX_MEMORY)
}

export function computeBrainPower(entries, now = Date.now()) {
  if (!entries || typeof entries !== 'object') return 0
  let sum = 0
  for (const entry of Object.values(entries)) {
    if (!entry || typeof entry !== 'object') continue
    sum += wordBrainPower(computeShortTermMemory(entry, now))
  }
  return sum
}

export function brainPowerForLanguage(
  languageId,
  now = Date.now(),
  memoryState = readStoredMemory(),
  masteredIds = null
) {
  if (!languageId) return 0
  return computeBrainPower(scoreEntries(memoryState?.[languageId], masteredIds), now)
}

export function displayScore(raw) {
  return Math.round(Number(raw) || 0)
}

export function displayDelta(beforeRaw, afterRaw) {
  return displayScore(afterRaw) - displayScore(beforeRaw)
}

export function formatBrainPowerChange(delta) {
  if (delta > 0) return `Brain power +${delta}`
  if (delta < 0) return `Brain power −${Math.abs(delta)}`
  return 'Brain power stayed the same'
}

function readAnchors() {
  if (typeof localStorage === 'undefined') return {}
  try {
    const stored = localStorage.getItem(BRAIN_POWER_ANCHOR_KEY)
    if (!stored) return {}
    const parsed = JSON.parse(stored)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function readBrainPowerAnchor(languageId) {
  const entry = readAnchors()[languageId]
  if (!entry || typeof entry.score !== 'number' || !Number.isFinite(entry.score)) return null
  return { score: entry.score, at: entry.at || null }
}

export function invalidateBrainPowerCache() {
  displayCache = { key: null, at: 0, reading: null }
}

/** Remember the score at the moment the learner actually studied. */
export function anchorBrainPower(languageId, entries, now = Date.now()) {
  if (!languageId || typeof localStorage === 'undefined') return 0
  const score = computeBrainPower(entries, now)
  const all = readAnchors()
  all[languageId] = { score, at: now }
  try {
    localStorage.setItem(BRAIN_POWER_ANCHOR_KEY, JSON.stringify(all))
  } catch {
    // quota / private mode — the live score still renders
  }
  invalidateBrainPowerCache()
  return score
}

export function clearBrainPowerAnchor(languageId) {
  if (!languageId || typeof localStorage === 'undefined') return
  const all = readAnchors()
  if (!all[languageId]) return
  delete all[languageId]
  try {
    localStorage.setItem(BRAIN_POWER_ANCHOR_KEY, JSON.stringify(all))
  } catch {
    // ignore
  }
  invalidateBrainPowerCache()
}

/**
 * Score plus how far it has fallen since the last learn/review/known-word
 * action. `drop` is null when they have never practiced on this device.
 * A score that is ahead of the anchor reports drop 0.
 */
export function readBrainPowerDisplay(languageId, now = Date.now(), masteredIds = null) {
  const raw = brainPowerForLanguage(languageId, now, readStoredMemory(), masteredIds)
  const score = displayScore(raw)
  const anchor = readBrainPowerAnchor(languageId)
  if (!anchor) return { score, drop: null, raw }
  const drop = displayScore(anchor.score) - score
  return { score, drop: drop > 0 ? drop : 0, raw }
}

export function getCachedBrainPower(
  languageId,
  { maxAgeMs = BRAIN_POWER_CACHE_MS, now = Date.now(), masteredIds = null } = {}
) {
  const key = `${languageId}:${masteredIdKey(masteredIds)}`
  if (displayCache.key === key && displayCache.reading && now - displayCache.at < maxAgeMs) {
    return displayCache.reading
  }
  const reading = readBrainPowerDisplay(languageId, now, masteredIds)
  displayCache = { key, at: now, reading }
  return reading
}

/**
 * Memory map as it will look once every mastered card in this session has
 * been saved. Safe to apply on top of a map that already includes some of
 * those updates: a same-day review does not move long-term memory twice,
 * and a word that was just learned is left alone.
 */
export function projectSessionMemory(entries, words, { review = false, now = Date.now() } = {}) {
  const next = { ...(entries || {}) }
  for (const word of words || []) {
    if ((word?.mastery ?? 0) < 5) continue
    if (review) {
      next[word.id] = applyReviewCompletion(next[word.id], {
        struggled: (word.incorrectCount || 0) > 0,
        now,
      })
    } else if (!next[word.id]?.firstLearnedAt) {
      next[word.id] = createInitialMemory(now)
    }
  }
  return next
}
