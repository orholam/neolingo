export default function SessionStatsRibbon({ stats, reviewMode }) {
  const progressPct =
    stats.totalActive > 0
      ? Math.round((stats.totalSessionMastered / stats.totalActive) * 100)
      : 0

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <span className="text-xs text-gray-500 dark:text-gray-400">Session</span>
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums">
          {stats.totalActive}
        </span>
      </div>
      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <span className="text-xs text-gray-500 dark:text-gray-400">Session done</span>
        <span className="text-sm font-bold text-green-600 dark:text-green-400 tabular-nums">
          {stats.totalSessionMastered}/{stats.totalActive}
        </span>
      </div>
      {!reviewMode && (
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <span className="text-xs text-gray-500 dark:text-gray-400">Total mastered</span>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">
            {stats.totalUniversalMastered}
          </span>
        </div>
      )}
      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
        <span className="text-sm font-bold text-purple-600 dark:text-purple-400 tabular-nums">
          {progressPct}%
        </span>
      </div>
    </div>
  )
}
