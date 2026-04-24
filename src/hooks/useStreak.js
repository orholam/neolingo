import { useState, useEffect } from 'react'

// Get initial streak from localStorage
function getInitialStreak() {
  try {
    const stored = localStorage.getItem('languageStreak')
    if (stored) {
      const data = JSON.parse(stored)
      const lastDate = new Date(data.lastDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      lastDate.setHours(0, 0, 0, 0)
      
      // Check if streak is still valid (within 24 hours)
      const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === 0) {
        // Same day, keep streak
        return data.streak
      } else if (daysDiff === 1) {
        // Yesterday, continue streak
        return data.streak
      } else {
        // Streak broken
        return 0
      }
    }
  } catch (e) {
    console.error('Error loading streak:', e)
  }
  
  return 0
}

// Save streak to localStorage
function saveStreak(streak) {
  try {
    localStorage.setItem(
      'languageStreak',
      JSON.stringify({
        streak,
        lastDate: new Date().toISOString(),
      })
    )
  } catch (e) {
    console.error('Error saving streak:', e)
  }
}

export function useStreak() {
  const [streak, setStreak] = useState(getInitialStreak)

  // Update streak when user completes a lesson or practice
  const updateStreak = () => {
    setStreak((currentStreak) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      try {
        const stored = localStorage.getItem('languageStreak')
        if (stored) {
          const data = JSON.parse(stored)
          const lastDate = new Date(data.lastDate)
          lastDate.setHours(0, 0, 0, 0)
          
          const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24))
          
          if (daysDiff === 0) {
            // Already updated today
            return currentStreak
          } else if (daysDiff === 1) {
            // Continue streak
            const newStreak = currentStreak + 1
            saveStreak(newStreak)
            return newStreak
          } else {
            // Reset streak
            saveStreak(1)
            return 1
          }
        } else {
          // First time
          saveStreak(1)
          return 1
        }
      } catch (e) {
        console.error('Error updating streak:', e)
        return currentStreak
      }
    })
  }

  // Check if streak is maintained today
  const isStreakMaintained = () => {
    try {
      const stored = localStorage.getItem('languageStreak')
      if (stored) {
        const data = JSON.parse(stored)
        const lastDate = new Date(data.lastDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        lastDate.setHours(0, 0, 0, 0)
        
        return today.getTime() === lastDate.getTime()
      }
    } catch (e) {
      console.error('Error checking streak:', e)
    }
    return false
  }

  return {
    streak,
    updateStreak,
    isStreakMaintained,
  }
}



