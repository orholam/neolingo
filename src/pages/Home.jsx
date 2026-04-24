import { useNavigate } from 'react-router-dom'
import { useProgress } from '../hooks/useProgress'
import { useSelectedLanguage } from '../contexts/LanguageContext'
import { useWordMastery } from '../hooks/useWordMastery'
import { dadjoDictionary } from '../data/dadjoDictionary'
import { sumerianDictionary } from '../data/sumerianDictionary'
import Header from '../components/Header'
import MiniSemanticMap from '../components/MiniSemanticMap'

const COURSE_SUMMARY = {
  dadjo: {
    id: 'dadjo',
    label: 'Dadjo',
    emoji: '🐏',
  },
  sumerian: {
    id: 'sumerian',
    label: 'Ancient Sumerian',
    emoji: '𒀭',
  },
}

const COURSE_DICTIONARIES = {
  dadjo: { dictionary: dadjoDictionary, languageId: 'Dadjo', dictRoute: '/dictionary' },
  sumerian: { dictionary: sumerianDictionary, languageId: 'Sumerian', dictRoute: '/sumerian-dictionary' },
}

function Home() {
  const navigate = useNavigate()
  const { progress } = useProgress()
  const { selectedCourseId } = useSelectedLanguage()

  const courseDictInfo = COURSE_DICTIONARIES[selectedCourseId] ?? COURSE_DICTIONARIES.dadjo
  const { stats: masteryStats } = useWordMastery(courseDictInfo.languageId, courseDictInfo.dictionary)
  const masteredCount = masteryStats.totalUniversalMastered

  const dailyGoal = 20
  const currentXP = progress.dailyGoal || progress.dailyXP || 0
  const totalXP = progress.totalXP || 0

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header variant="main" />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16 flex gap-6">
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full max-w-2xl mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                  Current language
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl leading-none">
                    {COURSE_SUMMARY[selectedCourseId]?.emoji ?? '🐏'}
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-50">
                    {COURSE_SUMMARY[selectedCourseId]?.label ?? 'Dadjo'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate('/languages')}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors"
              >
                Change language
              </button>
            </div>
          </div>

          <div className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
              Your learning hub
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-50 mb-3">
              Continue your language journey
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Choose what you want to focus on right now: step through the lesson path, drill flashcards,
              or explore your digital brain.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-2xl">
            {/* Lessons */}
            <button
              onClick={() => navigate('/practice')}
              className="flex items-center justify-between px-6 py-5 rounded-2xl bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-sm border border-blue-100 dark:border-blue-800 text-left"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 dark:text-blue-300 mb-0.5">
                  Lessons
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-50">
                  Course path &amp; practice
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Follow the circle path of lessons.
                </p>
              </div>
              <span className="text-4xl ml-4 shrink-0">💪</span>
            </button>

            {/* Vocabulary — hot button with sub-links */}
            <div
              onClick={() => navigate('/flashcards')}
              className="cursor-pointer flex flex-col px-6 py-5 rounded-2xl bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors shadow-sm border border-purple-100 dark:border-purple-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-purple-500 dark:text-purple-300 mb-0.5">
                    Vocabulary
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-50">
                    Flashcard sessions
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Drill vocabulary with smart mastery tracking.
                  </p>
                </div>
                <span className="text-4xl ml-4 shrink-0">🧠</span>
              </div>

              <div
                className="mt-4 pt-3 border-t border-purple-200 dark:border-purple-800 flex items-center justify-between"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                    {masteredCount} {masteredCount === 1 ? 'word' : 'words'} mastered
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/mastered')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-700 transition-colors"
                  >
                    Mastered words
                  </button>
                  <button
                    onClick={() => navigate(courseDictInfo.dictRoute)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors"
                  >
                    Full dictionary
                  </button>
                </div>
              </div>
            </div>

            {/* Languages */}
            <button
              onClick={() => navigate('/languages')}
              className="flex items-center justify-between px-6 py-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors shadow-sm border border-emerald-100 dark:border-emerald-800 text-left"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 dark:text-emerald-300 mb-0.5">
                  Languages
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-50">
                  Manage your language plan
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Turn languages on or off for your path.
                </p>
              </div>
              <span className="text-4xl ml-4 shrink-0">🐏</span>
            </button>

            {/* Digital Brain */}
            <button
              onClick={() => navigate(`/brain/${selectedCourseId}`)}
              className="flex items-center justify-between px-6 py-5 rounded-2xl bg-violet-50 dark:bg-violet-900/30 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors shadow-sm border border-violet-100 dark:border-violet-800 text-left"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 dark:text-violet-300 mb-0.5">
                  Digital brain
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-50">
                  Explore concepts visually
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Open the semantic map for your language.
                </p>
              </div>
              <span className="text-4xl ml-4 shrink-0">🌐</span>
            </button>
          </div>
        </div>

        {/* Right status bar with XP and mini map (restored) */}
        <div className="w-80 hidden md:block">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden sticky top-20 shadow-sm">
            <div className="px-4 pt-4 pb-3">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3 text-lg">XP Progress</h3>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">📦</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">Daily Goal</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                <div
                  className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((currentXP / dailyGoal) * 100, 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {currentXP} / {dailyGoal} XP
              </p>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total XP</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{totalXP}</p>
              </div>
            </div>

            <MiniSemanticMap courseId={selectedCourseId} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
