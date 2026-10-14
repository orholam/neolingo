const STORAGE_KEY = 'placementChecks'

function readAll() {
  if (typeof localStorage === 'undefined') return {}
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeAll(data) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Ignore storage errors
  }
}

export function loadPlacement(languageId) {
  const entry = readAll()[languageId]
  if (!entry || typeof entry !== 'object') {
    return { answered: [], known: 0, status: 'new' }
  }
  return {
    answered: Array.isArray(entry.answered) ? entry.answered : [],
    known: Number.isFinite(entry.known) ? entry.known : 0,
    status: entry.status || 'new',
  }
}

export function savePlacement(languageId, next) {
  const all = readAll()
  all[languageId] = next
  writeAll(all)
  return next
}

export function dismissPlacement(languageId) {
  const current = loadPlacement(languageId)
  return savePlacement(languageId, { ...current, status: 'dismissed' })
}
