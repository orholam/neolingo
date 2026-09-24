import { getPhonetic } from '../../utils/dictionaryEntry'

function WordBucket({ title, color, words, emptyText, onSelectWord, shadeFn }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 shadow-sm max-h-[240px] flex flex-col">
      <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2.5 flex items-center gap-2">
        <span className={`inline-block w-2 h-2 rounded-full ${color}`} />
        {title} ({words.length})
      </h2>
      {words.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">{emptyText}</p>
      ) : (
        <div className="space-y-1.5 overflow-y-auto pr-1">
          {words.map((word) => {
            const phoneticItem = getPhonetic(word.entry)
            const shadeClass = shadeFn ? shadeFn(word.mastery ?? 0) : ''
            return (
              <button
                type="button"
                key={word.id}
                onClick={() => onSelectWord?.(word.id)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                  shadeClass ||
                  'bg-gray-50 dark:bg-gray-900/40 border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                    {word.entry.headword}
                  </span>
                  <span className="text-[10px] font-bold tabular-nums shrink-0 opacity-80">
                    {word.mastery}
                  </span>
                </div>
                {phoneticItem && (
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">[{phoneticItem}]</p>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function SessionWordSidebar({ activeWords, onSelectWord }) {
  const strugglingWords = activeWords.filter((w) => (w.mastery ?? 0) < 0)
  const masteredWordItems = activeWords.filter((w) => (w.mastery ?? 0) >= 5)
  const inProgressWords = activeWords.filter((w) => {
    const m = w.mastery ?? 0
    return m >= 0 && m < 5
  })

  const inProgressShade = (m) => {
    if (m >= 3) return 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700 hover:brightness-95'
    if (m >= 2) return 'bg-amber-200 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700 hover:brightness-95'
    if (m >= 1) return 'bg-amber-100 dark:bg-amber-900/25 border-amber-200 dark:border-amber-700 hover:brightness-95'
    return 'bg-amber-50 dark:bg-amber-900/15 border-amber-100 dark:border-amber-800 hover:brightness-95'
  }

  return (
    <div className="w-full lg:w-80 space-y-5 shrink-0">
      <WordBucket
        title="Struggling"
        color="bg-red-500"
        words={strugglingWords.slice().sort((a, b) => (a.entry.headword || '').localeCompare(b.entry.headword || ''))}
        emptyText="Words you mark wrong will appear here. Click any to review."
        onSelectWord={onSelectWord}
        shadeFn={() =>
          'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40'
        }
      />
      <WordBucket
        title="In progress"
        color="bg-amber-500"
        words={inProgressWords.slice().sort((a, b) => b.mastery - a.mastery)}
        emptyText="Words with partial mastery will appear here. Darker = higher score."
        onSelectWord={onSelectWord}
        shadeFn={inProgressShade}
      />
      <WordBucket
        title="Mastered"
        color="bg-green-500"
        words={masteredWordItems.slice().sort((a, b) => (a.entry.headword || '').localeCompare(b.entry.headword || ''))}
        emptyText="Session-mastered words (score 5) will appear here."
        onSelectWord={onSelectWord}
        shadeFn={() =>
          'bg-green-50 dark:bg-green-900/15 border-green-100 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30'
        }
      />
    </div>
  )
}
