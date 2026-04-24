import { useNavigate } from 'react-router-dom'
import { courseData, isLessonUnlocked } from '../data/courseData'
import { useProgress } from '../hooks/useProgress'
import { useGems } from '../hooks/useGems'

function Path() {
  const navigate = useNavigate()
  const { progress, isLessonCompleted } = useProgress()
  const { gems } = useGems()
  const completedLessons = progress.completedLessons || []

  const handleLessonClick = (lesson) => {
    if (isLessonUnlocked(lesson.id, completedLessons)) {
      navigate(
        `/lesson?lessonId=${lesson.id}&lessonName=${encodeURIComponent(
          lesson.name
        )}`
      )
    }
  }

  const getLessonStatus = (lesson) => {
    if (isLessonCompleted(lesson.id)) return 'completed'
    if (isLessonUnlocked(lesson.id, completedLessons)) return 'available'
    return 'locked'
  }

  const getSectionProgress = (section) => {
    let totalLessons = 0
    let completedCount = 0

    section.units.forEach((unit) => {
      unit.levels.forEach((level) => {
        level.lessons.forEach((lesson) => {
          totalLessons++
          if (isLessonCompleted(lesson.id)) {
            completedCount++
          }
        })
      })
    })

    return totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/home')}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
            <div className="text-4xl">🦉</div>
            <h1 className="text-2xl font-bold text-gray-800">
              {courseData.language}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-duo-yellow px-4 py-2 rounded-full">
              <span className="text-xl">🐏</span>
              <span className="font-bold text-gray-800">{gems}</span>
            </div>
            <div className="w-10 h-10 bg-duo-green rounded-full flex items-center justify-center text-white font-bold">
              JD
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Path Visualization */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Path</h2>

          {courseData.sections.map((section) => {
            const sectionProgress = getSectionProgress(section)

            return (
              <div key={section.id} className="mb-12">
                {/* Section Header */}
                <div className="mb-6 pb-4 border-b-2 border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-duo-purple rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {section.id}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">
                          {section.title}
                        </h3>
                        <div className="mt-2 w-48 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-duo-purple h-2 rounded-full transition-all"
                            style={{ width: `${sectionProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {Math.round(sectionProgress)}% complete
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Units */}
                {section.units.map((unit) => {
                  let totalLessons = 0
                  let completedCount = 0

                  unit.levels.forEach((level) => {
                    level.lessons.forEach((lesson) => {
                      totalLessons++
                      if (isLessonCompleted(lesson.id)) {
                        completedCount++
                      }
                    })
                  })

                  const unitProgress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0

                  return (
                    <div key={unit.id} className="mb-8 ml-8">
                      {/* Unit Header */}
                      <div className="mb-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-12 h-12 bg-duo-blue rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {unit.id}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-gray-800">
                              {unit.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {unit.communicationGoal}
                            </p>
                          </div>
                        </div>
                        <div className="ml-16 mt-2 w-40 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-duo-blue h-1.5 rounded-full transition-all"
                            style={{ width: `${unitProgress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Levels */}
                      {unit.levels.map((level) => (
                        <div key={level.id} className="mb-6 ml-8">
                          {/* Level Header */}
                          <div className="mb-3">
                            <h5 className="text-lg font-semibold text-gray-700">
                              {level.title}
                            </h5>
                          </div>

                          {/* Lessons */}
                          <div className="ml-8 space-y-3 relative">
                            {level.lessons.map((lesson, lessonIndex) => {
                              const status = getLessonStatus(lesson)
                              const isLastLesson =
                                lessonIndex === level.lessons.length - 1

                              return (
                                <div
                                  key={lesson.id}
                                  className="flex items-center relative"
                                >
                                  {/* Connecting Line */}
                                  {!isLastLesson && (
                                    <div className="absolute left-4 top-12 w-0.5 h-12 bg-gray-300"></div>
                                  )}

                                  {/* Lesson Circle */}
                                  <div className="relative z-10 w-8 h-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center mr-4">
                                    <span className="text-sm">
                                      {status === 'completed' ? '✅' : status === 'available' ? '🔓' : '🔒'}
                                    </span>
                                  </div>

                                  {/* Lesson Button */}
                                  <button
                                    onClick={() => handleLessonClick(lesson)}
                                    disabled={status === 'locked'}
                                    className={`flex-1 border-2 rounded-xl px-6 py-4 text-left font-semibold transition-all ${
                                      status === 'completed'
                                        ? 'bg-duo-green text-white border-duo-green'
                                        : status === 'available'
                                        ? 'bg-white text-duo-green border-duo-green hover:bg-duo-green hover:text-white'
                                        : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span>{lesson.name}</span>
                                      {status === 'completed' && (
                                        <span className="text-sm opacity-80">
                                          +{lesson.xp} XP
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Your Progress
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-duo-green">
                {completedLessons.length}
              </div>
              <div className="text-sm text-gray-600">Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-duo-blue">
                {progress.totalXP || 0}
              </div>
              <div className="text-sm text-gray-600">XP</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-duo-purple">
                {progress.dailyXP || 0}
              </div>
              <div className="text-sm text-gray-600">Today's XP</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Path
