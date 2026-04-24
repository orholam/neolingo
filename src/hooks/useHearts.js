import { useState, useEffect } from 'react'

const MAX_HEARTS = 5
const HEART_REGENERATION_TIME = 4 * 60 * 60 * 1000 // 4 hours in milliseconds

// Initialize hearts from localStorage or default
function getInitialHearts() {
  try {
    const stored = localStorage.getItem('languageHearts')
    if (stored) {
      const data = JSON.parse(stored)
      const lastUpdate = new Date(data.lastUpdate)
      const now = new Date()
      
      // Calculate how many hearts should have regenerated
      const timeDiff = now - lastUpdate
      const heartsToRegenerate = Math.floor(timeDiff / HEART_REGENERATION_TIME)
      
      if (heartsToRegenerate > 0) {
        const newHearts = Math.min(data.hearts + heartsToRegenerate, MAX_HEARTS)
        return {
          hearts: newHearts,
          lastUpdate: now.toISOString(),
        }
      }
      
      return {
        hearts: data.hearts,
        lastUpdate: data.lastUpdate,
      }
    }
  } catch (e) {
    console.error('Error loading hearts:', e)
  }
  
  return {
    hearts: MAX_HEARTS,
    lastUpdate: new Date().toISOString(),
  }
}

// Save hearts to localStorage
function saveHearts(heartsData) {
  try {
    localStorage.setItem('languageHearts', JSON.stringify(heartsData))
  } catch (e) {
    console.error('Error saving hearts:', e)
  }
}

export function useHearts() {
  const [heartsData, setHeartsData] = useState(getInitialHearts)
  const hearts = heartsData.hearts

  // Save to localStorage whenever hearts change
  useEffect(() => {
    saveHearts(heartsData)
  }, [heartsData])

  // Check for heart regeneration periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartsData((prev) => {
        if (prev.hearts >= MAX_HEARTS) {
          return prev // Already at max
        }
        
        const lastUpdate = new Date(prev.lastUpdate)
        const now = new Date()
        const timeDiff = now - lastUpdate
        
        if (timeDiff >= HEART_REGENERATION_TIME) {
          const newHearts = Math.min(prev.hearts + 1, MAX_HEARTS)
          return {
            hearts: newHearts,
            lastUpdate: now.toISOString(),
          }
        }
        
        return prev
      })
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  const loseHeart = () => {
    setHeartsData((prev) => {
      if (prev.hearts > 0) {
        return {
          hearts: prev.hearts - 1,
          lastUpdate: new Date().toISOString(),
        }
      }
      return prev
    })
  }

  const refillHearts = () => {
    setHeartsData({
      hearts: MAX_HEARTS,
      lastUpdate: new Date().toISOString(),
    })
  }

  const hasHearts = () => {
    return hearts > 0
  }

  const getTimeUntilNextHeart = () => {
    if (hearts >= MAX_HEARTS) {
      return null // Already at max
    }
    
    const lastUpdate = new Date(heartsData.lastUpdate)
    const now = new Date()
    const timeDiff = now - lastUpdate
    const timeUntilNext = HEART_REGENERATION_TIME - (timeDiff % HEART_REGENERATION_TIME)
    
    return timeUntilNext
  }

  return {
    hearts,
    maxHearts: MAX_HEARTS,
    loseHeart,
    refillHearts,
    hasHearts,
    getTimeUntilNextHeart,
  }
}

