import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import FocusHeader from '../components/FocusHeader'
import FocusPageContent from '../components/FocusPageContent'
import FlashcardSessionLayout from '../components/flashcards/FlashcardSessionLayout'
import { getCourse, getLanguageId } from '../data/courses'
import { useSelectedLanguage } from '../contexts/LanguageContext'
import { getSession, saveSession } from '../utils/flashcardSessions'

function FlashcardSessionPractice() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { selectedCourseId } = useSelectedLanguage()
  const course = getCourse(selectedCourseId)

  const [session, setSession] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [localStates, setLocalStates] = useState({})
  const [history, setHistory] = useState([])

  const languageId = getLanguageId(course.id)
  const dictionary = course.dictionary || []

  useEffect(() => {
    const s = getSession(languageId, sessionId)
    setSession(s || null)
    setCurrentIndex(0)
    setShowAnswer(false)
    setLocalStates({})
    setHistory([])
  }, [languageId, sessionId, selectedCourseId])

  const words = useMemo(() => {
    if (!session || !Array.isArray(session.wordIndices)) return []
    return session.wordIndices
      .map((idx) => dictionary[idx])
      .filter(Boolean)
      .map((entry, idx) => ({ id: `${session.id}::${idx}`, entry }))
  }, [session, dictionary])

  const activeWords = useMemo(
    () =>
      words.map((w) => {
        const st = localStates[w.id] || { mastery: 0 }
        return { id: w.id, entry: w.entry, mastery: st.mastery ?? 0 }
      }),
    [words, localStates]
  )

  const currentWord = words[currentIndex] || null
  const currentCard = currentWord
    ? {
        id: currentWord.id,
        entry: currentWord.entry,
        mastery: localStates[currentWord.id]?.mastery ?? 0,
      }
    : null

  const totalActive = words.length
  const totalSessionMastered = activeWords.filter((w) => (w.mastery ?? 0) >= 5).length
  const allSessionMastered = totalActive > 0 && totalSessionMastered === totalActive
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
        mastered: totalSessionMastered,
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
  }, [totalScore, sCount, pCount, totalSessionMastered])

  const stats = {
    totalActive,
    totalSessionMastered,
    totalUniversalMastered: 0,
    allSessionMastered,
  }

  const handleSelectWord = (wordId) => {
    const idx = words.findIndex((w) => w.id === wordId)
    if (idx < 0) return
    setCurrentIndex(idx)
    setShowAnswer(false)
  }

  const handleResult = (wasCorrect) => {
    if (!currentWord) return
    setLocalStates((prev) => {
      const existing = prev[currentWord.id] || { mastery: 0 }
      const nextMastery = wasCorrect ? Math.min(5, (existing.mastery || 0) + 1) : -1
      return { ...prev, [currentWord.id]: { ...existing, mastery: nextMastery } }
    })

    if (session) {
      const newPasses = (session.passes ?? 0) + 1
      saveSession(languageId, { ...session, passes: newPasses })
      setSession((prev) => (prev ? { ...prev, passes: newPasses } : prev))
    }

    const nextIdx = (currentIndex + 1) % Math.max(words.length, 1)
    setCurrentIndex(nextIdx)
    setShowAnswer(false)
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <FocusHeader title="Session replay" backLabel="← Back to Vocabulary" backPath="/flashcards?tab=history" />
        <FocusPageContent>
          <div className="max-w-lg mx-auto text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">This session could not be found.</p>
            <button
              type="button"
              onClick={() => navigate('/flashcards?tab=history')}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
            >
              Back to history
            </button>
          </div>
        </FocusPageContent>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <FocusHeader
        title={`${course.label} · Session replay`}
        backLabel="← Back to Vocabulary"
        backPath="/flashcards?tab=history"
      />
      <FocusPageContent>
        <FlashcardSessionLayout
          replayMode
          bannerText="Replay mode — progress is not saved to your collection"
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
          onCompletePrimary={() => navigate('/flashcards?tab=history')}
          onReviewAgain={() => {
            setCurrentIndex(0)
            setShowAnswer(false)
            setLocalStates({})
            setHistory([])
          }}
          overflowItems={[
            { label: 'Back to history', onClick: () => navigate('/flashcards?tab=history') },
          ]}
        />
      </FocusPageContent>
    </div>
  )
}

export default FlashcardSessionPractice
