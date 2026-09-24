import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import FocusHeader from '../components/FocusHeader'
import FocusPageContent from '../components/FocusPageContent'
import FlashcardSessionLayout from '../components/flashcards/FlashcardSessionLayout'
import { getCourse, getLanguageId } from '../data/courses'
import { useSelectedLanguage } from '../contexts/LanguageContext'
import { useWordMastery } from '../hooks/useWordMastery'
import { useWordMemory } from '../hooks/useWordMemory'
import { saveSession } from '../utils/flashcardSessions'

function Flashcards() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const reviewMode = searchParams.get('mode') === 'review'
  const { selectedCourseId } = useSelectedLanguage()
  const course = getCourse(selectedCourseId)

  const [currentCard, setCurrentCard] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [history, setHistory] = useState([])
  const [answerCount, setAnswerCount] = useState(0)
  const [sessionId] = useState(() => Date.now().toString(36))
  const [initialized, setInitialized] = useState(false)
  // Debug control: how many words a review session pulls in. Defaults to 20
  // to match the normal review session size.
  const [reviewSessionSize, setReviewSessionSize] = useState(20)

  const languageId = getLanguageId(course.id)
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
  } = useWordMastery(languageId, dictionary, {
    // Reviews now feed the long/short-term memory model: memory is declared
    // just below, but this callback is only ever invoked later (after a
    // "Right"/"Wrong" tap), by which point it's assigned.
    onWordCompleted: (wordId, { incorrectCount }) => {
      if (reviewMode) {
        memory.recordReviewCompletion(wordId, { struggled: incorrectCount > 0 })
      }
    },
    reviewSessionSize,
  })

  const masteredWordIds = getUniversalMasteredWords().map((w) => w.id)
  const memory = useWordMemory(languageId, masteredWordIds)

  useEffect(() => {
    setInitialized(false)
    setCurrentCard(null)
    setShowAnswer(false)
    setHistory([])
    setAnswerCount(0)
  }, [selectedCourseId, reviewMode])

  useEffect(() => {
    if (!dictionary.length || initialized) return
    if (reviewMode) {
      startReviewSession()
    } else {
      startNewSession()
    }
    setInitialized(true)
  }, [dictionary, initialized, reviewMode, startNewSession, startReviewSession, selectedCourseId])

  // Debug: restart the review session whenever the debug slider changes the
  // session size (skip the very first render, that's handled above).
  const reviewSessionSizeInit = useRef(true)
  useEffect(() => {
    if (reviewSessionSizeInit.current) {
      reviewSessionSizeInit.current = false
      return
    }
    if (!reviewMode || !initialized) return
    setHistory([])
    setAnswerCount(0)
    setCurrentCard(null)
    setShowAnswer(false)
    startReviewSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewSessionSize])

  useEffect(() => {
    if (!initialized || currentCard || stats.totalActive === 0) return
    const next = getNextWord()
    if (next) {
      setCurrentCard(next)
      setShowAnswer(false)
    }
  }, [initialized, stats.totalActive, currentCard, getNextWord])

  const activeWords = getActiveWords()
  const masteredInSession = activeWords.filter((w) => (w.mastery ?? 0) >= 5).length
  const sCount = activeWords.filter((w) => (w.mastery ?? 0) < 0).length
  const pCount = activeWords.filter((w) => {
    const m = w.mastery ?? 0
    return m >= 0 && m < 5
  }).length
  const totalScore = activeWords.reduce((sum, w) => sum + (w.mastery ?? 0), 0)

  useEffect(() => {
    setHistory((prev) => {
      const nextPoint = {
        score: totalScore,
        struggling: sCount,
        inProgress: pCount,
        mastered: masteredInSession,
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
  }, [totalScore, sCount, pCount, masteredInSession])

  const handleSelectWord = (wordId) => {
    const found = activeWords.find((word) => word.id === wordId)
    if (!found) return
    setCurrentCard(found)
    setShowAnswer(false)
  }

  const handleResult = (wasCorrect) => {
    if (!currentCard) return
    recordResult(currentCard.id, wasCorrect)
    setAnswerCount((c) => c + 1)
    const next = getNextWord()
    setCurrentCard(next)
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
    const newlyMasteredIds = commitMastered()
    if (newlyMasteredIds && newlyMasteredIds.length) {
      memory.markFresh(newlyMasteredIds)
    }
    setHistory([])
    setAnswerCount(0)
    setCurrentCard(null)
    setShowAnswer(false)
    startNewSession()
    navigate('/flashcards/new', { replace: true })
  }

  const handleReviewAgain = () => {
    setHistory([])
    setAnswerCount(0)
    setCurrentCard(null)
    setShowAnswer(false)
    startReviewSession()
    const next = getNextWord()
    if (next) setCurrentCard(next)
  }

  const handleLearnNew = () => {
    setHistory([])
    setAnswerCount(0)
    setCurrentCard(null)
    setShowAnswer(false)
    startNewSession()
    navigate('/flashcards/new', { replace: true })
  }

  const handleResetMastered = () => {
    if (!window.confirm('Clear ALL mastered words for this language? This cannot be undone.')) return
    resetMastered()
    navigate('/flashcards')
  }

  const handleEndSession = () => {
    if (window.confirm('End this session and return to Vocabulary?')) {
      navigate('/flashcards')
    }
  }

  if (!dictionary.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <FocusHeader title="Flashcards" backLabel="← Back to Vocabulary" backPath="/flashcards" />
        <FocusPageContent>
          <div className="max-w-lg mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Choose a language to start flashcards.</p>
          <button
            type="button"
            onClick={() => navigate('/languages')}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
          >
            Choose language
          </button>
          </div>
        </FocusPageContent>
      </div>
    )
  }

  const overflowItems = [
    { label: 'End session', onClick: handleEndSession },
    { label: 'Clear all mastered', onClick: handleResetMastered, danger: true },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <FocusHeader
        title={reviewMode ? `${course.label} · Review` : `${course.label} · New session`}
        backLabel="← Back to Vocabulary"
        backPath="/flashcards"
      />

      <FocusPageContent>
        {reviewMode && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-3">
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 shrink-0">
                Debug
              </span>
              <label htmlFor="review-session-size" className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                Review size
              </label>
              <input
                id="review-session-size"
                type="range"
                min={5}
                max={100}
                step={5}
                value={reviewSessionSize}
                onChange={(e) => setReviewSessionSize(Number(e.target.value))}
                className="flex-1 accent-indigo-600"
              />
              <span className="text-xs font-semibold tabular-nums text-gray-700 dark:text-gray-300 w-8 text-right shrink-0">
                {reviewSessionSize}
              </span>
            </div>
          </div>
        )}
        <FlashcardSessionLayout
          reviewMode={reviewMode}
          course={course}
          currentCard={currentCard}
          showAnswer={showAnswer}
          stats={stats}
          history={history}
          activeWords={activeWords}
          totalScore={totalScore}
          onShowAnswer={() => setShowAnswer(true)}
          onResult={handleResult}
          onSelectWord={handleSelectWord}
          onCompletePrimary={handleCommitAndNewSession}
          onReviewAgain={handleReviewAgain}
          onLearnNew={handleLearnNew}
          onStartNew={() => startNewSession()}
          overflowItems={overflowItems}
        />
      </FocusPageContent>
    </div>
  )
}

export default Flashcards
