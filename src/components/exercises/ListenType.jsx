import { useState } from 'react'

function ListenType({ exercise, onAnswer, disabled }) {
  const [input, setInput] = useState('')
  const [played, setPlayed] = useState(false)

  const handlePlay = () => setPlayed(true)

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
      <div className="flex flex-col items-center space-y-2">
        <button type="button" onClick={handlePlay}
          className="p-4 bg-duo-blue hover:bg-duo-blue-dark text-white rounded-full text-2xl disabled:opacity-50 transition-colors"
          disabled={disabled} title="Play audio">
          🔊
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {played ? 'Listen again or type what you heard' : 'Tap to hear the audio'}
        </span>
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Type what you hear..."
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

export default ListenType
