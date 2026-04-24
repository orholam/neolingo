import { useMemo, useState } from 'react'
import Header from '../components/Header'
import { dadjoDictionary } from '../data/dadjoDictionary'

function Dictionary() {
  const [query, setQuery] = useState('')

  const filteredEntries = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return dadjoDictionary

    return dadjoDictionary.filter((entry) => {
      const headword = (entry.headword || '').toLowerCase()
      const phonetic = (entry.phonetic || '').toLowerCase()
      const sensesText = (entry.senses || [])
        .join(' ')
        .toLowerCase()

      return (
        headword.includes(q) ||
        phonetic.includes(q) ||
        sensesText.includes(q)
      )
    })
  }, [query])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header variant="simple" title="Dadjo Dictionary" backLabel="← Back to Home" />

      <main className="max-w-5xl mx-auto px-4 pt-24 pb-6">
        <section className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Dadjo–English Dictionary
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Type in Dadjo or English to search {dadjoDictionary.length.toLocaleString()} entries.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                🔍
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by Dadjo word, pronunciation, or English meaning..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </section>

        <section>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 max-h-[70vh] overflow-y-auto">
            {filteredEntries.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No entries found. Try a different search term.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEntries.map((entry, index) => (
                  <li key={`${entry.headword}-${entry.part_of_speech}-${index}`} className="py-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            {entry.headword}
                          </span>
                          {entry.phonetic && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              [{entry.phonetic}]
                            </span>
                          )}
                          {entry.part_of_speech && (
                            <span className="text-[10px] uppercase tracking-wide text-blue-600 dark:text-blue-400 font-semibold">
                              {entry.part_of_speech}
                            </span>
                          )}
                          {entry.plural && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              • pl. {entry.plural}
                            </span>
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
                              <p key={i}>“{ex}”</p>
                            ))}
                          </div>
                        )}
                      </div>
                      {entry.source && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {entry.source}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Dictionary

