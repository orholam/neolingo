import { useNavigate } from 'react-router-dom'

export default function PracticeTab({ course, stats }) {
  const navigate = useNavigate()
  const masteredCount = stats.totalUniversalMastered

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {masteredCount} word{masteredCount !== 1 ? 's' : ''} mastered in your collection
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => navigate('/flashcards/new')}
          className="group text-left rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 p-6 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all"
        >
          <span className="text-3xl mb-3 block">📚</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
            Learn new words
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Start a fresh 20-word session from your dictionary.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/flashcards/new?mode=review')}
          disabled={masteredCount === 0}
          className={`group text-left rounded-2xl border-2 p-6 transition-all ${
            masteredCount > 0
              ? 'border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-md'
              : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 opacity-60 cursor-not-allowed'
          }`}
        >
          <span className="text-3xl mb-3 block">🔄</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
            Review mastered
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {masteredCount > 0
              ? `Practice ${masteredCount} word${masteredCount !== 1 ? 's' : ''} you already know.`
              : 'Master some words first to unlock review.'}
          </p>
        </button>
      </div>
    </div>
  )
}
