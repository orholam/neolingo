import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getStoryById } from '../data/storyData'
import { useProgress } from '../hooks/useProgress'
import { useStreak } from '../hooks/useStreak'
import Header from '../components/Header'
import Story from '../components/Story'

function StoryPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const storyId = parseInt(searchParams.get('storyId')) || 1

  const { addXP } = useProgress()
  const { updateStreak } = useStreak()

  const story = getStoryById(storyId)
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0)
  const [xp, setXp] = useState(0)
  const [showCompletion, setShowCompletion] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [lastChoice, setLastChoice] = useState(null)

  useEffect(() => {
    if (!story) navigate('/home')
  }, [story, navigate])

  if (!story) return null

  const currentSegment = story.segments[currentSegmentIndex]

  const handleAnswer = (answerData) => {
    setDisabled(true)
    if (answerData.isCorrect && currentSegment.xp) {
      setXp((prev) => prev + currentSegment.xp)
      addXP(currentSegment.xp)
    }
    if (answerData.choice) setLastChoice(answerData.choice)
  }

  const handleContinue = () => {
    setDisabled(false)
    if (currentSegment.type === 'choice' && lastChoice) {
      const nextIndex = story.segments.findIndex((s) => s.id === lastChoice.nextSegment)
      if (nextIndex !== -1) { setCurrentSegmentIndex(nextIndex); setLastChoice(null); return }
    }
    if (currentSegmentIndex < story.segments.length - 1) {
      setCurrentSegmentIndex((prev) => prev + 1)
      setLastChoice(null)
    } else {
      updateStreak()
      setShowCompletion(true)
    }
  }

  const progress = ((currentSegmentIndex + 1) / story.segments.length) * 100

  if (showCompletion) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Story Complete!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{story.title}</p>
          <div className="bg-duo-green/10 dark:bg-duo-green/20 rounded-xl p-6 mb-6">
            <div className="text-4xl font-bold text-duo-green mb-2">+{story.xp + xp} XP</div>
            <p className="text-gray-600 dark:text-gray-400">Great reading!</p>
          </div>
          <button onClick={() => navigate('/home')}
            className="w-full bg-duo-green hover:bg-duo-green-dark text-white font-bold py-4 rounded-lg transition-colors shadow-lg">
            Continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header variant="simple" title={story.title} />

      <div className="max-w-4xl mx-auto px-4 pt-24 pb-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {currentSegmentIndex + 1} / {story.segments.length}
            </span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{story.xp + xp} XP</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div className="bg-duo-purple h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
          <Story
            segment={currentSegment}
            onAnswer={handleAnswer}
            onContinue={handleContinue}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}

export default StoryPage
