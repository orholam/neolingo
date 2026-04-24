import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { dadjoDictionary } from '../data/dadjoDictionary'
import { sumerianDictionary } from '../data/sumerianDictionary'
import { useWordMastery } from '../hooks/useWordMastery'
import { saveSession } from '../utils/flashcardSessions'

const COURSES = {
  dadjo: {
    id: 'dadjo',
    label: 'Dadjo',
    emoji: '🌍',
    dictionary: dadjoDictionary,
  },
  sumerian: {
    id: 'sumerian',
    label: 'Ancient Sumerian',
    emoji: '𒀭',
    dictionary: sumerianDictionary,
  },
}

function getSelectedCourse() {
  if (typeof localStorage === 'undefined') {
    return COURSES.dadjo
  }
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

function Flashcards() {
  const navigate = useNavigate()
  const [course, setCourse] = useState(() => getSelectedCourse())
  const [currentCard, setCurrentCard] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [history, setHistory] = useState([])
  const [answerCount, setAnswerCount] = useState(0)
  const [sessionId] = useState(() => Date.now().toString(36))

  useEffect(() => {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('selectedCourse') : null
    if (!stored || !COURSES[stored]) {
      return
    }
    setCourse(COURSES[stored])
  }, [])

  const languageId = course.id === 'sumerian' ? 'Sumerian' : 'Dadjo'
  const dictionary = course.dictionary || []

  const {
    getNextWord,
    recordResult,
    getActiveWords,
    getUniversalMasteredWords,
    commitMastered,
    startNewSession,
    startReviewSession,
    resetMastered,
    stats,
  } = useWordMastery(languageId, dictionary)

  const [reviewMode, setReviewMode] = useState(false)

  useEffect(() => {
    if (!dictionary.length) return
    const next = getNextWord()
    if (next) {
      setCurrentCard(next)
      setShowAnswer(false)
    }
  }, [dictionary, getNextWord])

  const handleShowAnswer = () => {
    setShowAnswer(true)
  }

  const handleResult = (wasCorrect) => {
    if (!currentCard) return
    recordResult(currentCard.id, wasCorrect)
    setAnswerCount((c) => c + 1)
    const next = getNextWord()
    if (next) {
      setCurrentCard(next)
      setShowAnswer(false)
    } else {
      setCurrentCard(null)
      setShowAnswer(false)
    }
  }

  const activeWords = getActiveWords()
  const strugglingWords = activeWords.filter((word) => (word.mastery ?? 0) < 0)
  const masteredWordItems = activeWords.filter((word) => (word.mastery ?? 0) >= 5)
  const inProgressWords = activeWords.filter((word) => {
    const m = word.mastery ?? 0
    return m >= 0 && m < 5
  })

  const handleSelectWord = (wordId) => {
    const found = activeWords.find((word) => word.id === wordId)
    if (!found) return
    setCurrentCard(found)
    setShowAnswer(false)
  }

  const handleCommitAndNewSession = () => {
    if (!reviewMode && stats.totalActive > 0) {
      const active = getActiveWords()
      const wordIndices = active
        .map((w) => (w.entry && typeof w.entry.__index === 'number' ? w.entry.__index : null))
        .filter((idx) => idx !== null)

      saveSession(languageId, {
        id: sessionId,
        languageId,
        createdAt: Date.now(),
        wordIndices,
        history,
        passes: answerCount,
      })
    }

    commitMastered()
    setHistory([])
    setAnswerCount(0)
    setCurrentCard(null)
    setShowAnswer(false)
    setReviewMode(false)
    startNewSession()
  }

  const handleNewSession = () => {
    setHistory([])
    setAnswerCount(0)
    setCurrentCard(null)
    setShowAnswer(false)
    setReviewMode(false)
    startNewSession()
  }

  const handleStartReview = () => {
    setHistory([])
    setAnswerCount(0)
    setCurrentCard(null)
    setShowAnswer(false)
    setReviewMode(true)
    startReviewSession()
  }

  const handleResetMastered = () => {
    const confirmed = window.confirm(
      'Clear ALL mastered words for this language? This cannot be undone.'
    )
    if (!confirmed) return
    resetMastered()
    setHistory([])
    setAnswerCount(0)
    setCurrentCard(null)
    setShowAnswer(false)
    setReviewMode(false)
    startNewSession()
  }

  const totalScore = activeWords.reduce(
    (sum, word) => sum + (word.mastery ?? 0),
    0
  )

  const sCount = strugglingWords.length
  const pCount = inProgressWords.length
  const mCount = masteredWordItems.length

  useEffect(() => {
    setHistory((prev) => {
      const nextPoint = {
        score: totalScore,
        struggling: sCount,
        inProgress: pCount,
        mastered: mCount,
      }
      if (prev.length > 0) {
        const last = prev[prev.length - 1]
        if (
          last.score === nextPoint.score &&
          last.struggling === nextPoint.struggling &&
          last.inProgress === nextPoint.inProgress &&
          last.mastered === nextPoint.mastered
        ) {
          return prev
        }
      }
      return [...prev, nextPoint]
    })
  }, [totalScore, sCount, pCount, mCount])

  const renderHistoryGraph = () => {
    if (history.length === 0) return null

    const padL = 32
    const padR = 8
    const padT = 8
    const padB = 4
    const plotW = 320
    const plotH = 120
    const svgW = padL + plotW + padR
    const svgH = padT + plotH + padB

    const scores = history.map((h) => h.score)
    const minVal = scores.reduce((min, v) => Math.min(min, v, 0), 0)
    const maxVal = scores.reduce((max, v) => Math.max(max, v, 0), 0)
    const range = maxVal - minVal || 1
    const denom = Math.max(scores.length - 1, 1)

    const toX = (i) => padL + (i / denom) * plotW
    const toY = (v) => padT + plotH - ((v - minVal) / range) * plotH

    const coords = scores.map((v, i) => ({ x: toX(i), y: toY(v) }))
    if (coords.length === 1) coords.push({ ...coords[0] })

    const linePoints = coords.map((c) => `${c.x},${c.y}`).join(' ')

    const lastValue = scores[scores.length - 1]
    const lineColor = lastValue >= 0 ? '#22c55e' : '#ef4444'

    let zeroY = toY(0)
    if (!Number.isFinite(zeroY)) zeroY = padT + plotH / 2
    zeroY = Math.max(padT, Math.min(padT + plotH, zeroY))

    const fillPoints =
      `${padL},${zeroY} ` +
      linePoints +
      ` ${coords[coords.length - 1].x},${zeroY}`

    const last = coords[coords.length - 1]

    return (
      <svg
        width="100%"
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="mt-4"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#22c55e" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#ef4444" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        <polygon
          points={fillPoints}
          fill="url(#fillGrad)"
        />

        <line
          x1={padL}
          y1={padT}
          x2={padL}
          y2={padT + plotH}
          stroke="#d1d5db"
          strokeWidth="0.5"
        />

        <line
          x1={padL}
          y1={zeroY}
          x2={padL + plotW}
          y2={zeroY}
          stroke="#9ca3af"
          strokeWidth="0.5"
          strokeDasharray="4 2"
        />
        <text
          x={padL - 3}
          y={zeroY}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize="7"
          fill="#9ca3af"
        >
          0
        </text>

        {maxVal !== 0 && (
          <text
            x={padL - 3}
            y={padT + 3}
            textAnchor="end"
            dominantBaseline="hanging"
            fontSize="7"
            fill="#9ca3af"
          >
            {maxVal}
          </text>
        )}
        {minVal !== 0 && (
          <text
            x={padL - 3}
            y={padT + plotH - 1}
            textAnchor="end"
            dominantBaseline="auto"
            fontSize="7"
            fill="#9ca3af"
          >
            {minVal}
          </text>
        )}

        <polyline
          points={linePoints}
          fill="none"
          stroke={lineColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <circle
          cx={last.x}
          cy={last.y}
          r="2.5"
          fill={lineColor}
        />
        <text
          x={last.x}
          y={last.y - 5}
          textAnchor="middle"
          dominantBaseline="auto"
          fontSize="7"
          fontWeight="bold"
          fill={lineColor}
        >
          {lastValue}
        </text>
      </svg>
    )
  }

  const renderBucketChart = () => {
    if (history.length === 0) return null

    const padL = 4
    const padR = 4
    const padT = 4
    const padB = 4
    const plotW = 340
    const plotH = 80
    const svgW = padL + plotW + padR
    const svgH = padT + plotH + padB
    const denom = Math.max(history.length - 1, 1)
    const barW = plotW / Math.max(history.length, 1)

    const bars = history.map((h, i) => {
      const total = h.struggling + h.inProgress + h.mastered
      if (total === 0) return { x: padL + (i / denom) * plotW, s: 0, p: 0, m: 0 }
      const sPct = h.struggling / total
      const pPct = h.inProgress / total
      const mPct = h.mastered / total
      return {
        x: padL + (i / denom) * plotW,
        s: sPct * plotH,
        p: pPct * plotH,
        m: mPct * plotH,
      }
    })

    const buildAreaPath = (getY0, getY1) => {
      const top = bars.map((b, i) => `${i === 0 ? 'M' : 'L'}${b.x},${padT + getY0(b)}`)
      const bot = bars
        .slice()
        .reverse()
        .map((b, i) => `${i === 0 ? 'L' : 'L'}${b.x},${padT + getY1(b)}`)
      return top.join(' ') + ' ' + bot.join(' ') + ' Z'
    }

    const masteredPath = buildAreaPath(
      () => 0,
      (b) => b.m
    )
    const inProgressPath = buildAreaPath(
      (b) => b.m,
      (b) => b.m + b.p
    )
    const strugglingPath = buildAreaPath(
      (b) => b.m + b.p,
      () => plotH
    )

    const lastH = history[history.length - 1]
    const lastTotal = lastH.struggling + lastH.inProgress + lastH.mastered
    const sPct = lastTotal > 0 ? Math.round((lastH.struggling / lastTotal) * 100) : 0
    const pPct = lastTotal > 0 ? Math.round((lastH.inProgress / lastTotal) * 100) : 0
    const mPct = lastTotal > 0 ? Math.round((lastH.mastered / lastTotal) * 100) : 0

    return (
      <>
        <svg
          width="100%"
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="mt-4"
          preserveAspectRatio="xMidYMid meet"
        >
          <path d={masteredPath} fill="#22c55e" opacity="0.7" />
          <path d={inProgressPath} fill="#f59e0b" opacity="0.6" />
          <path d={strugglingPath} fill="#ef4444" opacity="0.6" />
        </svg>
        <div className="flex items-center gap-4 mt-2.5 text-[11px] font-medium">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-500 dark:text-gray-400">Struggling {sPct}%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-gray-500 dark:text-gray-400">In progress {pPct}%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-500 dark:text-gray-400">Mastered {mPct}%</span>
          </span>
        </div>
      </>
    )
  }

  if (!course || !dictionary.length) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header variant="main" />
        <div className="max-w-3xl mx-auto px-4 pt-24 pb-10">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Flashcards
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Choose a course on the home page to start using flashcards for that language.
            </p>
            <button
              onClick={() => navigate('/home')}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const entry = currentCard ? currentCard.entry : null
  const gloss = getPrimaryGloss(entry)
  const phonetic = getPhonetic(entry)
  const masteryValue =
    currentCard && typeof currentCard.mastery === 'number' ? currentCard.mastery : 0
  const isReversed = masteryValue >= 3 && masteryValue < 5
  const isStrugglingStatus = masteryValue < 0
  const statusLabel = isStrugglingStatus
    ? 'Struggling'
    : isReversed
      ? 'Reverse'
      : masteryValue >= 5
        ? 'Mastered'
        : 'In progress'
  const statusClass = isStrugglingStatus
    ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 border-red-200 dark:border-red-700'
    : isReversed
      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200 border-purple-200 dark:border-purple-700'
      : masteryValue >= 5
        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200 border-green-200 dark:border-green-700'
        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 border-amber-200 dark:border-amber-700'

  const progressPct = stats.totalActive > 0
    ? Math.round((masteredWordItems.length / stats.totalActive) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header variant="main" />

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-10 flex flex-col lg:flex-row gap-10">
        <div className="flex-1 space-y-5">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl leading-none">{course.emoji}</span>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                    {course.label} Flashcards
                  </h1>
                  {reviewMode && (
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                      Review mode
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {reviewMode ? 'Reviewing mastered words — no impact on mastery' : 'Practice vocabulary with spaced mastery'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleNewSession}
                className="px-3.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-xs font-semibold text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-200 dark:border-blue-700"
              >
                New session
              </button>
              <button
                onClick={handleStartReview}
                disabled={stats.totalUniversalMastered === 0}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                  stats.totalUniversalMastered > 0
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 border-purple-200 dark:border-purple-700'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                }`}
              >
                Review mastered
              </button>
              <button
                onClick={() => navigate('/mastered')}
                className="px-3.5 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-xs font-semibold text-green-600 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors border border-green-200 dark:border-green-700"
              >
                Mastered list
              </button>
              <button
                onClick={handleResetMastered}
                className="px-3.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-xs font-semibold text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-red-200 dark:border-red-700"
              >
                Reset mastered
              </button>
              <button
                onClick={() => navigate('/home')}
                className="px-3.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
              >
                Home
              </button>
            </div>
          </div>

          {/* Stats ribbon */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <span className="text-xs text-gray-500 dark:text-gray-400">Session</span>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums">{stats.totalActive}</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <span className="text-xs text-gray-500 dark:text-gray-400">Session done</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400 tabular-nums">{stats.totalSessionMastered}/{stats.totalActive}</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <span className="text-xs text-gray-500 dark:text-gray-400">Total mastered</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">{stats.totalUniversalMastered}</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400 tabular-nums">{progressPct}%</span>
            </div>
          </div>

          {/* Flashcard */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-sm">
            {stats.allSessionMastered && stats.totalActive > 0 && (
              <div className="text-center py-16 space-y-4">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {reviewMode ? 'Review complete!' : 'Session complete!'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You mastered all {stats.totalActive} words in this {reviewMode ? 'review' : 'session'}.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  {reviewMode ? (
                    <>
                      <button
                        onClick={handleStartReview}
                        className="px-6 py-3 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 active:scale-[0.98] transition-all shadow-sm"
                      >
                        Review more
                      </button>
                      <button
                        onClick={handleNewSession}
                        className="px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm"
                      >
                        Back to learning
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleCommitAndNewSession}
                      className="px-6 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 active:scale-[0.98] transition-all shadow-sm"
                    >
                      Add to mastered &amp; start new session
                    </button>
                  )}
                </div>
              </div>
            )}

            {!entry && !stats.allSessionMastered && (
              <div className="text-center py-16">
                <p className="text-gray-700 dark:text-gray-200 font-medium mb-2">
                  No words available
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  All words may already be mastered, or the dictionary is empty.
                </p>
                <button
                  onClick={handleNewSession}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Start new session
                </button>
              </div>
            )}

            {entry && (
              <>
                <div className="mb-8">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      {isReversed ? 'Translation' : 'Word'}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border ${statusClass}`}
                    >
                      {statusLabel} &middot; {masteryValue}
                    </span>
                  </div>

                  {isReversed ? (
                    <>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                        {gloss || 'No gloss available'}
                      </p>
                      {entry.part_of_speech && (
                        <p className="mt-1.5 text-sm italic text-gray-500 dark:text-gray-400">
                          {entry.part_of_speech}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                          {entry.headword}
                        </span>
                        {phonetic && (
                          <span className="text-lg text-gray-400 dark:text-gray-500">
                            [{phonetic}]
                          </span>
                        )}
                      </div>
                      {entry.part_of_speech && (
                        <p className="mt-1.5 text-sm italic text-gray-500 dark:text-gray-400">
                          {entry.part_of_speech}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="mb-8 min-h-[60px]">
                  {!showAnswer ? (
                    <button
                      onClick={handleShowAnswer}
                      className="px-8 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm"
                    >
                      {isReversed ? 'Show word' : 'Show answer'}
                    </button>
                  ) : isReversed ? (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        Word
                      </p>
                      <div className="flex items-baseline gap-3">
                        <span className="text-xl text-gray-900 dark:text-gray-100 font-medium">
                          {entry.headword}
                        </span>
                        {phonetic && (
                          <span className="text-base text-gray-400 dark:text-gray-500">
                            [{phonetic}]
                          </span>
                        )}
                      </div>
                      {Array.isArray(entry.examples) && entry.examples.length > 0 && (
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                            Example
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                            {entry.examples[0]}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        Meaning
                      </p>
                      <p className="text-xl text-gray-900 dark:text-gray-100 font-medium">
                        {gloss || 'No gloss available'}
                      </p>
                      {Array.isArray(entry.examples) && entry.examples.length > 0 && (
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                            Example
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                            {entry.examples[0]}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => handleResult(false)}
                    disabled={!showAnswer}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                      showAnswer
                        ? 'border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-[0.98]'
                        : 'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    I got it wrong
                  </button>
                  <button
                    onClick={() => handleResult(true)}
                    disabled={!showAnswer}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      showAnswer
                        ? 'bg-green-600 text-white hover:bg-green-700 active:scale-[0.98] shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    I got it right
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Score history */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Score history
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Sum of all word scores this session
                </p>
              </div>
              <span
                className={`text-2xl font-bold tabular-nums leading-none ${
                  totalScore >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {totalScore >= 0 ? '+' : ''}{totalScore}
              </span>
            </div>
            {renderHistoryGraph()}
          </div>

          {/* Bucket breakdown */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Bucket breakdown
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Proportion of words in each bucket over time
            </p>
            {renderBucketChart()}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-5">
          {/* Struggling */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 shadow-sm max-h-[240px] flex flex-col">
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2.5 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
              Struggling ({strugglingWords.length})
            </h2>
            {strugglingWords.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                Words you mark wrong will appear here. Click any to review.
              </p>
            ) : (
              <div className="space-y-1.5 overflow-y-auto pr-1">
                {strugglingWords
                  .slice()
                  .sort((a, b) => {
                    const ha = (a.entry.headword || '').toLowerCase()
                    const hb = (b.entry.headword || '').toLowerCase()
                    if (ha < hb) return -1
                    if (ha > hb) return 1
                    return 0
                  })
                  .map((word) => {
                    const phoneticItem = getPhonetic(word.entry)
                    return (
                      <button
                        type="button"
                        key={word.id}
                        onClick={() => handleSelectWord(word.id)}
                        className="w-full text-left px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                            {word.entry.headword}
                          </span>
                          <span className="text-[10px] font-bold text-red-500 dark:text-red-400 tabular-nums shrink-0">
                            {word.mastery}
                          </span>
                        </div>
                        {phoneticItem && (
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                            [{phoneticItem}]
                          </p>
                        )}
                      </button>
                    )
                  })}
              </div>
            )}
          </div>

          {/* In-progress */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 shadow-sm max-h-[240px] flex flex-col">
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2.5 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
              In progress ({inProgressWords.length})
            </h2>
            {inProgressWords.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                Words with partial mastery will appear here. Darker = higher score.
              </p>
            ) : (
              <div className="space-y-1.5 overflow-y-auto pr-1">
                {inProgressWords
                  .slice()
                  .sort((a, b) => b.mastery - a.mastery)
                  .map((word) => {
                    const phoneticItem = getPhonetic(word.entry)
                    const m = word.mastery ?? 0
                    const shadeClass =
                      m >= 3
                        ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700'
                        : m >= 2
                          ? 'bg-amber-200 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700'
                          : m >= 1
                            ? 'bg-amber-100 dark:bg-amber-900/25 border-amber-200 dark:border-amber-700'
                            : 'bg-amber-50 dark:bg-amber-900/15 border-amber-100 dark:border-amber-800'
                    return (
                      <button
                        type="button"
                        key={word.id}
                        onClick={() => handleSelectWord(word.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg border hover:brightness-95 dark:hover:brightness-125 transition-all ${shadeClass}`}
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                            {word.entry.headword}
                          </span>
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 tabular-nums shrink-0">
                            {word.mastery}
                          </span>
                        </div>
                        {phoneticItem && (
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                            [{phoneticItem}]
                          </p>
                        )}
                      </button>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Mastered */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 shadow-sm max-h-[240px] flex flex-col">
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2.5 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
              Mastered ({masteredWordItems.length})
            </h2>
            {masteredWordItems.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                Session-mastered words (score 5) will appear here.
              </p>
            ) : (
              <div className="space-y-1.5 overflow-y-auto pr-1">
                {masteredWordItems
                  .slice()
                  .sort((a, b) => {
                    const ha = (a.entry.headword || '').toLowerCase()
                    const hb = (b.entry.headword || '').toLowerCase()
                    if (ha < hb) return -1
                    if (ha > hb) return 1
                    return 0
                  })
                  .map((word) => {
                    const phoneticItem = getPhonetic(word.entry)
                    return (
                      <button
                        type="button"
                        key={word.id}
                        onClick={() => handleSelectWord(word.id)}
                        className="w-full text-left px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/15 border border-green-100 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                            {word.entry.headword}
                          </span>
                          <span className="text-[10px] font-bold text-green-600 dark:text-green-400 tabular-nums shrink-0">
                            {word.mastery}
                          </span>
                        </div>
                        {phoneticItem && (
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                            [{phoneticItem}]
                          </p>
                        )}
                      </button>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Flashcards

