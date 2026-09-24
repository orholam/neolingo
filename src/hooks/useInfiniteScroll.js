import { useEffect, useMemo, useRef, useState } from 'react'

const DEFAULT_PAGE_SIZE = 60

/**
 * Slice a list for light infinite scroll inside a scroll container.
 * Resets when `items` identity/length changes (e.g. new search results).
 */
export function useInfiniteScroll(items, { pageSize = DEFAULT_PAGE_SIZE, scrollRootRef } = {}) {
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const sentinelRef = useRef(null)
  const itemsLength = items.length

  useEffect(() => {
    setVisibleCount(pageSize)
  }, [items, pageSize])

  useEffect(() => {
    const root = scrollRootRef?.current ?? null
    const sentinel = sentinelRef.current
    if (!sentinel || itemsLength === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((count) => Math.min(count + pageSize, itemsLength))
        }
      },
      { root, rootMargin: '240px 0px', threshold: 0 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [itemsLength, pageSize, scrollRootRef])

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  )

  return {
    visibleItems,
    sentinelRef,
    hasMore: visibleCount < itemsLength,
    visibleCount,
    totalCount: itemsLength,
  }
}
