import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWordMastery, getWordId } from '../../hooks/useWordMastery'
import { useWordMemory } from '../../hooks/useWordMemory'
import { formatTimeSince } from '../../utils/wordMemory'
import { getPrimaryGloss, getPhonetic } from '../../utils/dictionaryEntry'
import OverflowMenu from '../OverflowMenu'

const MEMORY_REFRESH_INTERVAL = 60 * 1000

/** Small labeled bar for a 1-10 memory score. */
function MemoryBar({ label, value, colorClass, title }) {
  const pct = Math.max(0, Math.min(100, ((value - 1) / 9) * 100))
  return (
    <div className="flex items-center gap-1.5" title={title}>
      <span className="text-[9px] font-bold uppercase tracking-wide text-gray-400 w-6">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden min-w-[36px]">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-semibold tabular-nums text-gray-500 dark:text-gray-400 w-6 text-right">
        {value.toFixed(1).replace(/\.0$/, '')}
      </span>
    </div>
  )
}

export default function MasteredTab({ course, languageId, dictionary }) {
  const navigate = useNavigate()
  const {
    getUniversalMasteredWords,
    addMastered,
    removeMastered,
    resetMastered,
    replaceAllMastered,
  } = useWordMastery(languageId, dictionary)

  const masteredItems = getUniversalMasteredWords()
  const masteredIdSet = useMemo(() => new Set(masteredItems.map((m) => m.id)), [masteredItems])
  const memory = useWordMemory(languageId, masteredItems.map((m) => m.id))

  // Re-render periodically so short-term memory visibly ticks down while this tab is open.
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), MEMORY_REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const searchRef = useRef(null)
  const importInputRef = useRef(null)

  useEffect(() => {
    if (showSearch && searchRef.current) searchRef.current.focus()
  }, [showSearch])

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    const results = []
    dictionary.forEach((entry, index) => {
      const id = getWordId(entry, index)
      if (masteredIdSet.has(id)) return
      const hw = (entry.headword || '').toLowerCase()
      const gloss = getPrimaryGloss(entry).toLowerCase()
      const phonetic = getPhonetic(entry).toLowerCase()
      if (hw.includes(q) || gloss.includes(q) || phonetic.includes(q)) {
        results.push({ id, entry, index })
      }
    })
    return results.slice(0, 20)
  }, [searchQuery, dictionary, masteredIdSet])

  useEffect(() => {
    setSelectedIndex(0)
  }, [searchQuery, searchResults.length])

  const handleReset = () => {
    if (!window.confirm('Clear ALL mastered words for this language? This cannot be undone.')) return
    resetMastered()
  }

  const handleExportJSON = useCallback(() => {
    let data = {}
    try {
      const stored = localStorage.getItem('languageMasteredWords')
      if (stored) data = JSON.parse(stored)
    } catch (e) {
      console.error('Export failed:', e)
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'neolingo-mastered-words.json'
    link.click()
    URL.revokeObjectURL(url)
  }, [])

  const handleImportJSON = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result)
          if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            alert('Invalid backup file format.')
            return
          }
          replaceAllMastered(parsed)
          alert('Import successful!')
        } catch {
          alert('Failed to parse the backup file.')
        }
        e.target.value = ''
      }
      reader.readAsText(file)
    },
    [replaceAllMastered]
  )

  const handleDownloadImage = () => {
    const sorted = masteredItems.slice().sort((a, b) => {
      const ha = (a.entry.headword || '').toLowerCase()
      const hb = (b.entry.headword || '').toLowerCase()
      return ha.localeCompare(hb)
    })
    const cols = 2
    const padding = 48
    const colGap = 32
    const rowGap = 24
    const cardPadding = 16
    const maxWidth = 800
    const colWidth = (maxWidth - padding * 2 - colGap * (cols - 1)) / cols

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const headH = 20
    const metaH = 16
    const cardMinH = cardPadding * 2 + headH + metaH + 4
    const rows = Math.ceil(sorted.length / cols)
    let y = padding + 34 + 8 + 18
    const rowHeights = rows.map(() => cardMinH)
    y += rowHeights.reduce((s, h) => s + h + rowGap, 0) - rowGap + padding

    canvas.width = maxWidth
    canvas.height = y
    ctx.fillStyle = '#fafafa'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#111'
    ctx.font = 'bold 28px system-ui, sans-serif'
    ctx.fillText(`${course.label} — Mastered Words`, padding, padding + 26)

    const link = document.createElement('a')
    link.download = `${course.id}-mastered-words.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const overflowItems = [
    {
      label: 'Import backup',
      onClick: () => importInputRef.current?.click(),
    },
    ...(masteredItems.length > 0
      ? [
          { label: 'Export JSON', onClick: handleExportJSON },
          { label: 'Download image', onClick: handleDownloadImage },
          { label: 'Clear all mastered', onClick: handleReset, danger: true },
        ]
      : []),
  ]

  return (
    <div className="space-y-4">
      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImportJSON}
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/flashcards/new?mode=review')}
          disabled={masteredItems.length === 0}
          className={`flex-1 px-5 py-3.5 rounded-xl text-sm font-semibold transition-colors ${
            masteredItems.length > 0
              ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-sm'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
          }`}
        >
          Review all mastered words ({masteredItems.length})
        </button>
        <OverflowMenu items={overflowItems} label="Mastered word options" />
      </div>

      {!showSearch ? (
        <button
          type="button"
          onClick={() => setShowSearch(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors w-full sm:w-auto"
        >
          Search dictionary to add words…
        </button>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchResults.length > 0) {
                  addMastered((searchResults[selectedIndex] ?? searchResults[0]).id)
                  setSearchQuery('')
                }
              }}
              placeholder="Search by word or meaning…"
              className="flex-1 bg-transparent text-sm outline-none text-gray-900 dark:text-gray-100"
            />
            <button type="button" onClick={() => { setShowSearch(false); setSearchQuery('') }} className="text-gray-400 text-sm">
              Done
            </button>
          </div>
          {searchQuery.trim() && (
            <ul className="max-h-48 overflow-y-auto">
              {searchResults.length === 0 ? (
                <li className="px-3 py-3 text-sm text-gray-400 text-center">No matches</li>
              ) : (
                searchResults.map((item, idx) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => { addMastered(item.id); setSearchQuery('') }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <span className="font-semibold">{item.entry.headword}</span>
                      <span className="text-gray-500 ml-2">{getPrimaryGloss(item.entry)}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}

      {masteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
          <p className="font-medium text-gray-700 dark:text-gray-200 mb-1">No mastered words yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Complete a flashcard session to build your collection.
          </p>
          <button
            type="button"
            onClick={() => navigate('/flashcards/new')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500"
          >
            Start a session
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {masteredItems
            .slice()
            .sort((a, b) => (a.entry.headword || '').localeCompare(b.entry.headword || ''))
            .map(({ id, entry }) => {
              const mem = memory.getMemory(id, now)
              return (
                <div
                  key={id}
                  className="group relative rounded-xl border border-green-100 dark:border-green-900/50 bg-white dark:bg-gray-800 px-3 py-2.5"
                >
                  <button
                    type="button"
                    onClick={() => removeMastered(id)}
                    className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-xs"
                    title="Remove"
                  >
                    ✕
                  </button>
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 pr-5">{entry.headword}</p>
                  {getPhonetic(entry) && (
                    <p className="text-xs text-gray-400">[{getPhonetic(entry)}]</p>
                  )}
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{getPrimaryGloss(entry)}</p>
                  {mem && (
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 space-y-1">
                      <MemoryBar
                        label="LTM"
                        value={mem.longTermMemory}
                        colorClass="bg-indigo-500"
                        title="Long-term memory: how permanent this word is in your memory"
                      />
                      <MemoryBar
                        label="STM"
                        value={mem.shortTermMemory}
                        colorClass="bg-emerald-500"
                        title="Short-term memory: how fresh your recall is right now"
                      />
                      <p className="text-[10px] text-gray-400">
                        Reviewed {formatTimeSince(mem.lastReviewedAt, now)}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
