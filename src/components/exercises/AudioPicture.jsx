import { useState } from 'react'

export default function AudioPicture({ exercise, onAnswer, disabled }) {
  const [selected, setSelected] = useState(null)

  const handleSelect = (index) => {
    if (disabled || selected !== null) return
    setSelected(index)
    onAnswer({ isCorrect: index === exercise.correct, userAnswer: index })
  }

  const getClass = (index) => {
    let cls = 'aspect-square rounded-xl border-4 font-semibold transition-all flex flex-col items-center justify-center text-2xl p-4 '
    if (selected !== null) {
      if (index === exercise.correct)  cls += 'bg-duo-green border-duo-green text-white'
      else if (index === selected)     cls += 'bg-duo-red border-duo-red text-white'
      else                             cls += 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'
    } else {
      cls += 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-duo-blue hover:bg-blue-50 dark:hover:bg-blue-900/30'
    }
    return cls
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <button type="button"
          className="px-6 py-3 bg-duo-blue hover:bg-duo-blue-dark text-white font-bold rounded-lg disabled:opacity-50 transition-colors"
          disabled={disabled} title="Play audio">
          🔊 Play
        </button>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
        Select the matching picture
      </p>
      <div className="grid grid-cols-2 gap-3">
        {(exercise.options || []).map((option, index) => (
          <button key={index} type="button" onClick={() => handleSelect(index)}
            disabled={disabled || selected !== null} className={getClass(index)}>
            <span>{option.emoji || '❓'}</span>
            <span className="text-sm mt-1 font-medium">{option.label || option}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
