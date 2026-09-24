import { useNavigate, useSearchParams } from 'react-router-dom'
import { VOCAB_TABS, parseVocabularyTab } from '../config/navigation'

export default function VocabularyTabs() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const active = parseVocabularyTab(searchParams.get('tab'))

  return (
    <div className="inline-flex w-full sm:w-auto rounded-xl bg-gray-100 dark:bg-gray-800 p-1 gap-0.5">
      {VOCAB_TABS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => navigate(id === 'practice' ? '/flashcards' : `/flashcards?tab=${id}`)}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            active === id
              ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
