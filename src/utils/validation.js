// Centralized answer validation logic

export function validateAnswer(exercise, userAnswer) {
  switch (exercise.type) {
    case 'match-pairs':
      // Check if all pairs are matched correctly
      if (!Array.isArray(userAnswer)) return false
      if (userAnswer.length !== exercise.pairs.length) return false
      
      const matchedSet = new Set(
        userAnswer.map((p) => `${p.english}|${p.dadjo}`)
      )
      const correctSet = new Set(
        exercise.pairs.map((p) => `${p.english}|${p.dadjo}`)
      )
      
      return matchedSet.size === correctSet.size &&
        [...matchedSet].every((pair) => correctSet.has(pair))

    case 'translate':
    case 'listen-type':
      // String comparison (case-insensitive, trimmed)
      const user = String(userAnswer).toLowerCase().trim()
      const correct = String(exercise.answer).toLowerCase().trim()
      return user === correct

    case 'drag-drop':
    case 'word-bank':
      // Array comparison (order-independent)
      if (!Array.isArray(userAnswer) || !Array.isArray(exercise.correct)) {
        return false
      }
      const userSorted = [...userAnswer].sort()
      const correctSorted = [...exercise.correct].sort()
      return JSON.stringify(userSorted) === JSON.stringify(correctSorted)

    case 'multiple-choice':
    case 'fill-blank':
      // Index comparison
      return userAnswer === exercise.correct

    case 'speak':
      // Always true if attempted (not skipped)
      return userAnswer !== 'skipped'

    case 'read-select':
      // Set comparison
      if (!Array.isArray(userAnswer) || !Array.isArray(exercise.correct)) {
        return false
      }
      const userWordSet = new Set(userAnswer)
      const correctWordSet = new Set(exercise.correct)
      return (
        userWordSet.size === correctWordSet.size &&
        [...userWordSet].every((word) => correctWordSet.has(word))
      )

    case 'audio-picture':
      // Index comparison
      return userAnswer === exercise.correct

    default:
      console.warn(`Unknown exercise type for validation: ${exercise.type}`)
      return false
  }
}

// Normalize answer for comparison (handles variations)
export function normalizeAnswer(answer, exerciseType) {
  if (exerciseType === 'translate' || exerciseType === 'listen-type') {
    return String(answer).toLowerCase().trim()
  }
  return answer
}

// Get feedback message for incorrect answers
export function getFeedbackMessage(exercise, isCorrect) {
  if (isCorrect) {
    return 'Correct! Great job!'
  }

  switch (exercise.type) {
    case 'match-pairs':
      return 'Try matching the words again.'
    case 'translate':
    case 'listen-type':
      return `The correct answer is: ${exercise.answer}`
    case 'multiple-choice':
    case 'fill-blank':
      return `The correct answer is: ${exercise.options[exercise.correct]}`
    case 'drag-drop':
    case 'word-bank':
      return `The correct sentence is: ${exercise.correct.join(' ')}`
    case 'read-select':
      return 'Select only the real words.'
    default:
      return 'Incorrect. Try again!'
  }
}

