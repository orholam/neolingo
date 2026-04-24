import { useState } from 'react'

function Translate({ exercise, onAnswer, disabled }) {
  const [input, setInput] = useState('')

  const handleSubmit = () => {
    if (disabled || !input.trim()) return
    const answer = input.trim().toLowerCase()
    const correct = exercise.answer?.toLowerCase() ?? ''
    onAnswer({ isCorrect: answer === correct, userAnswer: input.trim() })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center space-x-2">
        <button type="button"
          className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50 transition-colors"
          disabled={disabled} title="Play audio">
          🔊
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-400">Tap to hear</span>
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Type your answer..."
        className="w-full px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-duo-green disabled:opacity-70 transition-all"
      />
      {exercise.hint && (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">{exercise.hint}</p>
      )}

      <button type="button" onClick={handleSubmit}
        disabled={disabled || !input.trim()}
        className="w-full bg-duo-green hover:bg-duo-green-dark text-white font-bold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        Check
      </button>
    </div>
  )
}

export default Translate
