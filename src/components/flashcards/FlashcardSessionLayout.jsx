import FlashcardDrill from '../FlashcardDrill'
import SessionStatsRibbon from './SessionStatsRibbon'
import SessionScoreChart from './SessionScoreChart'
import SessionBucketChart from './SessionBucketChart'
import SessionWordSidebar from './SessionWordSidebar'

export default function FlashcardSessionLayout({
  reviewMode = false,
  replayMode = false,
  bannerText,
  course,
  currentCard,
  showAnswer,
  stats,
  history,
  activeWords,
  totalScore,
  onShowAnswer,
  onResult,
  onSelectWord,
  onCompletePrimary,
  onReviewAgain,
  onLearnNew,
  onStartNew,
  overflowItems = [],
}) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-3 sm:pt-5 pb-10 flex flex-col lg:flex-row gap-8 lg:gap-10">
      <div className="flex-1 min-w-0 space-y-5">
        <SessionStatsRibbon stats={stats} reviewMode={reviewMode} />

        <FlashcardDrill
          reviewMode={reviewMode}
          replayMode={replayMode}
          bannerText={bannerText}
          courseEmoji={course?.emoji}
          courseLabel={course?.label}
          currentCard={currentCard}
          showAnswer={showAnswer}
          stats={stats}
          onShowAnswer={onShowAnswer}
          onResult={onResult}
          onCompletePrimary={onCompletePrimary}
          onReviewAgain={onReviewAgain}
          onLearnNew={onLearnNew}
          onStartNew={onStartNew}
          overflowItems={overflowItems}
        />

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Score history</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Sum of all word scores this session
              </p>
            </div>
            <span
              className={`text-2xl font-bold tabular-nums leading-none ${
                totalScore >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {totalScore >= 0 ? '+' : ''}
              {totalScore}
            </span>
          </div>
          {history.length > 0 ? (
            <SessionScoreChart history={history} />
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              Answer cards to see your score trend.
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Bucket breakdown</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Proportion of words in each bucket over time
          </p>
          {history.length > 0 ? (
            <SessionBucketChart history={history} />
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              Your struggling, in-progress, and mastered mix will appear here.
            </p>
          )}
        </div>
      </div>

      <SessionWordSidebar activeWords={activeWords} onSelectWord={onSelectWord} />
    </div>
  )
}
