export default function SessionBucketChart({ history, compact = false }) {
  if (!history || history.length === 0) return null

  const padL = compact ? 2 : 4
  const padR = compact ? 2 : 4
  const padT = compact ? 2 : 4
  const padB = compact ? 2 : 4
  const plotW = compact ? 140 : 340
  const plotH = compact ? 40 : 80
  const svgW = padL + plotW + padR
  const svgH = padT + plotH + padB
  const denom = Math.max(history.length - 1, 1)

  const bars = history.map((h, i) => {
    const total = h.struggling + h.inProgress + h.mastered
    if (total === 0) return { x: padL + (i / denom) * plotW, s: 0, p: 0, m: 0 }
    return {
      x: padL + (i / denom) * plotW,
      s: (h.struggling / total) * plotH,
      p: (h.inProgress / total) * plotH,
      m: (h.mastered / total) * plotH,
    }
  })

  const buildAreaPath = (getY0, getY1) => {
    const top = bars.map((b, i) => `${i === 0 ? 'M' : 'L'}${b.x},${padT + getY0(b)}`)
    const bot = bars.slice().reverse().map((b) => `L${b.x},${padT + getY1(b)}`)
    return top.join(' ') + ' ' + bot.join(' ') + ' Z'
  }

  const masteredPath = buildAreaPath(() => 0, (b) => b.m)
  const inProgressPath = buildAreaPath((b) => b.m, (b) => b.m + b.p)
  const strugglingPath = buildAreaPath((b) => b.m + b.p, () => plotH)

  const lastH = history[history.length - 1]
  const lastTotal = lastH.struggling + lastH.inProgress + lastH.mastered
  const sPct = lastTotal > 0 ? Math.round((lastH.struggling / lastTotal) * 100) : 0
  const pPct = lastTotal > 0 ? Math.round((lastH.inProgress / lastTotal) * 100) : 0
  const mPct = lastTotal > 0 ? Math.round((lastH.mastered / lastTotal) * 100) : 0

  return (
    <>
      <svg
        width="100%"
        viewBox={`0 0 ${svgW} ${svgH}`}
        className={compact ? undefined : 'mt-4'}
        preserveAspectRatio="xMidYMid meet"
      >
        <path d={masteredPath} fill="#22c55e" opacity={compact ? 0.8 : 0.7} />
        <path d={inProgressPath} fill="#f59e0b" opacity={compact ? 0.7 : 0.6} />
        <path d={strugglingPath} fill="#ef4444" opacity={compact ? 0.6 : 0.6} />
      </svg>
      {!compact && (
        <div className="flex items-center gap-4 mt-2.5 text-[11px] font-medium flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-500 dark:text-gray-400">Struggling {sPct}%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-gray-500 dark:text-gray-400">In progress {pPct}%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-500 dark:text-gray-400">Mastered {mPct}%</span>
          </span>
        </div>
      )}
    </>
  )
}
