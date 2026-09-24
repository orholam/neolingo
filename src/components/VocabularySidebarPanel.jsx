import { useSelectedLanguage } from '../contexts/LanguageContext'
import { getCourse, getLanguageId } from '../data/courses'
import { useWordMastery } from '../hooks/useWordMastery'
import MiniSemanticMap from './MiniSemanticMap'
import SessionBucketChart from './flashcards/SessionBucketChart'

export default function VocabularySidebarPanel() {
  const { selectedCourseId } = useSelectedLanguage()
  const course = getCourse(selectedCourseId)
  const languageId = getLanguageId(course.id)
  const dictionary = course.dictionary || []
  const { stats, getActiveWords } = useWordMastery(languageId, dictionary)

  const activeWords = getActiveWords()
  const hasSession = stats.totalActive > 0
  const struggling = activeWords.filter((w) => (w.mastery ?? 0) < 0).length
  const inProgress = activeWords.filter((w) => {
    const m = w.mastery ?? 0
    return m >= 0 && m < 5
  }).length
  const progressPct =
    stats.totalActive > 0
      ? Math.round((stats.totalSessionMastered / stats.totalActive) * 100)
      : 0

  const historySnapshot = hasSession
    ? [{ score: 0, struggling, inProgress, mastered: stats.totalSessionMastered }]
    : []

  return (
    <aside className="hidden lg:block w-72 shrink-0">
      <div className="sticky top-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 pt-4 pb-3">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1 text-lg">Vocabulary status</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            {course.emoji} {course.label}
          </p>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-xl bg-green-50 dark:bg-green-900/20 px-3 py-2 border border-green-100 dark:border-green-800">
              <p className="text-[10px] uppercase tracking-wide text-green-700 dark:text-green-300 font-semibold">
                Collection
              </p>
              <p className="text-xl font-bold text-green-700 dark:text-green-300 tabular-nums">
                {stats.totalUniversalMastered}
              </p>
            </div>
            <div className="rounded-xl bg-purple-50 dark:bg-purple-900/20 px-3 py-2 border border-purple-100 dark:border-purple-800">
              <p className="text-[10px] uppercase tracking-wide text-purple-700 dark:text-purple-300 font-semibold">
                Session
              </p>
              <p className="text-xl font-bold text-purple-700 dark:text-purple-300 tabular-nums">
                {hasSession ? `${progressPct}%` : '—'}
              </p>
            </div>
          </div>

          {hasSession ? (
            <div className="space-y-2">
              <SessionBucketChart history={historySnapshot} compact />
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Struggling {struggling}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> In progress {inProgress}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" /> Mastered {stats.totalSessionMastered}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Start a session to track word buckets here.
            </p>
          )}
        </div>

        <MiniSemanticMap courseId={selectedCourseId} />
      </div>
    </aside>
  )
}
