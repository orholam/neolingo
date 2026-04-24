import { useNavigate } from 'react-router-dom'
import { LANGUAGES } from '../data/languages'
import { useLanguagePlan } from '../hooks/useLanguagePlan'
import { useSelectedLanguage } from '../contexts/LanguageContext'
import Header from '../components/Header'

export default function Languages() {
  const navigate = useNavigate()
  const { isInPlan, toggleLanguage } = useLanguagePlan()
  const { setSelectedCourseId } = useSelectedLanguage()

  const handleGoToCourse = (lang) => {
    if (!isInPlan(lang.id)) {
      toggleLanguage(lang.id)
    }
    setSelectedCourseId(lang.id)
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header variant="main" />

      <main className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold tracking-widest text-indigo-500 uppercase mb-2">
              Languages library
            </p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-gray-50">
              Explore all languages.
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xl">
              Browse every language currently in NeoLingo. Add or remove them from your personal
              learning plan at any time.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <span>←</span>
            <span>Back to dashboard</span>
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {LANGUAGES.map((lang) => {
            const active = isInPlan(lang.id)
            return (
              <div
                key={lang.id}
                className="relative rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm"
              >
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${lang.cardAccent} rounded-t-3xl`} />

                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{lang.flag}</span>
                  <span
                    className={`text-[10px] font-bold tracking-widest px-2 py-1 rounded-full ${lang.cardTagColor}`}
                  >
                    {lang.cardTagLabel}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-0.5">
                  {lang.name}
                </h2>
                <p className="text-sm font-medium text-indigo-400 dark:text-indigo-500 mb-1">
                  {lang.nativeName}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                  {lang.region} · {lang.speakers}
                </p>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {lang.description}
                </p>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleLanguage(lang.id)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500'
                        : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>{active ? 'Remove from plan' : 'Add to plan'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={lang.status !== 'available'}
                    onClick={() => handleGoToCourse(lang)}
                    className={`text-xs font-semibold ${
                      lang.status === 'available'
                        ? 'text-indigo-600 dark:text-indigo-400 hover:underline'
                        : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {lang.status === 'available' ? 'Go to course →' : 'Course in development'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

