import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth, POST_AUTH_HOME_KEY } from './AuthContext'
import { registerLearningSyncHandlers, setLearningHydrating } from '../lib/learningSyncBridge'
import {
  SYNC_KEY_SET,
  hasMeaningfulProgress,
  mergeSnapshots,
  readLocalSnapshot,
  rowFromSnapshot,
  snapshotFromRow,
  snapshotsEqual,
  writeLocalSnapshot,
} from '../lib/learningState'

const LearningSyncContext = createContext({
  status: 'idle',
  lastError: null,
  flushNow: async () => {},
})

const HYDRATE_FLAG = 'neolingoCloudHydratedUser'
const IMPORT_NOTICE = 'neolingoImportedLocalProgress'

async function upsertState(userId, snapshot, extra = {}) {
  const { error } = await supabase
    .from('user_learning_state')
    .upsert(rowFromSnapshot(userId, snapshot, extra), { onConflict: 'user_id' })
  if (error) throw error
}

function reloadAfterHydrate() {
  let dest = null
  try {
    dest = sessionStorage.getItem(POST_AUTH_HOME_KEY)
  } catch {
    // ignore
  }
  if (dest) {
    window.location.assign(dest)
    return
  }
  // Logged in on the marketing page: go to the dashboard instead of staying put.
  if (window.location.pathname === '/') {
    window.location.assign('/home')
    return
  }
  window.location.reload()
}

export function LearningSyncProvider({ children }) {
  const { user } = useAuth()
  const [status, setStatus] = useState('idle')
  const [lastError, setLastError] = useState(null)
  const syncReadyRef = useRef(false)
  const bypassSyncRef = useRef(false)
  const timerRef = useRef(null)
  const userIdRef = useRef(null)
  const originalSetItemRef = useRef(null)

  const flushNow = useCallback(async () => {
    const userId = userIdRef.current
    if (!userId || !supabase) return
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    try {
      await upsertState(userId, readLocalSnapshot())
      setStatus('synced')
      setLastError(null)
    } catch (err) {
      console.error('Failed to flush learning state', err)
      setLastError(err.message || 'Sync failed')
      setStatus('error')
      throw err
    }
  }, [])

  const prepareLogout = useCallback(async () => {
    try {
      if (userIdRef.current && syncReadyRef.current) {
        await flushNow()
      }
    } catch {
      // Still proceed with logout even if the last upsert fails.
    }
    try {
      sessionStorage.removeItem(HYDRATE_FLAG)
      sessionStorage.removeItem(IMPORT_NOTICE)
    } catch {
      // ignore
    }
  }, [flushNow])

  useEffect(() => {
    registerLearningSyncHandlers({
      prepareLogout,
      requestSync: () => {
        if (!userIdRef.current || !syncReadyRef.current) return
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          const userId = userIdRef.current
          if (!userId || !syncReadyRef.current) return
          upsertState(userId, readLocalSnapshot())
            .then(() => {
              setStatus('synced')
              setLastError(null)
            })
            .catch((err) => {
              console.error('Failed to save learning state', err)
              setLastError(err.message || 'Sync failed')
              setStatus('error')
            })
        }, 500)
      },
    })
    return () =>
      registerLearningSyncHandlers({
        prepareLogout: async () => {},
        requestSync: () => {},
      })
  }, [prepareLogout])

  useEffect(() => {
    userIdRef.current = user?.id ?? null

    if (!supabase || !user) {
      syncReadyRef.current = false
      setLearningHydrating(false)
      setStatus('idle')
      return undefined
    }

    let cancelled = false
    syncReadyRef.current = false
    setLearningHydrating(true)
    setStatus('syncing')
    setLastError(null)

    // Snapshot BEFORE awaiting the network. While we fetch, React children can
    // mount and backfill empty memory stubs into localStorage; merging those
    // stubs would wipe real cloud review history.
    const localAtStart = readLocalSnapshot()

    const scheduleUpsert = () => {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        const userId = userIdRef.current
        if (!userId || !syncReadyRef.current) return
        upsertState(userId, readLocalSnapshot())
          .then(() => {
            if (!cancelled) {
              setStatus('synced')
              setLastError(null)
            }
          })
          .catch((err) => {
            console.error('Failed to save learning state', err)
            if (!cancelled) {
              setLastError(err.message || 'Sync failed')
              setStatus('error')
            }
          })
      }, 500)
    }

    if (!originalSetItemRef.current) {
      originalSetItemRef.current = localStorage.setItem.bind(localStorage)
    }
    const originalSetItem = originalSetItemRef.current
    localStorage.setItem = (key, value) => {
      originalSetItem(key, value)
      if (bypassSyncRef.current || !syncReadyRef.current || !SYNC_KEY_SET.has(key)) return
      scheduleUpsert()
    }

    const onHide = () => {
      if (!syncReadyRef.current || !userIdRef.current) return
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      upsertState(userIdRef.current, readLocalSnapshot()).catch((err) => {
        console.error('Failed to save learning state on hide', err)
      })
    }
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') onHide()
    }
    window.addEventListener('pagehide', onHide)
    document.addEventListener('visibilitychange', onVisibility)

    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('user_learning_state')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
        if (error) throw error
        if (cancelled) return

        const local = localAtStart
        const cloud = snapshotFromRow(data)
        const localHas = hasMeaningfulProgress(local)
        const cloudHas = hasMeaningfulProgress(cloud)

        if (!cloudHas && localHas) {
          await upsertState(user.id, local, {
            imported_from_local_at: new Date().toISOString(),
          })
          sessionStorage.setItem(IMPORT_NOTICE, '1')
          sessionStorage.setItem(HYDRATE_FLAG, user.id)
          if (!cancelled) setStatus('imported')
          syncReadyRef.current = true
          setLearningHydrating(false)
          return
        }

        if (!cloudHas && !localHas) {
          if (!data) await upsertState(user.id, local)
          sessionStorage.setItem(HYDRATE_FLAG, user.id)
          if (!cancelled) setStatus('synced')
          syncReadyRef.current = true
          setLearningHydrating(false)
          return
        }

        // Cloud has data (local may too). Merge so neither side clobbers the other.
        const merged = mergeSnapshots(local, cloud)
        const cloudNeedsWrite = !snapshotsEqual(cloud, merged)
        const localNeedsWrite = !snapshotsEqual(local, merged)

        if (cloudNeedsWrite) {
          await upsertState(user.id, merged)
        }

        if (localNeedsWrite) {
          bypassSyncRef.current = true
          try {
            writeLocalSnapshot(merged)
          } finally {
            bypassSyncRef.current = false
          }
          sessionStorage.setItem(HYDRATE_FLAG, user.id)
          syncReadyRef.current = true
          setLearningHydrating(false)
          if (!cancelled) {
            reloadAfterHydrate()
          }
          return
        }

        sessionStorage.setItem(HYDRATE_FLAG, user.id)
        if (!cancelled) setStatus('synced')
        syncReadyRef.current = true
        setLearningHydrating(false)
      } catch (err) {
        console.error('Failed to sync learning state', err)
        if (!cancelled) {
          setLastError(err.message || 'Sync failed')
          setStatus('error')
        }
        syncReadyRef.current = true
        setLearningHydrating(false)
      }
    })()

    return () => {
      cancelled = true
      clearTimeout(timerRef.current)
      window.removeEventListener('pagehide', onHide)
      document.removeEventListener('visibilitychange', onVisibility)
      if (originalSetItemRef.current) {
        localStorage.setItem = originalSetItemRef.current
      }
      syncReadyRef.current = false
      setLearningHydrating(false)
    }
  }, [user])

  return (
    <LearningSyncContext.Provider value={{ status, lastError, flushNow }}>
      {children}
    </LearningSyncContext.Provider>
  )
}

export function useLearningSync() {
  return useContext(LearningSyncContext)
}

export function consumeImportNotice() {
  if (typeof sessionStorage === 'undefined') return false
  if (sessionStorage.getItem(IMPORT_NOTICE) !== '1') return false
  sessionStorage.removeItem(IMPORT_NOTICE)
  return true
}
