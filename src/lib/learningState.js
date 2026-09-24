export const LEARNING_KEYS = {
  progress: 'languageProgress',
  mastered: 'languageMasteredWords',
  memory: 'languageWordMemory_v2',
  sessions: 'flashcardSessions',
  streak: 'languageStreak',
  gems: 'languageGems',
  hearts: 'languageHearts',
  plan: 'languagePlan',
  selectedCourse: 'selectedCourse',
}

export const SYNC_KEY_SET = new Set(Object.values(LEARNING_KEYS))

function readJson(key, fallback) {
  if (typeof localStorage === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (raw == null || raw === '') return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  if (typeof localStorage === 'undefined' || value == null) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // quota / private mode
  }
}

function removeKey(key) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export function readLocalSnapshot() {
  const gemsRaw =
    typeof localStorage === 'undefined' ? null : localStorage.getItem(LEARNING_KEYS.gems)
  const gems = gemsRaw == null || gemsRaw === '' ? null : Number.parseInt(gemsRaw, 10)

  return {
    language_progress: readJson(LEARNING_KEYS.progress, {}),
    language_mastered_words: readJson(LEARNING_KEYS.mastered, {}),
    language_word_memory: readJson(LEARNING_KEYS.memory, {}),
    flashcard_sessions: readJson(LEARNING_KEYS.sessions, {}),
    language_streak: readJson(LEARNING_KEYS.streak, null),
    language_gems: Number.isFinite(gems) ? gems : null,
    language_hearts: readJson(LEARNING_KEYS.hearts, null),
    language_plan: readJson(LEARNING_KEYS.plan, null),
    selected_course:
      typeof localStorage === 'undefined'
        ? null
        : localStorage.getItem(LEARNING_KEYS.selectedCourse),
  }
}

export function writeLocalSnapshot(snapshot) {
  if (!snapshot) return
  writeJson(LEARNING_KEYS.progress, snapshot.language_progress ?? {})
  writeJson(LEARNING_KEYS.mastered, snapshot.language_mastered_words ?? {})
  writeJson(LEARNING_KEYS.memory, snapshot.language_word_memory ?? {})
  writeJson(LEARNING_KEYS.sessions, snapshot.flashcard_sessions ?? {})
  if (snapshot.language_streak != null) writeJson(LEARNING_KEYS.streak, snapshot.language_streak)
  if (snapshot.language_hearts != null) writeJson(LEARNING_KEYS.hearts, snapshot.language_hearts)
  if (snapshot.language_plan != null) writeJson(LEARNING_KEYS.plan, snapshot.language_plan)
  if (snapshot.language_gems != null && typeof localStorage !== 'undefined') {
    localStorage.setItem(LEARNING_KEYS.gems, String(snapshot.language_gems))
  }
  if (snapshot.selected_course && typeof localStorage !== 'undefined') {
    localStorage.setItem(LEARNING_KEYS.selectedCourse, snapshot.selected_course)
  }
}

/** Wipe all synced learning keys. Call only after sign-out so we never upsert empties. */
export function clearLocalSnapshot() {
  Object.values(LEARNING_KEYS).forEach(removeKey)
}

function objectHasEntries(value) {
  return Boolean(value && typeof value === 'object' && Object.keys(value).length > 0)
}

export function hasMeaningfulProgress(snapshot) {
  if (!snapshot) return false
  const progress = snapshot.language_progress || {}
  if (Array.isArray(progress.completedLessons) && progress.completedLessons.length > 0) return true
  if ((progress.totalXP || 0) > 0) return true
  if (objectHasEntries(snapshot.language_mastered_words)) return true
  if (objectHasEntries(snapshot.language_word_memory)) return true
  if (objectHasEntries(snapshot.flashcard_sessions)) return true
  if (snapshot.language_streak && (snapshot.language_streak.streak || 0) > 0) return true
  return false
}

function unionScalarArray(a = [], b = []) {
  const out = []
  const seen = new Set()
  for (const item of [...a, ...b]) {
    const key = typeof item === 'object' ? JSON.stringify(item) : String(item)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

function mergeProgress(local = {}, cloud = {}) {
  const localReset = local.lastDailyReset ? Date.parse(local.lastDailyReset) : 0
  const cloudReset = cloud.lastDailyReset ? Date.parse(cloud.lastDailyReset) : 0

  let dailyXP
  let lastDailyReset
  if (localReset === cloudReset) {
    dailyXP = Math.max(local.dailyXP || 0, cloud.dailyXP || 0)
    lastDailyReset = local.lastDailyReset || cloud.lastDailyReset || null
  } else if (localReset > cloudReset) {
    dailyXP = local.dailyXP || 0
    lastDailyReset = local.lastDailyReset || null
  } else {
    dailyXP = cloud.dailyXP || 0
    lastDailyReset = cloud.lastDailyReset || null
  }

  return {
    ...cloud,
    ...local,
    completedLessons: unionScalarArray(cloud.completedLessons, local.completedLessons),
    totalXP: Math.max(local.totalXP || 0, cloud.totalXP || 0),
    dailyXP,
    lastDailyReset,
    mistakes: unionScalarArray(cloud.mistakes, local.mistakes),
    lastPracticeDate: local.lastPracticeDate || cloud.lastPracticeDate || null,
  }
}

function mergeLangIdArrays(local = {}, cloud = {}) {
  const keys = new Set([...Object.keys(local), ...Object.keys(cloud)])
  const out = {}
  for (const key of keys) {
    const a = local[key]
    const b = cloud[key]
    if (Array.isArray(a) || Array.isArray(b)) {
      out[key] = unionScalarArray(Array.isArray(a) ? a : [], Array.isArray(b) ? b : [])
    } else if (a != null) {
      out[key] = a
    } else {
      out[key] = b
    }
  }
  return out
}

function mergeWordRecords(a = {}, b = {}) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  const out = {}
  for (const key of keys) {
    const left = a[key]
    const right = b[key]
    if (!left) {
      out[key] = right
      continue
    }
    if (!right) {
      out[key] = left
      continue
    }
    if (typeof left === 'object' && typeof right === 'object') {
      const leftScore =
        (left.mastery || 0) + (left.correctCount || 0) + (left.exposures || 0) + (left.level || 0)
      const rightScore =
        (right.mastery || 0) + (right.correctCount || 0) + (right.exposures || 0) + (right.level || 0)
      out[key] = leftScore >= rightScore ? { ...right, ...left } : { ...left, ...right }
    } else {
      out[key] = left ?? right
    }
  }
  return out
}

function mergeLangIdObjects(local = {}, cloud = {}) {
  const keys = new Set([...Object.keys(local), ...Object.keys(cloud)])
  const out = {}
  for (const key of keys) {
    const a = local[key]
    const b = cloud[key]
    if (a && typeof a === 'object' && !Array.isArray(a) && b && typeof b === 'object' && !Array.isArray(b)) {
      out[key] = mergeWordRecords(a, b)
    } else if (a != null) {
      out[key] = a
    } else {
      out[key] = b
    }
  }
  return out
}

function mergeStreak(local, cloud) {
  if (!local) return cloud || null
  if (!cloud) return local
  const localStreak = local.streak || 0
  const cloudStreak = cloud.streak || 0
  if (localStreak !== cloudStreak) return localStreak > cloudStreak ? local : cloud
  const localDate = local.lastDate ? Date.parse(local.lastDate) : 0
  const cloudDate = cloud.lastDate ? Date.parse(cloud.lastDate) : 0
  return localDate >= cloudDate ? local : cloud
}

function mergeHearts(local, cloud) {
  if (!local) return cloud || null
  if (!cloud) return local
  const localCount = local.hearts ?? local.count ?? 0
  const cloudCount = cloud.hearts ?? cloud.count ?? 0
  return localCount >= cloudCount ? local : cloud
}

function mergePlan(local, cloud) {
  if (!local) return cloud || null
  if (!cloud) return local
  const localEnabled = Array.isArray(local.enabledLanguages) ? local.enabledLanguages.length : 0
  const cloudEnabled = Array.isArray(cloud.enabledLanguages) ? cloud.enabledLanguages.length : 0
  return localEnabled >= cloudEnabled ? local : cloud
}

/** Union local + cloud so login never clobbers newer device progress. */
export function mergeSnapshots(local, cloud) {
  const a = local || {}
  const b = cloud || {}
  return {
    language_progress: mergeProgress(a.language_progress, b.language_progress),
    language_mastered_words: mergeLangIdArrays(
      a.language_mastered_words,
      b.language_mastered_words,
    ),
    language_word_memory: mergeLangIdObjects(a.language_word_memory, b.language_word_memory),
    flashcard_sessions: mergeLangIdObjects(a.flashcard_sessions, b.flashcard_sessions),
    language_streak: mergeStreak(a.language_streak, b.language_streak),
    language_gems: Math.max(a.language_gems || 0, b.language_gems || 0) || null,
    language_hearts: mergeHearts(a.language_hearts, b.language_hearts),
    language_plan: mergePlan(a.language_plan, b.language_plan),
    selected_course: a.selected_course || b.selected_course || null,
  }
}

export function snapshotsEqual(a, b) {
  try {
    return JSON.stringify(a ?? null) === JSON.stringify(b ?? null)
  } catch {
    return false
  }
}

export function snapshotFromRow(row) {
  if (!row) return null
  return {
    language_progress: row.language_progress || {},
    language_mastered_words: row.language_mastered_words || {},
    language_word_memory: row.language_word_memory || {},
    flashcard_sessions: row.flashcard_sessions || {},
    language_streak: row.language_streak,
    language_gems: row.language_gems,
    language_hearts: row.language_hearts,
    language_plan: row.language_plan,
    selected_course: row.selected_course,
  }
}

export function rowFromSnapshot(userId, snapshot, extra = {}) {
  return {
    user_id: userId,
    language_progress: snapshot.language_progress || {},
    language_mastered_words: snapshot.language_mastered_words || {},
    language_word_memory: snapshot.language_word_memory || {},
    flashcard_sessions: snapshot.flashcard_sessions || {},
    language_streak: snapshot.language_streak,
    language_gems: snapshot.language_gems,
    language_hearts: snapshot.language_hearts,
    language_plan: snapshot.language_plan,
    selected_course: snapshot.selected_course,
    ...extra,
  }
}
