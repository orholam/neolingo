function ProgressBar({ current, total, xp = 0, color = 'duo-green' }) {
  const progress = total > 0 ? (current / total) * 100 : 0
  const colorClasses = {
    'duo-green': 'bg-duo-green',
    'duo-blue': 'bg-duo-blue',
    'duo-purple': 'bg-duo-purple',
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">
          {current} / {total}
        </span>
        {xp > 0 && (
          <span className="text-sm font-medium text-gray-600">{xp} XP</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`${colorClasses[color] || colorClasses['duo-green']} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  )
}

export default ProgressBar



