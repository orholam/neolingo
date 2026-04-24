function XPDisplay({ xp, streak, gems = 500, showStreak = true }) {
  return (
    <div className="flex items-center space-x-4">
      {showStreak && streak > 0 && (
        <div className="flex items-center space-x-2 bg-duo-green px-4 py-2 rounded-full">
          <span className="text-2xl">🔥</span>
          <span className="font-bold text-white">{streak}</span>
        </div>
      )}
      <div className="flex items-center space-x-2 bg-duo-yellow px-4 py-2 rounded-full">
        <span className="text-xl">💎</span>
        <span className="font-bold text-gray-800">{gems}</span>
      </div>
      {xp > 0 && (
        <div className="text-sm font-medium text-gray-600">
          {xp} XP
        </div>
      )}
    </div>
  )
}

export default XPDisplay



