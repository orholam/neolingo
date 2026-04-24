import { useState } from 'react'

function FillBlank({ exercise, onAnswer, disabled, showResult, isCorrect: resultCorrect, selectedAnswer }) {
  const [selected, setSelected] = useState(null)

  const handleSelect = (index) => {
    if (disabled || selected !== null) return
    setSelected(index)
    onAnswer({ isCorrect: index === exercise.correct, userAnswer: index })
  }

  const getClass = (index) => {
    let cls = 'w-full text-left px-6 py-4 rounded-xl font-semibold transition-all border-2 '
    if (showResult || selected !== null) {
      if (index === exercise.correct)       cls += 'bg-duo-green border-duo-green text-white'
      else if (index === (selectedAnswer ?? selected)) cls += 'bg-duo-red border-duo-red text-white'
      else                                 cls += 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
    } else {
      cls += 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:border-duo-blue hover:bg-blue-50 dark:hover:bg-blue-900/30'
    }
    return cls
  }

  return (
    <div className="space-y-4">
      {exercise.text && (
        <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center py-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          {exercise.text}
        </div>
      )}
      <div className="space-y-3">
        {exercise.options.map((option, index) => (
          <button key={index} type="button" onClick={() => handleSelect(index)}
            disabled={disabled || selected !== null} className={getClass(index)}>
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

export default FillBlank
