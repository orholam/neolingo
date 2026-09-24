import OverflowMenu from './OverflowMenu'
import SessionComplete from './SessionComplete'
import { getPrimaryGloss, getPhonetic } from '../utils/dictionaryEntry'

function cardStatus(masteryValue) {
  const isReversed = masteryValue >= 3 && masteryValue < 5
  const isStruggling = masteryValue < 0
  const label = isStruggling
    ? 'Struggling'
    : isReversed
      ? 'Reverse'
      : masteryValue >= 5
        ? 'Mastered'
        : 'In progress'
  const className = isStruggling
    ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 border-red-200'
    : isReversed
      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200 border-purple-200'
      : masteryValue >= 5
        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200 border-green-200'
        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 border-amber-200'
  return { label, className, isReversed }
}

export default function FlashcardDrill({
  reviewMode = false,
  replayMode = false,
  bannerText,
  currentCard,
  showAnswer,
  stats,
  onShowAnswer,
  onResult,
  onCompletePrimary,
  onReviewAgain,
  onLearnNew,
  onStartNew,
  overflowItems = [],
}) {
  const entry = currentCard?.entry
  const masteryValue = currentCard?.mastery ?? 0
  const gloss = getPrimaryGloss(entry)
  const phonetic = getPhonetic(entry)
  const { label: statusLabel, className: statusClass, isReversed } = cardStatus(masteryValue)

  const sessionDone = stats.allSessionMastered && stats.totalActive > 0
  const progressPct =
    stats.totalActive > 0
      ? Math.round((stats.totalSessionMastered / stats.totalActive) * 100)
      : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          {reviewMode && (
            <span className="inline-block mb-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
              Review — strengthens memory
            </span>
          )}
          {replayMode && bannerText && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">{bannerText}</p>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold tabular-nums text-gray-800 dark:text-gray-200">
              {stats.totalSessionMastered}/{stats.totalActive || 0} mastered
            </span>
            <span>·</span>
            <span>{progressPct}% session progress</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPct, 100)}%` }}
            />
          </div>
        </div>
        {overflowItems.length > 0 && <OverflowMenu items={overflowItems} label="Session options" />}
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-sm min-h-[320px] flex flex-col">
        {sessionDone ? (
          <SessionComplete
            reviewMode={reviewMode}
            replayMode={replayMode}
            totalWords={stats.totalActive}
            onPrimary={onCompletePrimary}
            onReviewAgain={onReviewAgain}
            onLearnNew={onLearnNew}
          />
        ) : !entry ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">No words available</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Start a new session from Vocabulary.
            </p>
            {onStartNew && (
              <button
                type="button"
                onClick={onStartNew}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
              >
                New session
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  {isReversed ? 'Translation' : 'Word'}
                </p>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${statusClass}`}>
                  {statusLabel} · {masteryValue}
                </span>
              </div>

              {isReversed ? (
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{gloss || '—'}</p>
              ) : (
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">{entry.headword}</span>
                  {phonetic && <span className="text-lg text-gray-400">[{phonetic}]</span>}
                </div>
              )}

              <div className="mt-8 min-h-[72px]">
                {!showAnswer ? (
                  <button
                    type="button"
                    onClick={onShowAnswer}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
                  >
                    {isReversed ? 'Show word' : 'Show answer'}
                  </button>
                ) : isReversed ? (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Word</p>
                    <p className="text-xl font-medium text-gray-900 dark:text-gray-100">{entry.headword}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Meaning</p>
                    <p className="text-xl font-medium text-gray-900 dark:text-gray-100">{gloss || '—'}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 mt-auto border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => onResult(false)}
                disabled={!showAnswer}
                className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                  showAnswer
                    ? 'border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'border-gray-200 text-gray-300 cursor-not-allowed dark:border-gray-700'
                }`}
              >
                Wrong
              </button>
              <button
                type="button"
                onClick={() => onResult(true)}
                disabled={!showAnswer}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  showAnswer
                    ? 'bg-green-600 text-white hover:bg-green-500'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed dark:bg-gray-700'
                }`}
              >
                Right
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
