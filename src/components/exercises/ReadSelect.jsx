import { useState, useEffect } from 'react'

function ReadSelect({ exercise, onAnswer, disabled }) {
  const [selectedWords, setSelectedWords] = useState([])

  useEffect(() => {
    setSelectedWords([])
  }, [exercise])

  const handleWordSelect = (word) => {
    if (disabled) return

    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter((w) => w !== word))
    } else {
      setSelectedWords([...selectedWords, word])
    }
  }

  const handleSubmit = () => {
    if (disabled) return

    const selectedSet = new Set(selectedWords)
    const correctSet = new Set(exercise.correct)
    
    // Check if sets match exactly
    const isCorrect =
      selectedSet.size === correctSet.size &&
      [...selectedSet].every((word) => correctSet.has(word))

    onAnswer({ isCorrect, userAnswer: selectedWords })
  }

  const isCorrectWord = (word) => {
    return exercise.correct.includes(word)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Tap all the real {exercise.language || 'Dadjo'} words
      </p>

      <div className="flex flex-wrap gap-3">
        {exercise.words.map((word, idx) => {
          const isSelected = selectedWords.includes(word)
          const isCorrect = isCorrectWord(word)

          let buttonClass =
            'px-6 py-4 rounded-xl font-semibold border-2 transition-all '

          if (disabled) {
            if (isCorrect) {
              buttonClass += 'bg-duo-green border-duo-green text-white'
            } else if (isSelected) {
              buttonClass += 'bg-duo-red border-duo-red text-white'
            } else {
              buttonClass += 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'
            }
          } else {
            buttonClass += isSelected
              ? 'bg-duo-blue border-duo-blue text-white'
              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:border-duo-blue hover:bg-blue-50 dark:hover:bg-blue-900/30'
          }

          return (
            <button
              key={idx}
              onClick={() => handleWordSelect(word)}
              disabled={disabled}
              className={buttonClass}
            >
              {word}
            </button>
          )
        })}
      </div>

      {!disabled && (
        <button
          onClick={handleSubmit}
          disabled={selectedWords.length === 0}
          className="w-full bg-duo-green hover:bg-duo-green-dark text-white font-bold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Check
        </button>
      )}
    </div>
  )
}

export default ReadSelect

