import { useMemo, useRef, useState } from 'react'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { filterDictionaryEntries } from '../utils/filterDictionaryEntries'

const ACCENT = {
  dadjo: {
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    pos: 'text-blue-600 dark:text-blue-400',
    ring: 'focus:ring-blue-500 focus:border-blue-500',
  },
  korean: {
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    pos: 'text-red-600 dark:text-red-400',
    ring: 'focus:ring-red-500 focus:border-red-500',
  },
  sumerian: {
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    pos: 'text-amber-600 dark:text-amber-400',
    ring: 'focus:ring-amber-500 focus:border-amber-500',
  },
}

function DictionaryEntryRow({ entry, index, variant }) {
  const accent = ACCENT[variant] || ACCENT.dadjo
  const showPhonetic =
    entry.phonetic && (variant !== 'korean' || entry.phonetic !== entry.headword)

  return (
    <li className="py-3">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            {variant === 'sumerian' && entry.script && (
              <span className="text-xl text-gray-900 dark:text-gray-100">{entry.script}</span>
            )}
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {entry.headword}
            </span>
            {showPhonetic && (
              <span className="text-xs text-gray-500 dark:text-gray-400">[{entry.phonetic}]</span>
            )}
            {entry.part_of_speech && (
              <span
                className={`text-[10px] uppercase tracking-wide font-semibold ${accent.pos}`}
              >
                {entry.part_of_speech}
              </span>
            )}
            {variant === 'dadjo' && entry.plural && (
              <span className="text-xs text-gray-500 dark:text-gray-400">• pl. {entry.plural}</span>
            )}
          </div>
          <div className="mt-1 text-sm text-gray-800 dark:text-gray-200">
            {(entry.senses || []).map((sense, i) => (
              <span key={i}>
                {i > 0 && '; '}
                {sense}
              </span>
            ))}
          </div>
          {entry.examples && entry.examples.length > 0 && (
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
              {entry.examples.map((ex, i) => (
                <p key={i}>&ldquo;{ex}&rdquo;</p>
              ))}
            </div>
          )}
          {variant === 'korean' && entry.category && (
            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{entry.category}</p>
          )}
          {variant === 'sumerian' && entry.notes && (
            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{entry.notes}</p>
          )}
        </div>
        {entry.source && (
          <span
            className={`text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0 ${
              variant === 'korean' ? 'hidden sm:inline' : ''
            }`}
          >
            {entry.source}
          </span>
        )}
      </div>
    </li>
  )
}

export default function DictionaryView({
  variant = 'dadjo',
  icon,
  title,
  subtitle,
  entries,
  searchPlaceholder,
  searchExtraFields = [],
}) {
  const [query, setQuery] = useState('')
  const scrollRef = useRef(null)
  const accent = ACCENT[variant] || ACCENT.dadjo

  const filteredEntries = useMemo(
    () => filterDictionaryEntries(entries, query, searchExtraFields),
    [entries, query, searchExtraFields]
  )

  const { visibleItems, sentinelRef, hasMore, visibleCount, totalCount } = useInfiniteScroll(
    filteredEntries,
    { scrollRootRef: scrollRef }
  )

  return (
    <div className="max-w-5xl mx-auto pb-6">
      <section className="mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full ${accent.iconBg} flex items-center justify-center`}
          >
            <span className="text-2xl">{icon}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">{subtitle}</p>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4">
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
            Search
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className={`w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 ${accent.ring}`}
            />
          </div>
        </div>
      </section>

      <section>
        <div
          ref={scrollRef}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 max-h-[70vh] overflow-y-auto"
        >
          {totalCount === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No entries found. Try a different search term.
            </p>
          ) : (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 tabular-nums">
                Showing {visibleItems.length.toLocaleString()} of {totalCount.toLocaleString()}{' '}
                {totalCount === 1 ? 'entry' : 'entries'}
              </p>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {visibleItems.map((entry, index) => (
                  <DictionaryEntryRow
                    key={`${entry.headword}-${entry.part_of_speech}-${index}`}
                    entry={entry}
                    index={index}
                    variant={variant}
                  />
                ))}
              </ul>
              {hasMore && (
                <div ref={sentinelRef} className="py-6 text-center">
                  <p className="text-xs text-gray-400 dark:text-gray-500">Loading more entries…</p>
                </div>
              )}
              {!hasMore && visibleCount > 60 && (
                <p className="py-4 text-center text-xs text-gray-400 dark:text-gray-500">
                  All {totalCount.toLocaleString()} entries loaded
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
