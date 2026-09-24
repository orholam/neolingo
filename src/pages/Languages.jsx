import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { LANGUAGES } from '../data/languages'
import { getCourse } from '../data/courses'
import { useLanguagePlan } from '../hooks/useLanguagePlan'
import { useLanguageSwitch } from '../hooks/useLanguageSwitch'
import { useSelectedLanguage } from '../contexts/LanguageContext'

const AVAILABLE = LANGUAGES.filter((l) => l.status === 'available')
const COMING_SOON = LANGUAGES.filter((l) => l.status !== 'available')

function LanguageCard({ lang, inPlan, isActive, onTogglePlan, onOpen }) {
  const course = getCourse(lang.id)
  const dictSize = course?.dictionary?.length
  const available = lang.status === 'available'

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 ${
        available
          ? 'border-gray-200/80 dark:border-gray-700/80 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600'
          : 'border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/40 opacity-90'
      } ${inPlan && available ? 'ring-2 ring-indigo-500/40 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900' : ''}`}
    >
      <div className={`relative px-5 pt-5 pb-6 bg-gradient-to-br ${lang.cardAccent}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent_55%)]" />
        <div className="relative flex items-start justify-between gap-3">
          <span className="text-5xl drop-shadow-sm leading-none">{lang.flag}</span>
          <span
            className={`shrink-0 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm ${
              available
                ? 'bg-white/25 text-white border border-white/30'
                : 'bg-black/10 text-white/80 border border-white/20'
            }`}
          >
            {lang.cardTagLabel}
          </span>
        </div>
        <div className="relative mt-4">
          <h2 className="text-xl font-bold text-white drop-shadow-sm">{lang.name}</h2>
          <p className="text-sm font-medium text-white/90 mt-0.5">{lang.nativeName}</p>
          <p className="text-xs text-white/75 mt-2 leading-relaxed max-w-[95%]">{lang.tagline}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-[11px] font-medium text-gray-600 dark:text-gray-300">
            <span aria-hidden>📍</span> {lang.region}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-[11px] font-medium text-gray-600 dark:text-gray-300">
            <span aria-hidden>👥</span> {lang.speakers}
          </span>
          {available && dictSize > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-[11px] font-medium text-indigo-700 dark:text-indigo-300">
              <span aria-hidden>📖</span> {dictSize.toLocaleString()} words
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex-1 mb-5">
          {lang.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-2 mt-auto">
          {available ? (
            <>
              <button
                type="button"
                onClick={() => onOpen(lang)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-sm"
              >
                {isActive ? 'Continue learning' : 'Open course'}
                <span aria-hidden>→</span>
              </button>
              <button
                type="button"
                onClick={() => onTogglePlan(lang.id)}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                  inPlan
                    ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-950/60'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                aria-pressed={inPlan}
              >
                <span
                  className={`w-2 h-2 rounded-full ${inPlan ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                />
                {inPlan ? 'In plan' : 'Add to plan'}
              </button>
            </>
          ) : (
            <p className="text-sm text-center text-gray-400 dark:text-gray-500 py-2">
              Course in development
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

function PlanChip({ lang, isActive, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(lang)}
      className={`inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border text-sm font-semibold transition-all ${
        isActive
          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/25'
          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30'
      }`}
    >
      <span className="text-lg leading-none">{lang.flag}</span>
      <span>{lang.name}</span>
      {isActive && (
        <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">Active</span>
      )}
    </button>
  )
}

export default function Languages() {
  const navigate = useNavigate()
  const { isInPlan, toggleLanguage, enabledLanguages } = useLanguagePlan()
  const { switchLanguage, selectedCourseId } = useLanguageSwitch()

  const planLanguages = useMemo(
    () => enabledLanguages.filter((l) => l.status === 'available'),
    [enabledLanguages]
  )

  const handleGoToCourse = (lang) => {
    if (!isInPlan(lang.id)) {
      toggleLanguage(lang.id)
    }
    switchLanguage(lang.id)
    navigate('/home')
  }

  return (
    <div className="max-w-6xl mx-auto pb-10 space-y-10">
      <header className="relative overflow-hidden rounded-3xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-6 py-8 sm:px-10 sm:py-10 text-white shadow-lg shadow-indigo-900/20">
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-4 bottom-0 w-32 h-32 rounded-full bg-violet-400/20 blur-xl" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-200 mb-3">
            Languages library
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Learn languages the world forgot — and ones it didn&apos;t
          </h1>
          <p className="text-indigo-100/90 text-sm sm:text-base leading-relaxed mb-6">
            Build your personal learning plan from endangered, ancient, and modern courses. Switch
            anytime from the sidebar.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-2.5">
              <p className="text-[10px] uppercase tracking-wider text-indigo-200 font-semibold">
                In your plan
              </p>
              <p className="text-2xl font-bold tabular-nums">{planLanguages.length}</p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-2.5">
              <p className="text-[10px] uppercase tracking-wider text-indigo-200 font-semibold">
                Available now
              </p>
              <p className="text-2xl font-bold tabular-nums">{AVAILABLE.length}</p>
            </div>
          </div>
        </div>
      </header>

      {planLanguages.length > 0 && (
        <section>
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Your learning plan</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Tap a language to switch and jump to your dashboard.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {planLanguages.map((lang) => (
              <PlanChip
                key={lang.id}
                lang={lang}
                isActive={selectedCourseId === lang.id}
                onOpen={handleGoToCourse}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Available courses</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Full lessons, flashcards, dictionary, and brain map for each language.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {AVAILABLE.map((lang) => (
            <LanguageCard
              key={lang.id}
              lang={lang}
              inPlan={isInPlan(lang.id)}
              isActive={selectedCourseId === lang.id}
              onTogglePlan={toggleLanguage}
              onOpen={handleGoToCourse}
            />
          ))}
        </div>
      </section>

      {COMING_SOON.length > 0 && (
        <section>
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">On the roadmap</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              More endangered and historical languages are being researched.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {COMING_SOON.map((lang) => (
              <LanguageCard
                key={lang.id}
                lang={lang}
                inPlan={false}
                isActive={false}
                onTogglePlan={() => {}}
                onOpen={() => {}}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
