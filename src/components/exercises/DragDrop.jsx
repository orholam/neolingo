import { useState, useEffect } from 'react'

function DragDrop({ exercise, onAnswer, disabled }) {
  const { question, words = [], correct = [] } = exercise
  const [slots, setSlots] = useState([])
  const [bank, setBank] = useState([])

  useEffect(() => {
    setSlots([])
    setBank([...words].sort(() => Math.random() - 0.5))
  }, [exercise, words])

  const handleWordClick = (word, bankIndex) => {
    if (disabled || slots.length >= correct.length) return
    const newSlots = [...slots, word]
    setSlots(newSlots)
    setBank((prev) => prev.filter((_, i) => i !== bankIndex))
    if (newSlots.length === correct.length) {
      const isCorrect =
        correct.length === newSlots.length &&
        correct.every((c, i) => c === newSlots[i])
      onAnswer({ isCorrect, userAnswer: newSlots })
    }
  }

  const handleSlotClick = (slotIndex) => {
    if (disabled) return
    const word = slots[slotIndex]
    setSlots((prev) => prev.filter((_, i) => i !== slotIndex))
    setBank((prev) => [...prev, word].sort(() => Math.random() - 0.5))
  }

  return (
    <div className="space-y-4">
      {question && (
        <p className="text-sm text-gray-600 mb-4 text-center">{question}</p>
      )}
      {/* Answer slots */}
      <div className="flex flex-wrap gap-2 justify-center min-h-[3rem] py-2 px-3 rounded-xl bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600">
        {slots.map((word, idx) => (
          <button
            key={`${word}-${idx}`}
            type="button"
            onClick={() => handleSlotClick(idx)}
            disabled={disabled}
            className="px-4 py-2 rounded-lg bg-duo-blue text-white font-semibold hover:bg-blue-600 disabled:opacity-50"
          >
            {word}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Tap a word to add it; tap a word above to remove it
      </p>
      {/* Word bank */}
      <div className="flex flex-wrap gap-2 justify-center">
        {bank.map((word, idx) => (
          <button
            key={`${word}-${idx}`}
            type="button"
            onClick={() => handleWordClick(word, idx)}
            disabled={disabled}
            className="px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-semibold hover:border-duo-blue hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-50"
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  )
}

export default DragDrop
