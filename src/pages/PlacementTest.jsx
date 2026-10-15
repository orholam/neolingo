import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FocusHeader from '../components/FocusHeader'
import FocusPageContent from '../components/FocusPageContent'
import { useSelectedLanguage } from '../contexts/LanguageContext'
import { getCourse, getLanguageId } from '../data/courses'
import { getWordId, useWordMastery } from '../hooks/useWordMastery'
import { useWordMemory } from '../hooks/useWordMemory'
import { getPhonetic, getPrimaryGloss } from '../utils/dictionaryEntry'
import { loadPlacement, savePlacement } from '../utils/placementCheck'
import { brainPowerForLanguage, displayDelta, formatBrainPowerChange } from '../utils/brainPower'

export default function PlacementTest() {
  const navigate = useNavigate()
  const { selectedCourseId } = useSelectedLanguage()
  const course = getCourse(selectedCourseId)
  const languageId = getLanguageId(course.id)
  const dictionary = course.dictionary

  const { addMastered, getUniversalMasteredWords } = useWordMastery(languageId, dictionary)
  const masteredIds = getUniversalMasteredWords().map((word) => word.id)
  const memory = useWordMemory(languageId, masteredIds)

  const [placement, setPlacement] = useState(() => loadPlacement(languageId))
  const [revealed, setRevealed] = useState(false)
  const [visitStart, setVisitStart] = useState(() => ({
    languageId,
    score: brainPowerForLanguage(languageId),
    known: loadPlacement(languageId).known,
  }))
  if (visitStart.languageId !== languageId) {
    setVisitStart({
      languageId,
      score: brainPowerForLanguage(languageId),
      known: loadPlacement(languageId).known,
    })
  }

  const answered = useMemo(() => new Set(placement.answered), [placement.answered])

  const remaining = useMemo(
    () =>
      dictionary.flatMap((entry, index) => {
        const id = getWordId(entry, index)
        if (answered.has(id)) return []
        return [{ id, entry, index }]
      }),
    [dictionary, answered]
  )

  const current = remaining[0] || null
  const total = dictionary.length
  const doneCount = total - remaining.length
  const finished = total > 0 && !current

  const record = useCallback(
    (known) => {
      if (!current) return
      const nextAnswered = placement.answered.includes(current.id)
        ? placement.answered
        : [...placement.answered, current.id]
      const next = savePlacement(languageId, {
        answered: nextAnswered,
        known: placement.known + (known ? 1 : 0),
        status: nextAnswered.length >= total ? 'completed' : 'active',
      })
      if (known) {
        addMastered(current.id)
        memory.markPermanent(current.id)
      }
      setPlacement(next)
      setRevealed(false)
    },
    [addMastered, current, languageId, memory, placement.answered, placement.known, total]
  )

  useEffect(() => {
    const onKey = (event) => {
      if (!current || event.metaKey || event.ctrlKey || event.altKey) return
      const tag = event.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (event.key === 'ArrowRight' || event.key === 'k' || event.key === 'K') {
        event.preventDefault()
        record(true)
      } else if (event.key === 'ArrowLeft' || event.key === 'n' || event.key === 'N') {
        event.preventDefault()
        record(false)
      } else if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        setRevealed(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, record])

  const addedThisVisit =
    visitStart.languageId === languageId ? placement.known - visitStart.known : 0
  const powerChange =
    addedThisVisit > 0
      ? displayDelta(visitStart.score, brainPowerForLanguage(languageId))
      : null

  const gloss = current ? getPrimaryGloss(current.entry) : ''
  const phonetic = current ? getPhonetic(current.entry) : ''

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <FocusHeader title={`${course.label} · Word check`} backLabel="← Back to Dashboard" backPath="/home" />
      <FocusPageContent>
        <div className="max-w-lg mx-auto px-4">
          <div className="mb-6">
            <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              <span>
                {doneCount.toLocaleString()} / {total.toLocaleString()}
              </span>
              <span>
                {placement.known.toLocaleString()} in your brain
                {powerChange != null ? ` · ${formatBrainPowerChange(powerChange)}` : ''}
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all"
                style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }}
              />
            </div>
          </div>

          {finished ? (
            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-8 text-center shadow-sm">
              <p className="text-4xl mb-3">🧠</p>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                Word check complete
              </h1>
              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {placement.known.toLocaleString()} word{placement.known === 1 ? '' : 's'} you already
                  knew {placement.known === 1 ? 'is' : 'are'} in your {course.label} brain.
                </p>
                {powerChange != null && (
                  <p className="mt-2 text-xl font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
                    {formatBrainPowerChange(powerChange)}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/brain/${course.id}`)}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500"
                >
                  Open brain
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/home')}
                  className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-800 dark:text-gray-100"
                >
                  Back to dashboard
                </button>
              </div>
            </div>
          ) : current ? (
            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 sm:p-8 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-4">
                Do you already know this?
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-50 break-words">
                {current.entry.headword}
              </h1>
              {phonetic && (
                <p className="mt-2 text-lg text-gray-400">[{phonetic}]</p>
              )}
              {current.entry.part_of_speech && (
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {current.entry.part_of_speech}
                </p>
              )}

              <div className="mt-8 min-h-[88px]">
                {revealed ? (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Meaning</p>
                    <p className="text-xl font-medium text-gray-900 dark:text-gray-100">{gloss || '—'}</p>
                    {current.entry.examples?.[0] && (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        “{current.entry.examples[0]}”
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRevealed(true)}
                    className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Show meaning
                  </button>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => record(false)}
                  className="py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  Still learning
                </button>
                <button
                  type="button"
                  onClick={() => record(true)}
                  className="py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500"
                >
                  I know this
                </button>
              </div>
              <p className="mt-4 text-center text-[11px] text-gray-400">
                Arrow keys: left still learning, right I know this. Space shows the meaning.
              </p>
            </div>
          ) : null}
        </div>
      </FocusPageContent>
    </div>
  )
}
