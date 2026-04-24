import { useState, useEffect } from 'react'

function MatchPairs({ exercise, onAnswer, disabled }) {
  const [matchedPairs, setMatchedPairs] = useState([])
  const [selectedLeft, setSelectedLeft] = useState(null)
  const [selectedRight, setSelectedRight] = useState(null)
  const [wrongAttempt, setWrongAttempt] = useState(null) // Track wrong attempts for visual feedback

  useEffect(() => {
    setMatchedPairs([])
    setSelectedLeft(null)
    setSelectedRight(null)
    setWrongAttempt(null)
  }, [exercise])

  // Shuffle each side independently
  const [shuffledLeft, setShuffledLeft] = useState([])
  const [shuffledRight, setShuffledRight] = useState([])

  useEffect(() => {
    // Separate words into left (English) and right (Dadjo)
    const leftWords = exercise.pairs.map((p) => p.english)
    const rightWords = exercise.pairs.map((p) => p.dadjo)
    
    setShuffledLeft([...leftWords].sort(() => Math.random() - 0.5))
    setShuffledRight([...rightWords].sort(() => Math.random() - 0.5))
  }, [exercise])

  const handleLeftClick = (word) => {
    if (disabled) return

    // If this word is already matched, do nothing
    const isMatched = matchedPairs.some((m) => m.english === word)
    if (isMatched) return

    // If clicking the same word, deselect it
    if (selectedLeft === word) {
      setSelectedLeft(null)
      setWrongAttempt(null)
      return
    }

    setSelectedLeft(word)
    setWrongAttempt(null) // Clear any previous wrong attempt
    
    // If right is already selected, try to match
    if (selectedRight) {
      tryMatch(word, selectedRight)
    }
  }

  const handleRightClick = (word) => {
    if (disabled) return

    // If this word is already matched, do nothing
    const isMatched = matchedPairs.some((m) => m.dadjo === word)
    if (isMatched) return

    // If clicking the same word, deselect it
    if (selectedRight === word) {
      setSelectedRight(null)
      setWrongAttempt(null)
      return
    }

    setSelectedRight(word)
    setWrongAttempt(null) // Clear any previous wrong attempt
    
    // If left is already selected, try to match
    if (selectedLeft) {
      tryMatch(selectedLeft, word)
    }
  }

  const tryMatch = (englishWord, dadjoWord) => {
    // Check if it's a valid pair
    const pair = exercise.pairs.find(
      (p) => p.english === englishWord && p.dadjo === dadjoWord
    )

    if (pair && !matchedPairs.some(
      (m) => m.english === pair.english && m.dadjo === pair.dadjo
    )) {
      // Correct match
      const newMatches = [
        ...matchedPairs,
        { english: pair.english, dadjo: pair.dadjo },
      ]
      setMatchedPairs(newMatches)
      setSelectedLeft(null)
      setSelectedRight(null)
      setWrongAttempt(null)

      if (newMatches.length === exercise.pairs.length) {
        // All pairs matched
        onAnswer({ isCorrect: true, userAnswer: newMatches })
      }
    } else {
      // Wrong match - show visual feedback and penalize
      setWrongAttempt({ left: englishWord, right: dadjoWord })
      onAnswer({ isCorrect: false, userAnswer: null })
      
      // Clear selection after showing wrong feedback
      setTimeout(() => {
        setSelectedLeft(null)
        setSelectedRight(null)
        setWrongAttempt(null)
      }, 1000) // Show wrong feedback for 1 second
    }
  }

  const isLeftMatched = (word) => {
    return matchedPairs.some((m) => m.english === word)
  }

  const isRightMatched = (word) => {
    return matchedPairs.some((m) => m.dadjo === word)
  }

  const isLeftWrong = (word) => {
    return wrongAttempt && wrongAttempt.left === word
  }

  const isRightWrong = (word) => {
    return wrongAttempt && wrongAttempt.right === word
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
        Tap a word on the left, then its match on the right
      </p>
      <div className="grid grid-cols-2 gap-4">
        {/* Left column - English */}
        <div className="space-y-3">
          {shuffledLeft.map((word, idx) => {
            const isMatched = isLeftMatched(word)
            const isSelected = selectedLeft === word && !wrongAttempt
            const isWrong = isLeftWrong(word)

            return (
              <button
                key={idx}
                onClick={() => handleLeftClick(word)}
                disabled={disabled || isMatched}
                className={`w-full px-6 py-4 rounded-xl font-semibold border-2 transition-all ${
                  isMatched
                    ? 'bg-duo-green border-duo-green text-white'
                    : isWrong
                    ? 'bg-duo-red border-duo-red text-white animate-pulse'
                    : isSelected
                    ? 'bg-duo-blue border-duo-blue text-white'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:border-duo-blue hover:bg-blue-50 dark:hover:bg-blue-900/30'
                } disabled:opacity-50`}
              >
                {word}
              </button>
            )
          })}
        </div>

        {/* Right column - Dadjo */}
        <div className="space-y-3">
          {shuffledRight.map((word, idx) => {
            const isMatched = isRightMatched(word)
            const isSelected = selectedRight === word && !wrongAttempt
            const isWrong = isRightWrong(word)

            return (
              <button
                key={idx}
                onClick={() => handleRightClick(word)}
                disabled={disabled || isMatched}
                className={`w-full px-6 py-4 rounded-xl font-semibold border-2 transition-all ${
                  isMatched
                    ? 'bg-duo-green border-duo-green text-white'
                    : isWrong
                    ? 'bg-duo-red border-duo-red text-white animate-pulse'
                    : isSelected
                    ? 'bg-duo-blue border-duo-blue text-white'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:border-duo-blue hover:bg-blue-50 dark:hover:bg-blue-900/30'
                } disabled:opacity-50`}
              >
                {word}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MatchPairs
