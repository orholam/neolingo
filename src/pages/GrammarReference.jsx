import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelectedLanguage } from '../contexts/LanguageContext'
import { useLanguageSwitch } from '../hooks/useLanguageSwitch'
import { getCourse } from '../data/courses'
import { GRAMMAR_BY_COURSE } from '../data/dadjoGrammarReference'

function GrammarTable({ columns, rows }) {
  if (!columns?.length || !rows?.length) return null
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full min-w-[28rem] text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {columns.map((col) => (
              <th
                key={col || 'row'}
                className="text-left py-2 px-2 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-gray-100 dark:border-gray-800 last:border-0 align-top"
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`py-2.5 px-2 ${
                    j === 0
                      ? 'font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap'
                      : 'text-gray-700 dark:text-gray-300 font-mono text-[13px]'
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SectionCard({ section, open, onToggle }) {
  return (
    <section
      id={section.id}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700/80 overflow-hidden scroll-mt-24"
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
        aria-expanded={open}
      >
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-50">{section.title}</h2>
        <span className="text-gray-400 text-sm tabular-nums">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 dark:border-gray-700/80 pt-3">
          {section.blurb && (
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{section.blurb}</p>
          )}

          {section.items && (
            <dl className="space-y-2">
              {section.items.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col sm:flex-row sm:gap-3 text-sm border-b border-gray-50 dark:border-gray-800/80 last:border-0 pb-2 last:pb-0"
                >
                  <dt className="font-mono text-[13px] font-semibold text-amber-700 dark:text-amber-400 shrink-0 sm:w-36">
                    {item.label}
                  </dt>
                  <dd className="text-gray-700 dark:text-gray-300">{item.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {section.columns && <GrammarTable columns={section.columns} rows={section.rows} />}

          {section.phrases && (
            <ul className="space-y-3">
              {section.phrases.map((p) => (
                <li
                  key={p.dadjo}
                  className="rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 px-3 py-2.5"
                >
                  <p className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {p.dadjo}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{p.english}</p>
                  {p.literal && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                      lit. {p.literal}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {section.examples && (
            <ul className="flex flex-wrap gap-2">
              {section.examples.map((ex) => (
                <li
                  key={ex.dadjo}
                  className="inline-flex items-baseline gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm"
                >
                  <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                    {ex.dadjo}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">{ex.english}</span>
                </li>
              ))}
            </ul>
          )}

          {section.tip && (
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-900/60 rounded-xl px-3 py-2">
              {section.tip}
            </p>
          )}
        </div>
      )}
    </section>
  )
}

function EmptyGrammar({ course, onOpenDadjo }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 text-center">
        <p className="text-4xl mb-3">{course.emoji}</p>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2">
          Grammar reference
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          A cheat sheet for {course.label} isn’t in the app yet. Dadjo already has one.
        </p>
        <button
          type="button"
          onClick={onOpenDadjo}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500"
        >
          Switch to Dadjo grammar
        </button>
      </div>
    </div>
  )
}

export default function GrammarReference() {
  const { selectedCourseId } = useSelectedLanguage()
  const { switchLanguage } = useLanguageSwitch()
  const course = getCourse(selectedCourseId)
  const grammar = GRAMMAR_BY_COURSE[selectedCourseId] || null

  const sectionIds = useMemo(
    () => (grammar ? grammar.sections.map((s) => s.id) : []),
    [grammar]
  )
  const [openIds, setOpenIds] = useState(() => new Set())

  useEffect(() => {
    setOpenIds(new Set(sectionIds))
  }, [sectionIds])

  if (!grammar) {
    return <EmptyGrammar course={course} onOpenDadjo={() => switchLanguage('dadjo')} />
  }

  const allOpen = openIds.size === grammar.sections.length

  const toggle = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const setAll = (open) => {
    setOpenIds(open ? new Set(grammar.sections.map((s) => s.id)) : new Set())
  }

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <header className="mb-5 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 sm:p-5 border border-gray-100 dark:border-gray-700/80">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-2xl shrink-0">
            📝
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">{grammar.title}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
              {grammar.subtitle}
            </p>
            {grammar.note && (
              <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-2 leading-relaxed">
                {grammar.note}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAll(!allOpen)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
          {grammar.sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-100 dark:border-gray-800"
            >
              {s.title}
            </a>
          ))}
        </div>
      </header>

      <div className="space-y-3">
        {grammar.sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            open={openIds.has(section.id)}
            onToggle={() => toggle(section.id)}
          />
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
        Pair with the{' '}
        <Link to={course.dictRoute} className="underline hover:text-indigo-500">
          dictionary
        </Link>{' '}
        for lookup while you study these patterns.
      </p>
    </div>
  )
}
