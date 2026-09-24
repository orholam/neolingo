import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listSessions, saveSession } from '../../utils/flashcardSessions'
import { getPrimaryGloss } from '../../utils/dictionaryEntry'
import SessionBucketChart from '../flashcards/SessionBucketChart'

const PREVIEW_WORDS = 4

function getSessionWordPreview(session, dictionary) {
  if (!session.wordIndices || !Array.isArray(session.wordIndices) || !dictionary.length) return ''
  return session.wordIndices
    .slice(0, PREVIEW_WORDS)
    .map((idx) => dictionary[idx])
    .filter(Boolean)
    .map((e) => e.headword || getPrimaryGloss(e))
    .filter(Boolean)
    .join(', ')
}

function createDebugSession(languageId, dictionary) {
  const size = Math.min(20, dictionary.length)
  if (size === 0) return
  const wordIndices = Array.from({ length: size }, (_, i) => i)
  saveSession(languageId, {
    id: `debug-${Date.now()}`,
    languageId,
    createdAt: Date.now() - 60000,
    wordIndices,
    history: [
      { score: 0, struggling: 0, inProgress: 20, mastered: 0 },
      { score: 2, struggling: 2, inProgress: 14, mastered: 4 },
      { score: 6, struggling: 3, inProgress: 10, mastered: 7 },
      { score: 10, struggling: 2, inProgress: 8, mastered: 10 },
      { score: 14, struggling: 1, inProgress: 5, mastered: 14 },
      { score: 18, struggling: 0, inProgress: 3, mastered: 17 },
    ],
    passes: 24,
  })
}

export default function HistoryTab({ languageId, dictionary }) {
  const navigate = useNavigate()
  const [refreshKey, setRefreshKey] = useState(0)
  // eslint-disable-next-line no-unused-vars
  const _key = refreshKey
  const sessionList = listSessions(languageId)

  return (
    <div className="space-y-4">
      {import.meta.env.DEV && (
        <button
          type="button"
          onClick={() => {
            createDebugSession(languageId, dictionary)
            setRefreshKey((k) => k + 1)
          }}
          className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
        >
          Dev: add sample session
        </button>
      )}

      {sessionList.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
          <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">No sessions yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Completed sessions appear here so you can replay them.
          </p>
          <button
            type="button"
            onClick={() => navigate('/flashcards/new')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
          >
            Start your first session
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
            const preview = getSessionWordPreview(s, dictionary)

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => navigate(`/flashcards/${s.id}`)}
                className="text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all"
              >
                {preview && (
                  <div className="relative overflow-hidden mb-3 min-h-[1.5rem]">
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap pr-8">
                      {preview}
                      {s.wordIndices?.length > PREVIEW_WORDS ? ' …' : ''}
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
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">{masteredPct}%</p>
                  </div>
                </div>
                <div className="relative">
                  {s.history?.length > 0 && <SessionBucketChart history={s.history} compact />}
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
