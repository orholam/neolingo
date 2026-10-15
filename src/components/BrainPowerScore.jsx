import { useBrainPower } from '../hooks/useBrainPower'

function dropLine(drop) {
  if (drop == null) return null
  if (drop > 0) return `Down ${drop} since you last practiced`
  return 'Same as when you last practiced'
}

export default function BrainPowerScore({ languageId, masteredIds = null, variant = 'card' }) {
  const { score, drop } = useBrainPower(languageId, masteredIds)
  const since = dropLine(drop)

  if (variant === 'overlay') {
    return (
      <div className="pointer-events-none select-none">
        <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
          Brain power
        </p>
        <p className="text-3xl font-bold tabular-nums text-gray-900 dark:text-gray-50 leading-none mt-0.5">
          {score}
        </p>
        {since && (
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{since}</p>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-white dark:bg-gray-900 p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
        Brain power
      </p>
      <p className="mt-1 text-4xl font-bold tabular-nums text-gray-900 dark:text-gray-50">{score}</p>
      {since && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{since}</p>
      )}
    </div>
  )
}
