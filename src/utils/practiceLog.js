const STORAGE_KEY = 'languagePracticeLog'
const MAX_EVENTS = 180
const DAY_MS = 24 * 60 * 60 * 1000

export function localDay(timestamp) {
  const date = new Date(timestamp)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function readAll() {
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeAll(log) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log))
  } catch {
    // quota / private mode
  }
}

function eventsFor(log, languageId) {
  const list = log?.[languageId]
  return Array.isArray(list) ? list : []
}

export function listPractice(languageId, log = readAll()) {
  return eventsFor(log, languageId)
    .slice()
    .sort((a, b) => (b.at || 0) - (a.at || 0))
}

export function appendPractice(languageId, event) {
  if (!languageId || !event?.id) return []
  const log = readAll()
  const existing = eventsFor(log, languageId)
  if (existing.some((item) => item.id === event.id)) return existing
  const day = event.day || localDay(event.at || Date.now())
  const next = existing.filter(
    (item) => !(item.source === 'memory' && item.kind === event.kind && item.day === day),
  )
  next.push({
    id: event.id,
    at: event.at || Date.now(),
    day,
    kind: event.kind,
    count: event.count || 0,
    scoreBefore: event.scoreBefore ?? null,
    scoreAfter: event.scoreAfter ?? null,
    source: 'session',
  })
  next.sort((a, b) => (a.at || 0) - (b.at || 0))
  log[languageId] = next.slice(-MAX_EVENTS)
  writeAll(log)
  return log[languageId]
}

function isAlreadyKnown(entry) {
  return (entry?.longTermMemory || 0) >= 10 && !(entry?.reviewCount > 0)
}

export function eventsFromMemory(memoryForLang, now = Date.now()) {
  const buckets = new Map()
  for (const entry of Object.values(memoryForLang || {})) {
    if (!entry || typeof entry !== 'object' || isAlreadyKnown(entry)) continue
    if (entry.firstLearnedAt > 0) addBucket(buckets, 'new', entry.firstLearnedAt)
    if (entry.reviewCount > 0 && entry.lastReviewedAt > 0) addBucket(buckets, 'review', entry.lastReviewedAt)
  }
  const events = []
  for (const [key, bucket] of buckets) {
    if (now - bucket.at > 60 * DAY_MS) continue
    events.push({
      id: `memory:${key}`,
      at: bucket.at,
      day: bucket.day,
      kind: bucket.kind,
      count: bucket.count,
      scoreBefore: null,
      scoreAfter: null,
      source: 'memory',
    })
  }
  return events
}

export function combinePractice(log = {}, memory = {}, now = Date.now()) {
  const languages = new Set([...Object.keys(log || {}), ...Object.keys(memory || {})])
  const combined = {}
  for (const language of languages) {
    const saved = eventsFor(log, language)
    if (saved.some((event) => event.source === 'memory')) {
      combined[language] = saved
      continue
    }
    const covered = new Set(
      saved.filter((event) => event.source === 'session').map((event) => `${event.kind}:${event.day}`),
    )
    const remembered = eventsFromMemory(memory[language], now).filter(
      (event) => !covered.has(`${event.kind}:${event.day}`),
    )
    const next = [...saved, ...remembered]
    if (next.length) combined[language] = next
  }
  return combined
}

export function seedPracticeFromMemory(languageId, memoryForLang, now = Date.now()) {
  if (!languageId || !memoryForLang) return false
  const log = readAll()
  const existing = eventsFor(log, languageId)
  if (existing.some((item) => item.source === 'memory')) return false
  const seeded = eventsFromMemory(memoryForLang, now).filter((event) => {
    return !existing.some(
      (item) => item.source === 'session' && item.kind === event.kind && item.day === event.day,
    )
  })
  if (!seeded.length) return false
  log[languageId] = [...existing, ...seeded].sort((a, b) => (a.at || 0) - (b.at || 0)).slice(-MAX_EVENTS)
  writeAll(log)
  return true
}

function addBucket(buckets, kind, timestamp) {
  const day = localDay(timestamp)
  const key = `${kind}:${day}`
  const current = buckets.get(key) || { kind, day, at: timestamp, count: 0 }
  current.count += 1
  if (timestamp > current.at) current.at = timestamp
  buckets.set(key, current)
}

export function summarizePractice(log = {}, { now = Date.now(), days = 7, recent = 10 } = {}) {
  const events = []
  for (const [language, list] of Object.entries(log || {})) {
    if (!Array.isArray(list)) continue
    for (const event of list) {
      if (!event) continue
      events.push({ ...event, language })
    }
  }

  const cutoff = now - days * DAY_MS
  const byDay = new Map()
  for (const event of events) {
    if ((event.at || 0) < cutoff || !event.day) continue
    const row = byDay.get(event.day) || {
      day: event.day,
      newWords: 0,
      reviews: 0,
      brainDelta: null,
    }
    if (event.kind === 'new') row.newWords += event.count || 0
    if (event.kind === 'review') row.reviews += event.count || 0
    if (event.source === 'session' && event.scoreBefore != null && event.scoreAfter != null) {
      row.brainDelta = (row.brainDelta || 0) + (event.scoreAfter - event.scoreBefore)
    }
    byDay.set(event.day, row)
  }

  const recentSessions = events
    .filter((event) => event.source === 'session')
    .sort((a, b) => (b.at || 0) - (a.at || 0))
    .slice(0, recent)
    .map((event) => ({
      at: new Date(event.at).toISOString(),
      day: event.day,
      language: event.language,
      kind: event.kind,
      count: event.count || 0,
      brainBefore: event.scoreBefore,
      brainAfter: event.scoreAfter,
      brainDelta:
        event.scoreBefore != null && event.scoreAfter != null
          ? event.scoreAfter - event.scoreBefore
          : null,
    }))

  return {
    recentSessions,
    pastWeek: [...byDay.values()].sort((a, b) => (a.day < b.day ? 1 : -1)),
  }
}
