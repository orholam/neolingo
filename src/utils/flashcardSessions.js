const SESSIONS_KEY = 'flashcardSessions'

function loadAll() {
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed
  } catch {
    // ignore
  }
  return {}
}

function saveAll(data) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

export function listSessions(languageId) {
  const all = loadAll()
  const list = all[languageId] || []
  return list
    .slice()
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

export function getSession(languageId, sessionId) {
  const all = loadAll()
  const list = all[languageId] || []
  return list.find((s) => s.id === sessionId) || null
}

export function saveSession(languageId, session) {
  const all = loadAll()
  const list = all[languageId] || []
  const idx = list.findIndex((s) => s.id === session.id)
  let nextList
  if (idx === -1) {
    nextList = [...list, session]
  } else {
    nextList = [...list]
    nextList[idx] = session
  }
  const nextAll = { ...all, [languageId]: nextList }
  saveAll(nextAll)
}

