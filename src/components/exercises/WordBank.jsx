import { useState, useEffect } from 'react'

function WordBank({ exercise, onAnswer, disabled }) {
  const { words = [], correct = [] } = exercise
  const [selected, setSelected] = useState([])
  const [bank, setBank] = useState([])

  useEffect(() => {
    setSelected([])
    setBank([...words].sort(() => Math.random() - 0.5))
  }, [exercise, words])

  const handleBankClick = (word, idx) => {
    if (disabled || selected.length >= correct.length) return
    const newSelected = [...selected, word]
    setSelected(newSelected)
    setBank((prev) => prev.filter((_, i) => i !== idx))
    if (newSelected.length === correct.length) {
      const isCorrect = correct.every((c, i) => c === newSelected[i])
      onAnswer({ isCorrect, userAnswer: newSelected })
    }
  }

  const handleSelectedClick = (idx) => {
    if (disabled) return
    const word = selected[idx]
    setSelected((prev) => prev.filter((_, i) => i !== idx))
    setBank((prev) => [...prev, word])
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">
        Tap words to build the sentence
      </p>
      <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 min-h-[56px] flex flex-wrap gap-2 items-center">
        {selected.map((word, idx) => (
          <button key={`sel-${idx}`} type="button" onClick={() => handleSelectedClick(idx)}
            disabled={disabled}
            className="px-4 py-2 bg-duo-blue text-white rounded-lg font-semibold hover:bg-duo-blue-dark disabled:opacity-50 transition-colors">
            {word}
          </button>
        ))}
        {selected.length === 0 && (
          <span className="text-gray-400 dark:text-gray-500 text-sm">Your answer appears here…</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {bank.map((word, idx) => (
          <button key={`bank-${idx}`} type="button" onClick={() => handleBankClick(word, idx)}
            disabled={disabled}
            className="px-4 py-2 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:border-duo-blue hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-50 transition-colors">
            {word}
          </button>
        ))}
      </div>
    </div>
  )
}

export default WordBank
