import { useState, useEffect } from 'react'

// Initialize progress from localStorage or default
function getInitialProgress() {
  try {
    const stored = localStorage.getItem('languageProgress')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Error loading progress:', e)
  }
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return {
    completedLessons: [],
    mistakes: [], // Array of { lessonId, exerciseIndex, timestamp, exerciseType }
    totalXP: 0,
    dailyXP: 0,
    lastPracticeDate: null,
    lastDailyReset: today.toISOString(),
  }
}

// Save progress to localStorage
function saveProgress(progress) {
  try {
    localStorage.setItem('languageProgress', JSON.stringify(progress))
  } catch (e) {
    console.error('Error saving progress:', e)
  }
}

export function useProgress() {
  const [progress, setProgress] = useState(getInitialProgress)

  // Check and reset daily XP if needed
  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const lastReset = progress.lastDailyReset 
      ? new Date(progress.lastDailyReset)
      : null
    
    if (!lastReset || lastReset.getTime() < today.getTime()) {
      // Reset daily XP
      setProgress((prev) => ({
        ...prev,
        dailyXP: 0,
        lastDailyReset: today.toISOString(),
      }))
    }
  }, [progress.lastDailyReset])

  // Save to localStorage whenever progress changes
  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const completeLesson = (lessonId) => {
    setProgress((prev) => {
      if (prev.completedLessons.includes(lessonId)) {
        return prev // Already completed
      }
      return {
        ...prev,
        completedLessons: [...prev.completedLessons, lessonId],
      }
    })
  }

  const addMistake = (lessonId, exerciseIndex, exerciseType) => {
    setProgress((prev) => ({
      ...prev,
      mistakes: [
        ...prev.mistakes,
        {
          lessonId,
          exerciseIndex,
          exerciseType,
          timestamp: Date.now(),
        },
      ],
    }))
  }

  const addXP = (amount) => {
    setProgress((prev) => ({
      ...prev,
      totalXP: prev.totalXP + amount,
      dailyXP: prev.dailyXP + amount,
    }))
  }

  const resetDailyXP = () => {
    setProgress((prev) => ({
      ...prev,
      dailyXP: 0,
    }))
  }

  const getMistakesForLesson = (lessonId) => {
    return progress.mistakes.filter((m) => m.lessonId === lessonId)
  }

  const getMistakesByType = (exerciseType) => {
    return progress.mistakes.filter((m) => m.exerciseType === exerciseType)
  }

  const isLessonCompleted = (lessonId) => {
    return progress.completedLessons.includes(lessonId)
  }

  const clearMistakes = (lessonId) => {
    setProgress((prev) => ({
      ...prev,
      mistakes: prev.mistakes.filter((m) => m.lessonId !== lessonId),
    }))
  }

  return {
    progress,
    completeLesson,
    addMistake,
    addXP,
    resetDailyXP,
    getMistakesForLesson,
    getMistakesByType,
    isLessonCompleted,
    clearMistakes,
  }
}

