import { useEffect, useState } from 'react'
import { getCachedBrainPower, invalidateBrainPowerCache } from '../utils/brainPower'

/**
 * Brain power for the score page.
 * Read when the page opens. Kept for a short while so hopping between Home
 * and the brain does not recompute it. Coming back to the tab forces a new
 * read, which is when a fade since the last practice shows up.
 */
export function useBrainPower(languageId, masteredIds = null) {
  const idKey = Array.isArray(masteredIds) ? masteredIds.join('\0') : ''
  const [reading, setReading] = useState(() => ({
    languageId,
    idKey,
    ...getCachedBrainPower(languageId, { masteredIds }),
  }))

  let current = reading
  if (reading.languageId !== languageId || reading.idKey !== idKey) {
    current = {
      languageId,
      idKey,
      ...getCachedBrainPower(languageId, { maxAgeMs: 0, masteredIds }),
    }
    setReading(current)
  }

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      invalidateBrainPowerCache()
      setReading({
        languageId,
        idKey,
        ...getCachedBrainPower(languageId, { maxAgeMs: 0, masteredIds }),
      })
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [languageId, idKey, masteredIds])

  return current
}
