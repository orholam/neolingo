import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgress } from '../hooks/useProgress'
import { useGems } from '../hooks/useGems'
import { courseData, isLessonUnlocked, getAllLessons } from '../data/courseData'
import { sumerianData } from '../data/sumerianCourseData'
import { koreanData } from '../data/koreanCourseData'
import { useSelectedLanguage } from '../contexts/LanguageContext'

const COURSE_CONFIG = {
  dadjo: {
    id: 'dadjo',
    label: 'Dadjo',
    icon: '🌍',
    color: 'from-blue-500 to-purple-500',
    data: courseData,
    description: 'Dar Daju Daju — spoken in Sudan & Chad',
    dictRoute: '/dictionary',
    dictLabel: '📚 Dadjo dictionary',
    borderColor: 'border-blue-400 hover:border-blue-500',
  },
  sumerian: {
    id: 'sumerian',
    label: 'Ancient Sumerian',
    icon: '𒀭',
    color: 'from-amber-500 to-orange-600',
    data: sumerianData,
    description: sumerianData.description,
    dictRoute: '/sumerian-dictionary',
    dictLabel: '📜 Sumerian dictionary',
    borderColor: 'border-amber-400 hover:border-amber-500',
  },
  korean: {
    id: 'korean',
    label: 'Korean',
    icon: '🇰🇷',
    color: 'from-red-500 to-rose-600',
    data: koreanData,
    description: koreanData.description,
    dictRoute: '/korean-dictionary',
    dictLabel: '🇰🇷 Korean dictionary',
    borderColor: 'border-red-400 hover:border-red-500',
  },
}

const LESSON_ICONS = ['🥚', '🧳', '👤', '✈️', '🍽️', '🛒', '👨‍👩‍👧', '🏠', '🎓', '💼']

function Practice() {
  const navigate = useNavigate()
  const { progress, isLessonCompleted } = useProgress()
  const { earnGemsForDailyGoal } = useGems()
  const { selectedCourseId } = useSelectedLanguage()

  const selectedCourse = COURSE_CONFIG[selectedCourseId] || COURSE_CONFIG.dadjo
  const allLessons = getAllLessons(selectedCourse.data)

  const dailyGoal = 20
  const currentXP = progress.dailyXP || 0
  const completedLessons = progress.completedLessons || []

  const [dailyGoalRewarded, setDailyGoalRewarded] = useState(false)

  useEffect(() => {
    if (currentXP >= dailyGoal && !dailyGoalRewarded) {
      earnGemsForDailyGoal()
      setDailyGoalRewarded(true)
    } else if (currentXP < dailyGoal) {
      setDailyGoalRewarded(false)
    }
  }, [currentXP, dailyGoal, dailyGoalRewarded, earnGemsForDailyGoal])

  const handleLessonClick = (lesson) => {
    if (isLessonUnlocked(lesson.id, completedLessons, selectedCourse.data)) {
      navigate(`/lesson?lessonId=${lesson.id}&lessonName=${encodeURIComponent(lesson.name)}`)
    }
  }

  const getLessonStatus = (lesson) => {
    if (isLessonCompleted(lesson.id)) return 'completed'
    if (isLessonUnlocked(lesson.id, completedLessons, selectedCourse.data)) return 'available'
    return 'locked'
  }

  const getLessonBackground = (status, index) => {
    if (status === 'locked') return 'bg-gray-100 dark:bg-gray-700'
    if (status === 'completed')
      return index % 2 === 0 ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-blue-50 dark:bg-blue-900/20'
    return 'bg-blue-50 dark:bg-blue-900/20'
  }

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Course banner */}
      <div className={`mb-6 p-4 rounded-2xl bg-gradient-to-r ${selectedCourse.color} text-white shadow-md`}>
        <div className="flex items-center gap-3">
          <span className="text-4xl leading-none">{selectedCourse.icon}</span>
          <div>
            <h2 className="font-bold text-lg leading-tight">{selectedCourse.label}</h2>
            <p className="text-white/80 text-sm">{selectedCourse.description}</p>
          </div>
        </div>
      </div>

      {/* Lesson modules — circular path */}
      <div className="space-y-6">
        {allLessons.map((lesson, index) => {
          const status = getLessonStatus(lesson)
          const isLocked = status === 'locked'
          const background = getLessonBackground(status, index)
          const icon = LESSON_ICONS[index % LESSON_ICONS.length]
          const crownLevel = isLessonCompleted(lesson.id) ? 3 : 0

          return (
            <div key={lesson.id} className="flex items-center justify-center">
              <div className="relative flex flex-col items-center">
                <button
                  onClick={() => handleLessonClick(lesson)}
                  disabled={isLocked}
                  className={`relative w-28 h-28 rounded-full flex items-center justify-center text-5xl transition-all shadow-lg hover:shadow-xl ${
                    isLocked
                      ? 'bg-gray-100 dark:bg-gray-700 opacity-60 cursor-not-allowed border-2 border-gray-300 dark:border-gray-600'
                      : status === 'completed'
                      ? `${background} border-4 border-purple-500 hover:border-purple-600`
                      : `${background} border-4 ${selectedCourse.borderColor}`
                  }`}
                >
                  <span className={`relative z-10 ${isLocked ? 'opacity-50' : ''}`}>{icon}</span>
                  {crownLevel > 0 && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-900">
                      <span className="text-yellow-900 text-sm font-bold">{crownLevel}</span>
                    </div>
                  )}
                </button>
                <div className="mt-4 text-center">
                  <p className={`text-sm font-semibold ${
                    isLocked ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'
                  }`}>
                    {lesson.name}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Practice
