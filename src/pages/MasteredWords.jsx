import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { dadjoDictionary } from '../data/dadjoDictionary'
import { sumerianDictionary } from '../data/sumerianDictionary'
import { useWordMastery, getWordId } from '../hooks/useWordMastery'

const COURSES = {
  dadjo: { id: 'dadjo', label: 'Dadjo', emoji: '🌍', dictionary: dadjoDictionary },
  sumerian: { id: 'sumerian', label: 'Ancient Sumerian', emoji: '𒀭', dictionary: sumerianDictionary },
}

function getSelectedCourse() {
  if (typeof localStorage === 'undefined') return COURSES.dadjo
  const stored = localStorage.getItem('selectedCourse') || 'dadjo'
  return COURSES[stored] || COURSES.dadjo
}

function getPrimaryGloss(entry) {
  if (!entry) return ''
  if (Array.isArray(entry.senses) && entry.senses.length > 0) {
    const first = entry.senses[0]
    if (typeof first === 'string') return first
    if (first && typeof first.gloss === 'string') return first.gloss
    if (first && typeof first.translation === 'string') return first.translation
  }
  if (typeof entry.gloss === 'string') return entry.gloss
  if (typeof entry.translation === 'string') return entry.translation
  return ''
}

function getPhonetic(entry) {
  if (!entry) return ''
  if (typeof entry.phonetic === 'string') return entry.phonetic
  if (typeof entry.pronunciation === 'string') return entry.pronunciation
  return ''
}

function MasteredWords() {
  const navigate = useNavigate()
  const [course, setCourse] = useState(() => getSelectedCourse())

  useEffect(() => {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('selectedCourse') : null
    if (stored && COURSES[stored]) setCourse(COURSES[stored])
  }, [])

  const languageId = course.id === 'sumerian' ? 'Sumerian' : 'Dadjo'
  const dictionary = course.dictionary || []

  const { getUniversalMasteredWords, addMastered, removeMastered, resetMastered, replaceAllMastered, stats } = useWordMastery(languageId, dictionary)
  const masteredItems = getUniversalMasteredWords()
  const masteredIdSet = useMemo(() => new Set(masteredItems.map((m) => m.id)), [masteredItems])

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
    // Reset selection when query or result set changes
    if (searchResults.length > 0) {
      setSelectedIndex(0)
    } else {
      setSelectedIndex(0)
    }
  }, [searchQuery, searchResults.length])

  const handleReset = () => {
    const confirmed = window.confirm(
      'Clear ALL mastered words for this language? This cannot be undone.'
    )
    if (!confirmed) return
    resetMastered()
  }

  const handleExportJSON = useCallback(() => {
    const MASTERED_KEY = 'languageMasteredWords'
    let data = {}
    try {
      const stored = localStorage.getItem(MASTERED_KEY)
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

  const handleImportJSON = useCallback((e) => {
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
        const isValid = Object.values(parsed).every(
          (v) => Array.isArray(v) && v.every((id) => typeof id === 'string')
        )
        if (!isValid) {
          alert('Invalid backup file: unexpected data structure.')
          return
        }
        replaceAllMastered(parsed)
        alert(`Import successful! Restored mastered words for: ${Object.keys(parsed).join(', ') || 'no languages'}`)
      } catch (err) {
        alert('Failed to parse the backup file. Make sure it is a valid JSON export.')
      }
      e.target.value = ''
    }
    reader.readAsText(file)
  }, [replaceAllMastered])

  const handleDownloadImage = () => {
    const sorted = masteredItems
      .slice()
      .sort((a, b) => {
        const ha = (a.entry.headword || '').toLowerCase()
        const hb = (b.entry.headword || '').toLowerCase()
        if (ha < hb) return -1
        if (ha > hb) return 1
        return 0
      })
    const cols = 2
    const padding = 48
    const colGap = 32
    const rowGap = 24
    const cardPadding = 16
    const titleFont = 'bold 28px system-ui, sans-serif'
    const subtitleFont = '14px system-ui, sans-serif'
    const headwordFont = 'bold 16px system-ui, sans-serif'
    const metaFont = '13px system-ui, sans-serif'
    const glossFont = '13px system-ui, sans-serif'

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const maxWidth = 800
    const colWidth = (maxWidth - padding * 2 - colGap * (cols - 1)) / cols

    // Measure row height: headword + optional phonetic + gloss + padding
    ctx.font = headwordFont
    const headH = 20
    ctx.font = metaFont
    const metaH = 16
    const cardMinH = cardPadding * 2 + headH + metaH + 4
    const rows = Math.ceil(sorted.length / cols)
    const rowHeights = []
    let y = padding
    ctx.font = titleFont
    const titleH = 34
    y += titleH + 8
    ctx.font = subtitleFont
    y += 18
    const tableTop = y
    for (let r = 0; r < rows; r++) {
      let maxH = 0
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c
        if (i >= sorted.length) break
        const item = sorted[i]
        const gloss = getPrimaryGloss(item.entry)
        const phonetic = getPhonetic(item.entry)
        maxH = Math.max(maxH, cardPadding * 2 + headH + (phonetic ? metaH : 0) + (gloss ? metaH + 2 : 0))
      }
      maxH = Math.max(maxH, cardMinH)
      rowHeights.push(maxH)
      y += maxH + rowGap
    }
    const totalH = y - rowGap + padding

    canvas.width = maxWidth
    canvas.height = totalH
    ctx.fillStyle = '#fafafa'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#111'
    ctx.font = titleFont
    ctx.fillText(`${course.label} — Mastered Words`, padding, padding + 26)
    ctx.fillStyle = '#555'
    ctx.font = subtitleFont
    ctx.fillText(
      `${sorted.length} word${sorted.length !== 1 ? 's' : ''} mastered`,
      padding,
      padding + titleH + 8 + 16
    )

    ctx.fillStyle = '#0f172a'
    y = tableTop
    for (let r = 0; r < rows; r++) {
      const rowH = rowHeights[r]
      let x = padding
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c
        if (i >= sorted.length) break
        const item = sorted[i]
        const entry = item.entry
        const headword = entry.headword || ''
        const phonetic = getPhonetic(entry)
        const gloss = getPrimaryGloss(entry)

        ctx.fillStyle = '#f8fafc'
        ctx.strokeStyle = '#e2e8f0'
        ctx.lineWidth = 1
        roundRect(ctx, x, y, colWidth, rowH, 8)
        ctx.fill()
        ctx.stroke()

        let ty = y + cardPadding + 18
        ctx.fillStyle = '#0f172a'
        ctx.font = headwordFont
        ctx.fillText(truncateText(ctx, headword, colWidth - cardPadding * 2), x + cardPadding, ty)
        ty += headH
        if (phonetic) {
          ctx.fillStyle = '#64748b'
          ctx.font = metaFont
          ctx.fillText(`[${phonetic}]`, x + cardPadding, ty)
          ty += metaH
        }
        if (gloss) {
          ctx.fillStyle = '#475569'
          ctx.font = glossFont
          const glossTrunc = truncateText(ctx, gloss, colWidth - cardPadding * 2)
          ctx.fillText(glossTrunc, x + cardPadding, ty + 2)
        }
        x += colWidth + colGap
      }
      y += rowH + rowGap
    }

    const link = document.createElement('a')
    link.download = `${course.id}-mastered-words.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  function truncateText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text
    let s = text
    while (s.length > 0 && ctx.measureText(s + '…').width > maxWidth) s = s.slice(0, -1)
    return s ? s + '…' : '…'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header variant="main" />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-4xl leading-none">{course.emoji}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {course.label} — Mastered Words
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {masteredItems.length} word{masteredItems.length !== 1 ? 's' : ''} mastered across all sessions
              </p>
              {dictionary.length > 0 && (() => {
                const milestones = [50, 100, 200, 500, 1000, 2500, 5000, 10000]
                const mastered = masteredItems.length
                const target = milestones.find((m) => m > mastered) ?? dictionary.length
                const pctOfTarget = target > 0 ? Math.min(100, (mastered / target) * 100) : 0
                const actualPct = dictionary.length > 0 ? (mastered / dictionary.length) * 100 : 0
                const barColor =
                  pctOfTarget >= 80
                    ? 'bg-green-500 dark:bg-green-500'
                    : pctOfTarget >= 50
                      ? 'bg-emerald-500 dark:bg-emerald-400'
                      : pctOfTarget >= 25
                        ? 'bg-amber-500 dark:bg-amber-400'
                        : 'bg-amber-400 dark:bg-amber-500'
                return (
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex-1 min-w-0 max-w-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {mastered} / {target} words
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                          style={{ width: `${pctOfTarget}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums shrink-0">
                      {actualPct < 0.1 && mastered > 0 ? '<0.1' : actualPct.toFixed(1)}% of dictionary
                    </span>
                  </div>
                )
              })()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* hidden file input for import */}
            <input
              ref={importInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImportJSON}
            />
            <button
              onClick={() => importInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors border border-indigo-200 dark:border-indigo-700"
              title="Import mastered words from a backup JSON file"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 5v8M8 5L5 8M8 5l3 3" />
                <path d="M2 13h12a1 1 0 001-1V9" />
              </svg>
              Import
            </button>
            {masteredItems.length > 0 && (
              <>
                <button
                  onClick={handleExportJSON}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors border border-teal-200 dark:border-teal-700"
                  title="Export mastered words as a JSON backup"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 11V3M8 11L5 8M8 11L11 8" />
                    <path d="M2 13h12a1 1 0 001-1V9" />
                  </svg>
                  Export
                </button>
                <button
                  onClick={handleDownloadImage}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-xs font-semibold text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors border border-green-200 dark:border-green-700"
                  title="Download mastered words as image"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 11V3M8 11L5 8M8 11L11 8" />
                    <path d="M2 13h12a1 1 0 001-1V9" />
                  </svg>
                  Download image
                </button>
                <button
                  onClick={handleReset}
                  className="px-3.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-xs font-semibold text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-red-200 dark:border-red-700"
                >
                  Clear all
                </button>
              </>
            )}
            <button
              onClick={() => navigate(`/brain/${course.id}`)}
              className="px-3.5 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-xs font-semibold text-violet-600 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors border border-violet-200 dark:border-violet-700"
              title="View your mastered words in 3D"
            >
              Digital Brain
            </button>
            <button
              onClick={() => navigate('/flashcards')}
              className="px-3.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-xs font-semibold text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-200 dark:border-blue-700"
            >
              Flashcard sessions
            </button>
            <button
              onClick={() => navigate('/home')}
              className="px-3.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
            >
              Home
            </button>
          </div>
        </div>

        <div className="mb-6">
          {!showSearch ? (
            <button
              onClick={() => setShowSearch(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm w-full sm:w-auto"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="7" cy="7" r="5" />
                <line x1="10.5" y1="10.5" x2="14" y2="14" />
              </svg>
              Search dictionary to add words...
            </button>
          ) : (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-gray-400 shrink-0">
                  <circle cx="7" cy="7" r="5" />
                  <line x1="10.5" y1="10.5" x2="14" y2="14" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown' && searchResults.length > 0) {
                      e.preventDefault()
                      setSelectedIndex((prev) =>
                        prev + 1 < searchResults.length ? prev + 1 : prev
                      )
                    } else if (e.key === 'ArrowUp' && searchResults.length > 0) {
                      e.preventDefault()
                      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : prev))
                    } else if (e.key === 'Enter' && searchResults.length > 0) {
                      const selected = searchResults[selectedIndex] ?? searchResults[0]
                      addMastered(selected.id)
                      setSearchQuery('')
                      searchRef.current?.focus()
                    }
                  }}
                  placeholder="Search by word, translation, or phonetic..."
                  className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                />
                <button
                  onClick={() => { setShowSearch(false); setSearchQuery('') }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="4" y1="4" x2="12" y2="12" />
                    <line x1="12" y1="4" x2="4" y2="12" />
                  </svg>
                </button>
              </div>
              {searchQuery.trim() && (
                <div className="max-h-72 overflow-y-auto">
                  {searchResults.length === 0 ? (
                    <p className="px-4 py-4 text-sm text-gray-400 dark:text-gray-500 text-center">
                      No matching words found
                    </p>
                  ) : (
                    <ul>
                      {searchResults.map((item, idx) => {
                        const gloss = getPrimaryGloss(item.entry)
                        const phonetic = getPhonetic(item.entry)
                        const isSelected = idx === selectedIndex
                        return (
                          <li
                            key={item.id}
                            onClick={() => {
                              setSelectedIndex(idx)
                              addMastered(item.id)
                              setSearchQuery('')
                              searchRef.current?.focus()
                            }}
                            className={`flex items-center justify-between gap-3 px-4 py-2.5 cursor-pointer border-b border-gray-50 dark:border-gray-700/50 last:border-b-0 transition-colors select-none ${
                              isSelected
                                ? 'bg-green-50/60 dark:bg-green-900/10 hover:bg-green-100/80 dark:hover:bg-green-900/25'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-baseline gap-2">
                                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                                  {item.entry.headword}
                                </span>
                                {phonetic && (
                                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                                    [{phonetic}]
                                  </span>
                                )}
                                {item.entry.part_of_speech && (
                                  <span className="text-[11px] italic text-gray-400 dark:text-gray-500 shrink-0">
                                    {item.entry.part_of_speech}
                                  </span>
                                )}
                              </div>
                              {gloss && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{gloss}</p>
                              )}
                            </div>
                            {isSelected && (
                              <span className="shrink-0 text-[10px] font-semibold text-green-500 dark:text-green-400 border border-green-200 dark:border-green-700 rounded px-1.5 py-0.5 tabular-nums">
                                ↵
                              </span>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {masteredItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-10 text-center shadow-sm">
            <p className="text-gray-700 dark:text-gray-200 font-medium mb-2">
              No mastered words yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Complete flashcard sessions and add mastered words to build your collection.
            </p>
            <button
              onClick={() => navigate('/flashcards/new')}
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Start a flashcard session
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {masteredItems
              .slice()
              .sort((a, b) => {
                const ha = (a.entry.headword || '').toLowerCase()
                const hb = (b.entry.headword || '').toLowerCase()
                if (ha < hb) return -1
                if (ha > hb) return 1
                return 0
              })
              .map((item) => {
                const { id, entry } = item
                const gloss = getPrimaryGloss(entry)
                const phonetic = getPhonetic(entry)
                return (
                  <div
                    key={id}
                    className="group relative bg-white dark:bg-gray-800 border border-green-100 dark:border-green-800 rounded-xl px-4 py-3 shadow-sm"
                  >
                    <button
                      onClick={() => removeMastered(id)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Remove from mastered"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="3" y1="3" x2="11" y2="11" />
                        <line x1="11" y1="3" x2="3" y2="11" />
                      </svg>
                    </button>
                    <div className="flex items-baseline justify-between gap-2 pr-6">
                      <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {entry.headword}
                      </span>
                      {entry.part_of_speech && (
                        <span className="text-[11px] italic text-gray-400 dark:text-gray-500">
                          {entry.part_of_speech}
                        </span>
                      )}
                    </div>
                    {phonetic && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">[{phonetic}]</p>
                    )}
                    {gloss && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{gloss}</p>
                    )}
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MasteredWords
