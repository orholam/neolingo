function Speak({ exercise, onAnswer, disabled }) {
  const handleSkip = () => {
    onAnswer({ isCorrect: true, skipped: true })
  }

  return (
    <div className="space-y-6 text-center">
      <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        {exercise.text}
      </div>
      {exercise.translation && (
        <p className="text-gray-600 dark:text-gray-400">"{exercise.translation}"</p>
      )}
      <p className="text-gray-500 dark:text-gray-400">Say this sentence out loud</p>

      <div className="flex justify-center space-x-3">
        <div className="w-3 h-3 bg-duo-blue rounded-full animate-pulse"></div>
        <div className="w-3 h-3 bg-duo-blue rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 bg-duo-blue rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>

      <button type="button" onClick={handleSkip} disabled={disabled}
        className="px-8 py-4 bg-duo-green hover:bg-duo-green-dark text-white font-bold rounded-full text-lg transition-colors disabled:opacity-50">
        I said it!
      </button>
      <div>
        <button type="button" onClick={handleSkip} disabled={disabled}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline transition-colors">
          Skip speaking exercise
        </button>
      </div>
    </div>
  )
}

export default Speak
