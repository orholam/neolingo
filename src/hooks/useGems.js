import { useState, useEffect } from 'react'

// Initialize gems from localStorage or default
function getInitialGems() {
  try {
    const stored = localStorage.getItem('languageGems')
    if (stored) {
      return parseInt(stored, 10)
    }
  } catch (e) {
    console.error('Error loading gems:', e)
  }
  
  return 500 // Starting gems
}

// Save gems to localStorage
function saveGems(gems) {
  try {
    localStorage.setItem('languageGems', gems.toString())
  } catch (e) {
    console.error('Error saving gems:', e)
  }
}

export function useGems() {
  const [gems, setGems] = useState(getInitialGems)

  // Save to localStorage whenever gems change
  useEffect(() => {
    saveGems(gems)
  }, [gems])

  const addGems = (amount) => {
    setGems((prev) => {
      const newAmount = prev + amount
      saveGems(newAmount)
      return newAmount
    })
  }

  const spendGems = (amount) => {
    setGems((prev) => {
      if (prev >= amount) {
        const newAmount = prev - amount
        saveGems(newAmount)
        return newAmount
      }
      return prev // Not enough gems
    })
  }

  const canAfford = (amount) => {
    return gems >= amount
  }

  // Earn gems for completing lessons
  const earnGemsForLesson = () => {
    addGems(10) // 10 gems per lesson
  }

  // Earn gems for daily goal
  const earnGemsForDailyGoal = () => {
    addGems(20) // 20 gems for completing daily goal
  }

  return {
    gems,
    addGems,
    spendGems,
    canAfford,
    earnGemsForLesson,
    earnGemsForDailyGoal,
  }
}

