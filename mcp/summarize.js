import {
  brainPowerSeries,
  computeBrainPower,
  displayScore,
  reconstructBrainPowerHistory,
  scoreEntries,
} from '../src/utils/brainPower.js'
import { computeShortTermMemory, isPermanentMemory } from '../src/utils/wordMemory.js'
import { lookupWord } from './dictionaries.js'
import { LANGUAGES } from './languages.js'

const DUE_SHORT_TERM = 5
const DEFAULT_DUE_LIMIT = 8
const DEFAULT_HISTORY_LIMIT = 12
const BRAIN_POINTS = 8

function countEntries(value) {
  if (Array.isArray(value)) return value.length
  if (value && typeof value === 'object') return Object.keys(value).length
  return 0
}

function asIdList(value) {
  if (Array.isArray(value)) return value.filter((id) => typeof id === 'string')
  if (value && typeof value === 'object') return Object.keys(value)
  return []
}

function iso(timestamp) {
  if (!timestamp) return null
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function wordView(entries, wordId) {
  const lookedUp = lookupWord(entries, wordId)
  return { word: lookedUp.word, gloss: lookedUp.gloss }
}

function memoryRows(memoryForLang, dictionary, now) {
  const rows = []
  for (const [wordId, entry] of Object.entries(memoryForLang || {})) {
    if (!entry || typeof entry !== 'object') continue
    const permanent = isPermanentMemory(entry)
    const shortTerm = Math.round(computeShortTermMemory(entry, now) * 10) / 10
    rows.push({
      wordId,
      ...wordView(dictionary, wordId),
      permanent,
      alreadyKnown: permanent && !(entry.reviewCount > 0),
      shortTerm,
      longTerm: entry.longTermMemory ?? 1,
      reviews: entry.reviewCount || 0,
      learnedAt: entry.firstLearnedAt > 0 ? entry.firstLearnedAt : null,
      reviewedAt: entry.lastReviewedAt > 0 ? entry.lastReviewedAt : null,
      due: !permanent && shortTerm < DUE_SHORT_TERM,
    })
  }
  return rows
}

function recentBrain(entries, now) {
  const history = reconstructBrainPowerHistory(entries, now)
  const series = brainPowerSeries(history, now).map((point) => ({
    at: iso(point.at),
    score: displayScore(point.score),
  }))
  if (series.length <= BRAIN_POINTS) return series
  return series.slice(-BRAIN_POINTS)
}

function sessionView(session, dictionary) {
  const indices = Array.isArray(session.wordIndices) ? session.wordIndices : []
  const words = indices
    .map((index) => dictionary?.[index])
    .filter(Boolean)
    .map((entry) => entry.headword)
    .filter(Boolean)
  const last = Array.isArray(session.history) ? session.history[session.history.length - 1] : null
  const total = last ? (last.struggling || 0) + (last.inProgress || 0) + (last.mastered || 0) : indices.length
  const mastered = last && total > 0 ? Math.round((last.mastered / total) * 100) : null
  return {
    at: iso(session.createdAt),
    wordCount: indices.length,
    masteredPercent: mastered,
    passes: session.passes ?? null,
    words: words.slice(0, 8),
  }
}

function languageSummary(lang, snapshot, dictionaries, now, limits) {
  const dictionary = dictionaries[lang.memoryKey] || []
  const memory = snapshot.language_word_memory?.[lang.memoryKey] || {}
  const masteredIds = asIdList(snapshot.language_mastered_words?.[lang.memoryKey])
  const scored = scoreEntries(memory, masteredIds)
  const raw = computeBrainPower(scored, now)
  const rows = memoryRows(memory, dictionary, now)

  const newWords = rows
    .filter((row) => row.learnedAt && !row.alreadyKnown)
    .sort((a, b) => b.learnedAt - a.learnedAt)
    .slice(0, limits.history)
    .map((row) => ({
      word: row.word,
      gloss: row.gloss,
      at: iso(row.learnedAt),
      longTerm: row.longTerm,
      shortTerm: row.shortTerm,
    }))

  const reviews = rows
    .filter((row) => row.reviews > 0 && row.reviewedAt)
    .sort((a, b) => b.reviewedAt - a.reviewedAt)
    .slice(0, limits.history)
    .map((row) => ({
      word: row.word,
      gloss: row.gloss,
      at: iso(row.reviewedAt),
      reviewCount: row.reviews,
      longTerm: row.longTerm,
      shortTerm: row.shortTerm,
    }))

  const due = rows
    .filter((row) => row.due)
    .sort((a, b) => a.shortTerm - b.shortTerm || a.longTerm - b.longTerm)

  const sessions = (Array.isArray(snapshot.flashcard_sessions?.[lang.memoryKey])
    ? snapshot.flashcard_sessions[lang.memoryKey]
    : []
  )
    .slice()
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, limits.history)
    .map((session) => sessionView(session, dictionary))

  return {
    id: lang.id,
    name: lang.name,
    brainScore: displayScore(raw),
    brainScoreRecent: recentBrain(scored, now),
    mastered: masteredIds.length,
    alreadyKnown: rows.filter((row) => row.alreadyKnown).length,
    trackedWords: rows.length,
    dueCount: due.length,
    weakestDue: due.slice(0, limits.due).map((row) => ({
      word: row.word,
      gloss: row.gloss,
      shortTerm: row.shortTerm,
      longTerm: row.longTerm,
      lastReviewedAt: iso(row.reviewedAt),
    })),
    newWords,
    reviews,
    newWordSessions: sessions,
  }
}

export function summarizeSnapshot(snapshot, options = {}) {
  const now = options.now ?? Date.now()
  const limits = {
    due: options.dueLimit ?? DEFAULT_DUE_LIMIT,
    history: options.historyLimit ?? DEFAULT_HISTORY_LIMIT,
  }
  const dictionaries = options.dictionaries || {}
  const planIds = Array.isArray(snapshot.language_plan) ? snapshot.language_plan : []

  const languages = LANGUAGES.filter((lang) => {
    if (options.language && options.language.id !== lang.id) return false
    if (options.language) return true
    return (
      planIds.includes(lang.id) ||
      countEntries(snapshot.language_mastered_words?.[lang.memoryKey]) > 0 ||
      countEntries(snapshot.language_word_memory?.[lang.memoryKey]) > 0 ||
      countEntries(snapshot.flashcard_sessions?.[lang.memoryKey]) > 0
    )
  }).map((lang) => languageSummary(lang, snapshot, dictionaries, now, limits))

  if (options.dueOnly) {
    return {
      updatedAt: options.updatedAt || null,
      languages: languages.map((lang) => ({
        id: lang.id,
        name: lang.name,
        dueCount: lang.dueCount,
        due: lang.weakestDue,
      })),
    }
  }

  return {
    updatedAt: options.updatedAt || null,
    selectedCourse: snapshot.selected_course || null,
    plan: planIds,
    brainScore: languages.reduce((sum, lang) => sum + lang.brainScore, 0),
    languages,
  }
}
