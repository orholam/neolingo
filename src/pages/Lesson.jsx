import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getExercisesForLesson } from '../data/exerciseData'
import { useProgress } from '../hooks/useProgress'
import { useStreak } from '../hooks/useStreak'
import { useHearts } from '../hooks/useHearts'
import { useGems } from '../hooks/useGems'
import Header from '../components/Header'
import { getExerciseComponent } from '../utils/exerciseFactory'
import { validateAnswer, getFeedbackMessage } from '../utils/validation'

function Lesson() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const lessonId = parseInt(searchParams.get('lessonId')) || 1
  const lessonName = searchParams.get('lessonName') || 'Basics 1'

  const { addXP, addMistake, completeLesson } = useProgress()
  const { updateStreak } = useStreak()
  const { hearts, loseHeart, refillHearts, hasHearts } = useHearts()
  const { gems, spendGems, canAfford, earnGemsForLesson } = useGems()

  const exercises = getExercisesForLesson(lessonId)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [xp, setXp] = useState(0)
  const [showCompletion, setShowCompletion] = useState(false)
  const [resultState, setResultState] = useState({})
  const autoAdvanceTimerRef = useRef(null)
  const exercisesRef = useRef(exercises)
  const lessonIdRef = useRef(lessonId)

  useEffect(() => {
    exercisesRef.current = exercises
    lessonIdRef.current = lessonId
  }, [exercises, lessonId])

  const currentExercise = exercises[currentExerciseIndex]

  useEffect(() => {
    setShowResult(false)
    setIsCorrect(false)
    setResultState({})
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current)
      autoAdvanceTimerRef.current = null
    }
  }, [currentExerciseIndex])

  useEffect(() => {
    if (showResult && !showCompletion) {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current)
      autoAdvanceTimerRef.current = setTimeout(() => {
        setCurrentExerciseIndex((prev) => {
          const nextIndex = prev + 1
          if (nextIndex < exercisesRef.current.length) return nextIndex
          completeLesson(lessonIdRef.current)
          updateStreak()
          earnGemsForLesson()
          setShowCompletion(true)
          return prev
        })
        autoAdvanceTimerRef.current = null
      }, 2000)
      return () => {
        if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current)
      }
    }
  }, [showResult, showCompletion, completeLesson, updateStreak])

  const handleAnswer = (answerData) => {
    if (showResult) return
    const { isCorrect: correct, userAnswer, skipped } = answerData
    setIsCorrect(correct)
    setShowResult(true)
    if (currentExercise.type === 'multiple-choice' || currentExercise.type === 'fill-blank') {
      setResultState({ showResult: true, isCorrect: correct, selectedAnswer: userAnswer })
    }
    if (correct && !skipped) {
      const xpGained = currentExercise.xp || 10
      setXp((prev) => prev + xpGained)
      addXP(xpGained)
    } else if (!correct && !skipped) {
      loseHeart()
      addMistake(lessonId, currentExerciseIndex, currentExercise.type)
    }
  }

  const progress = ((currentExerciseIndex + 1) / exercises.length) * 100

  const handleRefillHearts = () => {
    if (canAfford(100)) { spendGems(100); refillHearts() }
  }

  if (!hasHearts()) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">💔</div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Out of Hearts!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Don't worry, practice makes perfect!</p>
          {canAfford(100) ? (
            <div className="space-y-3">
              <button onClick={handleRefillHearts}
                className="w-full bg-duo-green hover:bg-duo-green-dark text-white font-bold py-4 rounded-lg transition-colors">
                Refill Hearts (100 💎)
              </button>
              <button onClick={() => navigate('/home')}
                className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-4 rounded-lg transition-colors">
                Return to Home
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/home')}
              className="w-full bg-duo-green hover:bg-duo-green-dark text-white font-bold py-4 rounded-lg transition-colors">
              Return to Home
            </button>
          )}
        </div>
      </div>
    )
  }

  if (showCompletion) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Lesson Complete!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{lessonName}</p>
          <div className="bg-duo-green/10 dark:bg-duo-green/20 rounded-xl p-6 mb-6">
            <div className="text-4xl font-bold text-duo-green mb-2">+{xp} XP</div>
            <p className="text-gray-600 dark:text-gray-400">Great job!</p>
          </div>
          <button onClick={() => navigate('/home')}
            className="w-full bg-duo-green hover:bg-duo-green-dark text-white font-bold py-4 rounded-lg transition-colors shadow-lg">
            Continue
          </button>
        </div>
      </div>
    )
  }

  if (!currentExercise) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading exercise...</p>
      </div>
    )
  }

  const ExerciseComponent = getExerciseComponent(currentExercise.type)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header variant="simple" showHearts hearts={hearts} maxHearts={5} />

      <div className="max-w-4xl mx-auto px-4 pt-24 pb-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {currentExerciseIndex + 1} / {exercises.length}
            </span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{xp} XP</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div className="bg-duo-green h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6">
            {currentExercise.question}
          </h2>
          {currentExercise.text && currentExercise.type !== 'fill-blank' && (
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center py-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              {currentExercise.text}
            </div>
          )}
          {ExerciseComponent && (
            <ExerciseComponent
              exercise={currentExercise}
              onAnswer={handleAnswer}
              disabled={showResult}
              {...resultState}
            />
          )}
          {showResult && (
            <div className={`mt-6 p-4 rounded-lg text-center ${
              isCorrect
                ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200'
            }`}>
              <div className="text-4xl mb-2">{isCorrect ? '🎉' : '❌'}</div>
              <p className="font-bold text-lg">{getFeedbackMessage(currentExercise, isCorrect)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Lesson
