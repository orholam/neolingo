import { useMemo } from 'react'
import { useProgress } from './useProgress'
import { getRandomExercises } from '../data/exerciseData'

// Spaced repetition intervals (in milliseconds)
const INTERVALS = {
  immediate: 0, // Review immediately after mistake
  short: 24 * 60 * 60 * 1000, // 1 day
  medium: 3 * 24 * 60 * 60 * 1000, // 3 days
  long: 7 * 24 * 60 * 60 * 1000, // 7 days
}

// Determine which interval to use based on mistake count
function getReviewInterval(mistakeCount) {
  if (mistakeCount === 1) return INTERVALS.immediate
  if (mistakeCount === 2) return INTERVALS.short
  if (mistakeCount <= 4) return INTERVALS.medium
  return INTERVALS.long
}

// Check if a mistake is due for review
function isDueForReview(mistake, currentTime) {
  const mistakeTime = mistake.timestamp
  const mistakeCount = mistake.reviewCount || 1
  const interval = getReviewInterval(mistakeCount)
  const nextReviewTime = mistakeTime + interval

  return currentTime >= nextReviewTime
}

export function useSpacedRepetition() {
  const { progress, getMistakesByType, clearMistakes } = useProgress()

  // Get mistakes that are due for review
  const getMistakesDueForReview = useMemo(() => {
    const currentTime = Date.now()
    const allMistakes = progress.mistakes || []

    // Group mistakes by lesson and exercise type
    const mistakesByLesson = {}
    allMistakes.forEach((mistake) => {
      if (!mistakesByLesson[mistake.lessonId]) {
        mistakesByLesson[mistake.lessonId] = []
      }
      mistakesByLesson[mistake.lessonId].push(mistake)
    })

    // Filter mistakes that are due for review
    const dueMistakes = []
    Object.keys(mistakesByLesson).forEach((lessonId) => {
      const lessonMistakes = mistakesByLesson[lessonId]
      lessonMistakes.forEach((mistake) => {
        if (isDueForReview(mistake, currentTime)) {
          dueMistakes.push(mistake)
        }
      })
    })

    return dueMistakes
  }, [progress.mistakes])

  // Get practice exercises based on mistakes
  const getPracticeExercises = (count = 10) => {
    const dueMistakes = getMistakesDueForReview

    if (dueMistakes.length === 0) {
      // No mistakes to review, return random exercises from completed lessons
      const completedLessons = progress.completedLessons || []
      if (completedLessons.length === 0) {
        return []
      }
      return getRandomExercises(count, completedLessons)
    }

    // Get unique lesson IDs from mistakes
    const lessonIds = [...new Set(dueMistakes.map((m) => m.lessonId))]

    // Get random exercises from those lessons
    const exercises = getRandomExercises(count, lessonIds)

    return exercises
  }

  // Mark a mistake as reviewed (increment review count)
  const markAsReviewed = (lessonId, exerciseIndex) => {
    // This would ideally update the mistake's reviewCount
    // For now, we'll track this separately or clear the mistake after successful review
    // In a full implementation, we'd update the mistake object
  }

  // Get statistics
  const getStats = () => {
    const totalMistakes = progress.mistakes?.length || 0
    const dueForReview = getMistakesDueForReview.length
    const byType = {}

    progress.mistakes?.forEach((mistake) => {
      if (!byType[mistake.exerciseType]) {
        byType[mistake.exerciseType] = 0
      }
      byType[mistake.exerciseType]++
    })

    return {
      totalMistakes,
      dueForReview,
      byType,
    }
  }

  return {
    getMistakesDueForReview,
    getPracticeExercises,
    markAsReviewed,
    getStats,
  }
}



