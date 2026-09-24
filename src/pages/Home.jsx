import { useNavigate } from 'react-router-dom'
import { useProgress } from '../hooks/useProgress'
import { useSelectedLanguage } from '../contexts/LanguageContext'
import { useWordMastery } from '../hooks/useWordMastery'
import { getCourse } from '../data/courses'
import { courseData, isLessonUnlocked, getAllLessons } from '../data/courseData'
import { sumerianData } from '../data/sumerianCourseData'
import { koreanData } from '../data/koreanCourseData'

const COURSE_LESSONS = {
  dadjo: courseData,
  sumerian: sumerianData,
  korean: koreanData,
}

function Home() {
  const navigate = useNavigate()
  const { progress, isLessonCompleted } = useProgress()
  const { selectedCourseId } = useSelectedLanguage()
  const course = getCourse(selectedCourseId)
  const lessonData = COURSE_LESSONS[selectedCourseId] || courseData
  const allLessons = getAllLessons(lessonData)
  const completedLessons = progress.completedLessons || []

  const { stats: masteryStats } = useWordMastery(course.languageId, course.dictionary)
  const masteredCount = masteryStats.totalUniversalMastered

  const dailyGoal = 20
  const currentXP = progress.dailyXP || 0

  const nextLesson =
    allLessons.find(
      (lesson) =>
        !isLessonCompleted(lesson.id) &&
        isLessonUnlocked(lesson.id, completedLessons, lessonData)
    ) || allLessons.find((lesson) => !isLessonCompleted(lesson.id))

  const continueLesson = () => {
    if (nextLesson) {
      navigate(`/lesson?lessonId=${nextLesson.id}&lessonName=${encodeURIComponent(nextLesson.name)}`)
    } else {
      navigate('/practice')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-4">
      <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/40 dark:to-gray-900 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-2">
          Continue learning
        </p>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{course.emoji}</span>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">{course.label}</h2>
            {nextLesson ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">Up next: {nextLesson.name}</p>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">All lessons complete — great work!</p>
            )}
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Daily XP</span>
            <span className="tabular-nums">{currentXP} / {dailyGoal}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((currentXP / dailyGoal) * 100, 100)}%` }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={continueLesson}
          className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
        >
          {nextLesson ? `Continue: ${nextLesson.name}` : 'View lesson path'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => navigate('/flashcards/new')}
          className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 text-center hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
        >
          <span className="text-2xl block mb-1">📚</span>
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">Practice words</span>
        </button>
        <button
          type="button"
          onClick={() =>
            navigate(
              masteredCount > 0 ? '/flashcards/new?mode=review' : '/flashcards?tab=mastered'
            )
          }
          className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 text-center hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
        >
          <span className="text-2xl block mb-1">🔄</span>
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">Review mastered</span>
        </button>
        <button
          type="button"
          onClick={() => navigate(`/brain/${selectedCourseId}`)}
          className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 text-center hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
        >
          <span className="text-2xl block mb-1">🧠</span>
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">Open brain</span>
        </button>
      </div>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        {masteredCount} word{masteredCount !== 1 ? 's' : ''} mastered ·{' '}
        {completedLessons.length} lesson{completedLessons.length !== 1 ? 's' : ''} done
      </p>
    </div>
  )
}

export default Home
