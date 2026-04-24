import { useState } from 'react'

function Story({ segment, onAnswer, onContinue, disabled }) {
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)

  if (segment.type === 'choice') {
    const handleChoice = (choice) => {
      if (disabled) return
      setSelectedChoice(choice)
      setShowFeedback(true)
      onAnswer({ isCorrect: choice.correct, choice, feedback: choice.feedback })
    }

    return (
      <div className="space-y-4">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
          {segment.question}
        </p>
        <div className="space-y-3">
          {segment.choices.map((choice, index) => {
            const isSelected = selectedChoice === choice
            let cls = 'w-full text-left px-6 py-4 rounded-xl font-semibold transition-all border-2 '
            if (showFeedback) {
              if (choice.correct)           cls += 'bg-duo-green border-duo-green text-white'
              else if (isSelected)          cls += 'bg-duo-red border-duo-red text-white'
              else                          cls += 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'
            } else {
              cls += isSelected
                ? 'bg-duo-blue border-duo-blue text-white'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:border-duo-blue hover:bg-blue-50 dark:hover:bg-blue-900/30'
            }
            return (
              <button key={index} onClick={() => handleChoice(choice)}
                disabled={disabled || showFeedback} className={cls}>
                <div className="font-bold">{choice.text}</div>
                <div className="text-sm opacity-80 mt-1">{choice.translation}</div>
              </button>
            )
          })}
        </div>

        {showFeedback && (
          <div className={`mt-4 p-4 rounded-lg ${
            selectedChoice?.correct
              ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200'
          }`}>
            <p className="font-semibold">
              {selectedChoice?.correct ? '🎉 Correct!' : `❌ ${selectedChoice?.feedback || 'Incorrect'}`}
            </p>
          </div>
        )}

        {showFeedback && (
          <button onClick={onContinue}
            className="w-full bg-duo-green hover:bg-duo-green-dark text-white font-bold py-4 rounded-lg transition-colors">
            Continue
          </button>
        )}
      </div>
    )
  }

  if (segment.type === 'question') {
    const [selectedOption, setSelectedOption] = useState(null)
    const [showResult, setShowResult] = useState(false)

    const handleSelect = (index) => {
      if (disabled || showResult) return
      setSelectedOption(index)
      const isCorrect = index === segment.correct
      setShowResult(true)
      onAnswer({ isCorrect, selectedOption: index })
    }

    return (
      <div className="space-y-4">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
          {segment.question}
        </p>
        <div className="space-y-3">
          {segment.options.map((option, index) => {
            let cls = 'w-full text-left px-6 py-4 rounded-xl font-semibold transition-all border-2 '
            if (showResult) {
              if (index === segment.correct)            cls += 'bg-duo-green border-duo-green text-white'
              else if (index === selectedOption)        cls += 'bg-duo-red border-duo-red text-white'
              else                                      cls += 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'
            } else {
              cls += selectedOption === index
                ? 'bg-duo-blue border-duo-blue text-white'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:border-duo-blue hover:bg-blue-50 dark:hover:bg-blue-900/30'
            }
            return (
              <button key={index} onClick={() => handleSelect(index)}
                disabled={disabled || showResult} className={cls}>
                {option}
              </button>
            )
          })}
        </div>
        {showResult && (
          <button onClick={onContinue}
            className="w-full bg-duo-green hover:bg-duo-green-dark text-white font-bold py-4 rounded-lg transition-colors mt-4">
            Continue
          </button>
        )}
      </div>
    )
  }

  // Text / narration segment
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-700/60 rounded-xl p-6 mb-4">
        <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3 text-center">
          {segment.text}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 text-center italic">
          {segment.translation}
        </div>
      </div>

      <div className="flex items-center justify-center space-x-2 mb-4">
        <button
          className="p-3 bg-duo-blue hover:bg-duo-blue-dark text-white rounded-lg disabled:opacity-50 transition-colors"
          disabled={disabled} title="Play audio"
        >
          🔊 Play
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-400">Tap to hear pronunciation</span>
      </div>

      <button onClick={onContinue} disabled={disabled}
        className="w-full bg-duo-green hover:bg-duo-green-dark text-white font-bold py-4 rounded-lg transition-colors disabled:opacity-50">
        Continue
      </button>
    </div>
  )
}

export default Story
