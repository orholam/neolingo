// Forgetting-curve memory model for mastered words.
//
// Long-term memory (LTM, 1-10) represents how permanently a word is lodged in
// memory. It starts at 1 the moment a word is mastered, and only moves once
// per calendar day per word ("a different occasion"): +1 when a review
// session finishes the word on the very first try, -1 when it took extra
// tries to get right.
//
// Short-term memory (STM, 1-10) represents current recall strength. It is
// never stored directly - it's always derived from `longTermMemory` and
// `lastReviewedAt` via an exponential (Ebbinghaus-style) decay curve whose
// half-life scales with LTM. Finishing a review resets the decay anchor
// (`lastReviewedAt = now`), which is equivalent to STM jumping back to 10.

export const MIN_MEMORY = 1
export const MAX_MEMORY = 10
export const INITIAL_LONG_TERM_MEMORY = 1

// Tunable: characteristic decay time (in days) contributed by each LTM point.
// At LTM 1, recall fades to a coin-flip within about a day; at LTM 10, it
// stays strong for well over a week.
export const STM_DECAY_DAYS_PER_POINT = 1

const DAY_MS = 24 * 60 * 60 * 1000

export function clampMemory(value) {
  if (Number.isNaN(value)) return MIN_MEMORY
  return Math.min(MAX_MEMORY, Math.max(MIN_MEMORY, value))
}

/** Local calendar-day key (YYYY-MM-DD) used to gate "different occasions". */
export function todayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * A word that was *just* learned/mastered right now: short-term memory
 * starts at its peak (10) since recall is freshest immediately after
 * learning, and decays from here per the forgetting curve.
 */
export function createInitialMemory(now = Date.now()) {
  return {
    longTermMemory: INITIAL_LONG_TERM_MEMORY,
    lastReviewedAt: now,
    lastOccasionDate: todayKey(new Date(now)),
    firstLearnedAt: now,
    reviewCount: 0,
  }
}

/**
 * A mastered word with no known learn/review history (e.g. it was mastered
 * before this memory model existed, or was bulk-imported). We have no basis
 * to assume it was "just reviewed", so `lastReviewedAt` is left unset and
 * short-term memory starts at the floor (1) - already needing review -
 * rather than the ceiling (10).
 */
export function createBackfilledMemory() {
  return {
    longTermMemory: INITIAL_LONG_TERM_MEMORY,
    lastReviewedAt: null,
    lastOccasionDate: null,
    firstLearnedAt: null,
    reviewCount: 0,
  }
}

/**
 * Current recall strength (1-10), derived from time elapsed since the last
 * completed review and how stable the memory is (longTermMemory). Words
 * with no recorded review (`lastReviewedAt` unset, e.g. backfilled legacy
 * mastered words) are assumed already faded rather than freshly reviewed.
 */
export function computeShortTermMemory(entry, now = Date.now()) {
  if (!entry) return MIN_MEMORY
  if (!entry.lastReviewedAt) return MIN_MEMORY
  const ltm = clampMemory(entry.longTermMemory ?? INITIAL_LONG_TERM_MEMORY)
  const daysSince = Math.max(0, (now - entry.lastReviewedAt) / DAY_MS)
  const stability = ltm * STM_DECAY_DAYS_PER_POINT
  const value = MIN_MEMORY + (MAX_MEMORY - MIN_MEMORY) * Math.exp(-daysSince / stability)
  return clampMemory(value)
}

/**
 * Apply the outcome of a finished review session for one word.
 * - Short-term memory always resets (lastReviewedAt = now).
 * - Long-term memory only changes once per calendar day per word: +1 when
 *   the word was correct on the first try this session, -1 when it needed
 *   extra tries.
 */
export function applyReviewCompletion(entry, { struggled = false, now = Date.now() } = {}) {
  const base = entry || createInitialMemory(now)
  const today = todayKey(new Date(now))
  const isNewOccasion = base.lastOccasionDate !== today

  let longTermMemory = clampMemory(base.longTermMemory ?? INITIAL_LONG_TERM_MEMORY)
  let lastOccasionDate = base.lastOccasionDate ?? today

  if (isNewOccasion) {
    longTermMemory = clampMemory(longTermMemory + (struggled ? -1 : 1))
    lastOccasionDate = today
  }

  return {
    ...base,
    longTermMemory,
    lastOccasionDate,
    lastReviewedAt: now,
    reviewCount: (base.reviewCount || 0) + 1,
  }
}

/** Human-friendly "Nd ago" / "just now" string for a lastReviewedAt timestamp. */
export function formatTimeSince(lastReviewedAt, now = Date.now()) {
  if (!lastReviewedAt) return 'never reviewed'
  const diffMs = Math.max(0, now - lastReviewedAt)
  const hours = diffMs / (60 * 60 * 1000)
  if (hours < 1) return 'just now'
  if (hours < 24) return `${Math.round(hours)}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}
