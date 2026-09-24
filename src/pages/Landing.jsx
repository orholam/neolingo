import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import AccountMenu from '../components/AccountMenu'
import { LANGUAGES } from '../data/languages'

const ROTATING_WORDS = ['rarest', 'forgotten', 'endangered', 'ancient', 'dying', 'constructed']

const MARQUEE_LANGS = [
  'Dadjo', 'Sumerian', 'Cornish', 'Aramaic', 'Elfdalian', 'Laz', 'Njerep',
  'Saterland Frisian', 'Koro', 'Võro', 'Tsakonian', 'Jedek', 'Yahgan',
  'Ubykh', 'Livonian', 'Ainu', 'Ter Sami', 'Chamicuro',
]

const features = [
  {
    icon: '⚡',
    color: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-100 dark:border-amber-900/40',
    title: 'Bite-sized lessons',
    desc: 'Short, focused exercises that fit in 5 minutes — or 50.',
  },
  {
    icon: '🔥',
    color: 'from-red-400 to-pink-500',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-100 dark:border-red-900/40',
    title: 'Streaks & XP',
    desc: 'Daily streaks and XP keep momentum going week after week.',
  },
  {
    icon: '📖',
    color: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-100 dark:border-emerald-900/40',
    title: 'Cultural stories',
    desc: 'Learn through real narratives — language in living context.',
  },
  {
    icon: '🃏',
    color: 'from-violet-400 to-indigo-500',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    border: 'border-violet-100 dark:border-violet-900/40',
    title: 'Smart flashcards',
    desc: "Spaced repetition that focuses on what you're forgetting.",
  },
]

function WordRotator() {
  const [index, setIndex] = useState(0)
  const [key, setKey] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex(i => (i + 1) % ROTATING_WORDS.length)
      setKey(k => k + 1)
    }, 2800)
    return () => clearInterval(id)
  }, [])

  return (
    <span
      key={key}
      className="animate-word inline-block bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
    >
      {ROTATING_WORDS[index]}
    </span>
  )
}

function MarqueeLangs() {
  const items = [...MARQUEE_LANGS, ...MARQUEE_LANGS]
  return (
    <div className="relative overflow-hidden py-4 border-y border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/60 backdrop-blur-sm">
      <div className="flex gap-10 animate-marquee whitespace-nowrap w-max">
        {items.map((lang, i) => (
          <span key={i} className="flex items-center gap-2 text-sm font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/60" />
            {lang}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-white/80 dark:bg-gray-950/80 border-b border-gray-100 dark:border-gray-800/80">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🦉</span>
          <span className="font-extrabold text-lg tracking-tight">
            Neo<span className="text-indigo-500">Lingo</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <AccountMenu />
          <ThemeToggle />
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 pt-24 pb-12">
        {/* mesh background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,80,255,0.12),transparent)] pointer-events-none" />
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-indigo-300/20 dark:bg-indigo-700/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-72 h-72 bg-purple-300/20 dark:bg-purple-700/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-amber-300/15 dark:bg-amber-700/10 rounded-full blur-3xl pointer-events-none" />

        {/* badge */}
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-8 tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Language preservation · Made interactive
        </span>

        {/* headline */}
        <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-black leading-[1.08] tracking-tighter mb-6 max-w-4xl">
          Learn the world's
          <br />
          <WordRotator />
          <br />
          languages.
        </h1>

        <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed mb-10">
          Thousands of languages are disappearing. We're turning them into
          interactive lessons — so they survive in the minds of the next generation.
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate('/home')}
          className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-extrabold text-xl px-10 py-5 rounded-2xl shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 hover:-translate-y-1 active:translate-y-0"
        >
          Try Now
          <span className="transition-transform duration-200 group-hover:translate-x-1 text-2xl">→</span>
        </button>

        <p className="mt-4 text-sm text-gray-400 dark:text-gray-600">
          No account needed &nbsp;·&nbsp; Runs in your browser &nbsp;·&nbsp; Free
        </p>

        {/* stats */}
        <div className="mt-20 flex flex-wrap justify-center gap-12 sm:gap-20">
          {[
            { value: '2', label: 'Languages available' },
            { value: '1,400+', label: 'Dictionary entries' },
            { value: '10+', label: 'Lesson modules' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                {value}
              </div>
              <div className="text-sm text-gray-400 dark:text-gray-500 mt-1.5 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Language ticker ── */}
      <MarqueeLangs />

      {/* ── Why rare languages ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold tracking-widest text-indigo-500 uppercase mb-4">Why it matters</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-6 leading-tight">
            A language dies every{' '}
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              14 days.
            </span>
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
            With it goes a unique way of seeing the world — irreplaceable vocabulary, stories, and knowledge
            encoded nowhere else. NeoLingo is building the tools to keep these languages alive through active learning.
          </p>
        </div>
      </section>

      {/* ── Available languages ── */}
      <section className="py-8 px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold tracking-widest text-indigo-500 uppercase mb-3 text-center">Available now</p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-12 text-center">
            Pick a language, start today.
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {LANGUAGES.map(
              ({
                id,
                flag,
                name,
                nativeName,
                region,
                speakers,
                cardTagLabel,
                cardTagColor,
                cardAccent,
                description,
                status,
              }) => (
              <div
                key={id}
                className="group relative rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-7 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden"
              >
                {/* accent stripe */}
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${cardAccent} rounded-t-3xl`} />

                <div className="flex items-start justify-between mb-5">
                  <span className="text-4xl">{flag}</span>
                  <span className={`text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full ${cardTagColor}`}>
                    {cardTagLabel}
                  </span>
                </div>

                <h3 className="text-xl font-black mb-0.5">{name}</h3>
                <p className="text-sm font-medium text-indigo-400 dark:text-indigo-500 mb-1">
                  {nativeName}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-600 mb-4">
                  {region} &nbsp;·&nbsp; {speakers}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {description}
                </p>
                {status === 'coming-soon' && (
                  <p className="mt-4 text-[11px] uppercase tracking-widest font-semibold text-gray-400 dark:text-gray-500">
                    Join the waitlist in your mind — more courses are being researched.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold tracking-widest text-indigo-500 uppercase mb-3 text-center">How it works</p>
          <h2 className="text-3xl sm:text-5xl font-black mb-16 tracking-tight text-center">
            Built to actually{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              make it stick.
            </span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon, color, bg, border, title, desc }) => (
              <div
                key={title}
                className={`group rounded-2xl border ${border} ${bg} p-6 hover:shadow-xl transition-all duration-200 hover:-translate-y-1`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${color} text-2xl mb-4 shadow-lg`}>
                  {icon}
                </div>
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote / mission ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-6xl mb-6">💬</div>
          <blockquote className="text-2xl sm:text-3xl font-bold leading-tight text-gray-700 dark:text-gray-300 tracking-tight mb-6">
            "To lose a language is to lose a window onto the world."
          </blockquote>
          <p className="text-gray-400 dark:text-gray-600 text-sm font-medium">— Kenneth Hale, linguist</p>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="relative max-w-2xl mx-auto text-center text-white">
          <div className="text-6xl mb-6">🌐</div>
          <h2 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">
            Keep a language alive.
            <br />
            Start now.
          </h2>
          <p className="text-white/60 mb-10 text-lg">
            No account. No credit card. Open your first lesson in seconds.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="group inline-flex items-center gap-3 bg-white text-indigo-600 hover:bg-gray-50 font-extrabold text-xl px-10 py-5 rounded-2xl shadow-2xl transition-all duration-200 hover:-translate-y-1"
          >
            Try Now
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400 dark:text-gray-600">
        <div className="flex items-center gap-2 font-semibold">
          <span>🦉</span>
          <span>NeoLingo — Rare Language Learning</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-indigo-500 transition-colors">Terms</a>
          <a href="#" className="hover:text-indigo-500 transition-colors">Privacy</a>
        </div>
      </footer>

    </div>
  )
}
