import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listSessions, saveSession } from '../utils/flashcardSessions'
import { dadjoDictionary } from '../data/dadjoDictionary'
import { sumerianDictionary } from '../data/sumerianDictionary'
import { useWordMastery } from '../hooks/useWordMastery'
import { useSelectedLanguage } from '../contexts/LanguageContext'

const COURSES = {
  dadjo: { id: 'dadjo', label: 'Dadjo', emoji: '🌍', dictionary: dadjoDictionary },
  sumerian: { id: 'sumerian', label: 'Ancient Sumerian', emoji: '𒀭', dictionary: sumerianDictionary },
}

const PREVIEW_WORDS = 4

function getSessionWordPreview(session, dictionary, maxWords = PREVIEW_WORDS) {
  if (!session.wordIndices || !Array.isArray(session.wordIndices) || !dictionary.length) return ''
  return session.wordIndices
    .slice(0, maxWords)
    .map((idx) => dictionary[idx])
    .filter(Boolean)
    .map((e) => {
      if (e.headword) return e.headword
      if (Array.isArray(e.senses) && e.senses.length > 0) {
        const s = e.senses[0]
        if (typeof s === 'string') return s
        if (s?.gloss) return s.gloss
        if (s?.translation) return s.translation
      }
      return ''
    })
    .filter(Boolean)
    .join(', ')
}

function buildMiniBucketSvg(history) {
  if (!history || history.length === 0) return null

  const padL = 2, padR = 2, padT = 2, padB = 2
  const plotW = 140, plotH = 40
  const svgW = padL + plotW + padR
  const svgH = padT + plotH + padB
  const denom = Math.max(history.length - 1, 1)

  const bars = history.map((h, i) => {
    const total = h.struggling + h.inProgress + h.mastered
    if (total === 0) return { x: padL + (i / denom) * plotW, s: 0, p: 0, m: 0 }
    return {
      x: padL + (i / denom) * plotW,
      s: (h.struggling / total) * plotH,
      p: (h.inProgress / total) * plotH,
      m: (h.mastered / total) * plotH,
    }
  })

  const buildAreaPath = (getY0, getY1) => {
    const top = bars.map((b, i) => `${i === 0 ? 'M' : 'L'}${b.x},${padT + getY0(b)}`)
    const bot = bars.slice().reverse().map((b) => `L${b.x},${padT + getY1(b)}`)
    return top.join(' ') + ' ' + bot.join(' ') + ' Z'
  }

  return (
    <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="xMidYMid meet">
      <path d={buildAreaPath(() => 0, (b) => b.m)} fill="#22c55e" opacity="0.8" />
      <path d={buildAreaPath((b) => b.m, (b) => b.m + b.p)} fill="#f59e0b" opacity="0.7" />
      <path d={buildAreaPath((b) => b.m + b.p, () => plotH)} fill="#ef4444" opacity="0.6" />
    </svg>
  )
}

function createDebugSession(languageId, dictionary) {
  const size = Math.min(20, dictionary.length)
  if (size === 0) return
  const wordIndices = Array.from({ length: size }, (_, i) => i)
  const history = [
    { score: 0, struggling: 0, inProgress: 20, mastered: 0 },
    { score: 2, struggling: 2, inProgress: 14, mastered: 4 },
    { score: 6, struggling: 3, inProgress: 10, mastered: 7 },
    { score: 10, struggling: 2, inProgress: 8, mastered: 10 },
    { score: 14, struggling: 1, inProgress: 5, mastered: 14 },
    { score: 18, struggling: 0, inProgress: 3, mastered: 17 },
  ]
  saveSession(languageId, {
    id: `debug-${Date.now()}`,
    languageId,
    createdAt: Date.now() - 60000,
    wordIndices,
    history,
    passes: 24,
  })
}

function FlashcardSessions() {
  const navigate = useNavigate()
  const { selectedCourseId } = useSelectedLanguage()
  const [refreshKey, setRefreshKey] = useState(0)

  const course = COURSES[selectedCourseId] || COURSES.dadjo
  const languageId = course.id === 'sumerian' ? 'Sumerian' : 'Dadjo'
  const dictionary = course.dictionary || []
  const { stats } = useWordMastery(languageId, dictionary)

  const handleCreateDebugSession = () => {
    createDebugSession(languageId, dictionary)
    setRefreshKey((k) => k + 1)
  }

  // refreshKey in state causes a re-render, so listSessions re-reads from localStorage
  // eslint-disable-next-line no-unused-vars
  const _key = refreshKey
  const sessionList = listSessions(languageId)

  return (
    <div className="pb-8 space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-4xl leading-none">{course.emoji}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {course.label} — Vocabulary
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Review previous sessions, practice mastered words, or start something new.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/mastered')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-[11px] font-semibold text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700"
              >
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                Mastered list ({stats.totalUniversalMastered})
              </button>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[11px] text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Session words</span>
                <span className="text-gray-900 dark:text-gray-100 tabular-nums">
                  {sessionList.length > 0 ? '20 per session' : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCreateDebugSession}
            className="px-3 py-2 rounded-xl bg-amber-500/80 text-white text-xs font-medium hover:bg-amber-500 transition-colors shadow-sm"
            title="Add a sample completed session (debug)"
          >
            Debug: add sample
          </button>
          <button
            onClick={() => navigate('/flashcards/new')}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            New session
          </button>
        </div>
      </div>

      {/* Sessions grid */}
      {sessionList.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center shadow-sm">
          <p className="text-gray-700 dark:text-gray-200 font-medium mb-2">No sessions yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Start your first 20‑word flashcard session.
          </p>
          <button
            onClick={() => navigate('/flashcards/new')}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Start a session
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sessionList.map((s) => {
            const date = new Date(s.createdAt || 0)
            const label = !Number.isNaN(date.getTime()) ? date.toLocaleString() : 'Unknown time'
            const last = s.history && s.history[s.history.length - 1]
            const total = last ? last.struggling + last.inProgress + last.mastered : 0
            const masteredPct = last && total > 0 ? Math.round((last.mastered / total) * 100) : 0
            const previewText = getSessionWordPreview(s, dictionary)

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => navigate(`/flashcards/${s.id}`)}
                className="text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all"
              >
                {previewText && (
                  <div className="relative overflow-hidden mb-3 min-h-[1.5rem]">
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap pr-8">
                      {previewText}
                      {s.wordIndices && s.wordIndices.length > PREVIEW_WORDS ? ' …' : ''}
                    </p>
                    <span
                      className="absolute right-0 top-0 bottom-0 w-14 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none"
                      aria-hidden
                    />
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Session</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 dark:text-gray-500">Mastered</p>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {masteredPct}%
                    </p>
                  </div>
                </div>
                <div className="relative">
                  {buildMiniBucketSvg(s.history)}
                  {s.passes != null && s.passes > 0 && (
                    <span
                      className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-white select-none pointer-events-none"
                      aria-hidden
                    >
                      {s.passes}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FlashcardSessions
