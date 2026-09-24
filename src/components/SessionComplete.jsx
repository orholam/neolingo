import { useNavigate } from 'react-router-dom'

export default function SessionComplete({
  reviewMode,
  replayMode = false,
  totalWords,
  onPrimary,
  onReviewAgain,
  onLearnNew,
}) {
  const navigate = useNavigate()

  return (
    <div className="text-center py-12 space-y-4">
      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
        {replayMode ? 'Replay complete!' : reviewMode ? 'Review complete!' : 'Session complete!'}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        You finished all {totalWords} word{totalWords !== 1 ? 's' : ''} in this{' '}
        {reviewMode ? 'review' : 'session'}.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        {reviewMode ? (
          <>
            <button
              type="button"
              onClick={onReviewAgain}
              className="px-6 py-3 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-colors"
            >
              Review again
            </button>
            <button
              type="button"
              onClick={onLearnNew}
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
            >
              Learn new words
            </button>
          </>
        ) : replayMode ? (
          <button
            type="button"
            onClick={onPrimary}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
          >
            Back to history
          </button>
        ) : (
          <button
            type="button"
            onClick={onPrimary}
            className="px-6 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-500 transition-colors"
          >
            Save to mastered &amp; new session
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => navigate('/flashcards')}
        className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
      >
        Back to Vocabulary
      </button>
    </div>
  )
}
