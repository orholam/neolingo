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
  MIN_MEMORY,
  applyReviewCompletion,
  clampMemory,
  computeShortTermMemory,
  createBackfilledMemory,
  createInitialMemory,
  readStoredMemory,
} from './wordMemory'

export const BRAIN_POWER_ANCHOR_KEY = 'languageBrainPower_v1'
export const BRAIN_POWER_HISTORY_KEY = 'languageBrainPowerHistory_v1'

// One snapshot per study burst. A 20-word session updates the same point
// instead of storing the whole vocabulary once per card.
const SNAPSHOT_DEBOUNCE_MS = 2 * 60 * 1000
const MAX_HISTORY_POINTS = 240

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

function readHistories() {
  if (typeof localStorage === 'undefined') return {}
  try {
    const stored = localStorage.getItem(BRAIN_POWER_HISTORY_KEY)
    if (!stored) return {}
    const parsed = JSON.parse(stored)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeHistories(all) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(BRAIN_POWER_HISTORY_KEY, JSON.stringify(all))
  } catch {
    // quota / private mode — the live score still renders
  }
}

/** [lastReviewedAt or 0, longTermMemory]. 0 means the word has already faded. */
function packEntries(entries) {
  const words = []
  if (!entries || typeof entries !== 'object') return words
  for (const entry of Object.values(entries)) {
    if (!entry || typeof entry !== 'object') continue
    const ltm = clampMemory(entry.longTermMemory ?? MIN_MEMORY)
    words.push([entry.lastReviewedAt > 0 ? entry.lastReviewedAt : 0, ltm])
  }
  return words
}

function scorePacked(words, now) {
  let sum = 0
  for (const pair of words || []) {
    const reviewedAt = pair[0] > 0 ? pair[0] : null
    sum += wordBrainPower(
      computeShortTermMemory({ lastReviewedAt: reviewedAt, longTermMemory: pair[1] }, now)
    )
  }
  return sum
}

function decayPoints(words, start, end) {
  if (!(end > start + 1000)) return []
  const span = end - start
  const day = 24 * 60 * 60 * 1000
  const steps = span < day ? 4 : span < 7 * day ? 14 : 28
  const points = []
  for (let i = 1; i < steps; i++) {
    const t = Math.round(start + (span * i) / steps)
    points.push({ t, s: scorePacked(words, t) })
  }
  return points
}

function trimPoints(points) {
  if (points.length <= MAX_HISTORY_POINTS) return points
  const keep = new Set([0, points.length - 1])
  for (let i = 1; i < points.length; i++) {
    if (points[i].t === points[i - 1].t) {
      keep.add(i - 1)
      keep.add(i)
    }
  }
  const budget = MAX_HISTORY_POINTS - keep.size
  if (budget > 0) {
    const rest = []
    for (let i = 0; i < points.length; i++) {
      if (!keep.has(i)) rest.push(i)
    }
    const stride = rest.length / budget
    for (let i = 0; i < budget; i++) keep.add(rest[Math.floor(i * stride)])
  }
  return points.filter((_, index) => keep.has(index))
}

/**
 * Past scores from the memory we still have. Each word appears when it was
 * learned, fades, then jumps at its latest review. Reviews between those two
 * moments are not stored, so older wiggles are the shape of that gap.
 */
export function reconstructBrainPowerHistory(entries, now = Date.now()) {
  const events = []
  const floorIds = []
  for (const [id, entry] of Object.entries(entries || {})) {
    if (!entry || typeof entry !== 'object') continue
    const ltm = clampMemory(entry.longTermMemory ?? MIN_MEMORY)
    const learned = entry.firstLearnedAt > 0 ? entry.firstLearnedAt : null
    const reviewed = entry.lastReviewedAt > 0 ? entry.lastReviewedAt : null
    const permanentFromStart = ltm >= MAX_MEMORY && !(entry.reviewCount > 0)
    if (!learned && !reviewed) {
      floorIds.push(id)
      continue
    }
    if (permanentFromStart) {
      const at = learned || reviewed
      events.push({ at, id, reviewedAt: reviewed || at, ltm })
      continue
    }
    if (learned && reviewed && reviewed > learned + 1000) {
      events.push({ at: learned, id, reviewedAt: learned, ltm: MIN_MEMORY })
      events.push({ at: reviewed, id, reviewedAt: reviewed, ltm })
    } else {
      const at = learned || reviewed
      events.push({ at, id, reviewedAt: reviewed || at, ltm })
    }
  }

  if (!events.length) {
    if (!floorIds.length) return { points: [], tail: null }
    const words = packEntries(entries)
    return { points: [{ t: now, s: scorePacked(words, now) }], tail: { t: now, words } }
  }

  events.sort((a, b) => a.at - b.at || String(a.id).localeCompare(String(b.id)))
  const state = new Map()
  for (const id of floorIds) state.set(id, [0, MIN_MEMORY])
  const points = []
  let cursor = null
  let index = 0
  while (index < events.length) {
    const at = events[index].at
    const before = [...state.values()]
    if (cursor != null && at > cursor) {
      points.push(...decayPoints(before, cursor, at))
    }
    while (index < events.length && events[index].at === at) {
      const event = events[index]
      state.set(event.id, [event.reviewedAt || 0, event.ltm])
      index += 1
    }
    const after = [...state.values()]
    if (before.length) {
      const pre = scorePacked(before, at)
      const post = scorePacked(after, at)
      if (displayScore(pre) !== displayScore(post)) points.push({ t: at, s: pre })
    }
    points.push({ t: at, s: scorePacked(after, at) })
    cursor = at
  }

  return {
    points: trimPoints(points),
    tail: { t: cursor, words: [...state.values()] },
  }
}

function rememberSnapshot(languageId, entries, now) {
  const all = readHistories()
  const lang = all[languageId] || { points: [], tail: null }
  const score = computeBrainPower(entries, now)
  const words = packEntries(entries)

  if (lang.tail && now - lang.tail.t < SNAPSHOT_DEBOUNCE_MS && lang.points.length) {
    const last = lang.points[lang.points.length - 1]
    last.t = now
    last.s = score
    lang.tail = { t: now, words }
  } else {
    const points = Array.isArray(lang.points) ? lang.points.slice() : []
    if (lang.tail && now > lang.tail.t) {
      points.push(...decayPoints(lang.tail.words, lang.tail.t, now))
      const pre = scorePacked(lang.tail.words, now)
      if (displayScore(pre) !== displayScore(score)) points.push({ t: now, s: pre })
    }
    points.push({ t: now, s: score })
    lang.points = trimPoints(points)
    lang.tail = { t: now, words }
  }

  all[languageId] = lang
  writeHistories(all)
  return lang
}

function ensureHistory(languageId, entries, now) {
  const all = readHistories()
  const existing = all[languageId]
  if (existing?.tail?.t) {
    const packed = packEntries(entries)
    if (packed.length === (existing.tail.words || []).length) return existing
    return rememberSnapshot(languageId, entries, now)
  }
  const built = reconstructBrainPowerHistory(entries, now)
  if (!built.tail) return built
  all[languageId] = built
  writeHistories(all)
  return built
}

/** Points from the first remembered word through now, including fades between jumps. */
export function brainPowerSeries(history, now = Date.now()) {
  if (!history) return []
  const points = []
  for (const point of history.points || []) {
    if (!point || !Number.isFinite(point.t) || !Number.isFinite(point.s)) continue
    points.push({ at: point.t, score: point.s })
  }
  const tail = history.tail
  if (tail?.words && now > (tail.t || 0) + 1000) {
    points.push(...decayPoints(tail.words, tail.t, now).map((point) => ({ at: point.t, score: point.s })))
    points.push({ at: now, score: scorePacked(tail.words, now) })
  }
  points.sort((a, b) => a.at - b.at)
  return points
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
  const history = readHistories()[languageId]
  if (history?.tail?.t) rememberSnapshot(languageId, entries, now)
  else {
    const allHistories = readHistories()
    allHistories[languageId] = reconstructBrainPowerHistory(entries, now)
    writeHistories(allHistories)
  }
  invalidateBrainPowerCache()
  return score
}

export function clearBrainPowerAnchor(languageId) {
  if (!languageId || typeof localStorage === 'undefined') return
  const all = readAnchors()
  if (all[languageId]) {
    delete all[languageId]
    try {
      localStorage.setItem(BRAIN_POWER_ANCHOR_KEY, JSON.stringify(all))
    } catch {
      // ignore
    }
  }
  const histories = readHistories()
  if (histories[languageId]) {
    delete histories[languageId]
    writeHistories(histories)
  }
  invalidateBrainPowerCache()
}

/**
 * Score plus how far it has fallen since the last learn/review/known-word
 * action. `drop` is null when they have never practiced on this device.
 * A score that is ahead of the anchor reports drop 0.
 */
export function readBrainPowerDisplay(languageId, now = Date.now(), masteredIds = null) {
  const entries = scoreEntries(readStoredMemory()?.[languageId], masteredIds)
  const raw = computeBrainPower(entries, now)
  const score = displayScore(raw)
  const anchor = readBrainPowerAnchor(languageId)
  let drop = null
  if (anchor) {
    const fallen = displayScore(anchor.score) - score
    drop = fallen > 0 ? fallen : 0
  }
  const history = ensureHistory(languageId, entries, now)
  const series = brainPowerSeries(history, now)
  return { score, drop, raw, series }
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
