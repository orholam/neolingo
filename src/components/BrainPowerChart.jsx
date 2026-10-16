function formatTick(ts, span) {
  const date = new Date(ts)
  if (span < 2 * 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function BrainPowerChart({
  series,
  gradientId = 'brain-power-fill',
  className = 'mt-4',
}) {
  if (!series || series.length < 2) return null
  const start = series[0].at
  const end = series[series.length - 1].at
  const span = end - start
  if (span < 60 * 1000) return null

  const padL = 28
  const padR = 8
  const padT = 16
  const padB = 18
  const plotW = 320
  const plotH = 96
  const svgW = padL + plotW + padR
  const svgH = padT + plotH + padB

  let maxScore = 0
  for (const point of series) maxScore = Math.max(maxScore, point.score)
  if (maxScore <= 0) return null
  const top = Math.max(1, maxScore)

  const toX = (at) => padL + ((at - start) / span) * plotW
  const toY = (score) => padT + plotH - (score / top) * plotH

  const coords = series.map((point) => ({ x: toX(point.at), y: toY(point.score) }))
  const linePoints = coords.map((c) => `${c.x},${c.y}`).join(' ')
  const baseline = padT + plotH
  const fillPoints = `${coords[0].x},${baseline} ${linePoints} ${coords[coords.length - 1].x},${baseline}`
  const last = coords[coords.length - 1]
  const lastScore = Math.round(series[series.length - 1].score)
  const mid = series[Math.floor(series.length / 2)]

  return (
    <div className={className}>
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
        Over time
      </p>
      <svg
        width="100%"
        viewBox={`0 0 ${svgW} ${svgH}`}
        role="img"
        aria-label="Brain power over time"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line
          x1={padL}
          y1={baseline}
          x2={padL + plotW}
          y2={baseline}
          stroke="#9ca3af"
          strokeWidth="0.5"
        />
        <text x={padL - 4} y={padT + 2} textAnchor="end" fontSize="8" fill="#9ca3af">
          {Math.round(top)}
        </text>
        <text x={padL - 4} y={baseline} textAnchor="end" dominantBaseline="middle" fontSize="8" fill="#9ca3af">
          0
        </text>
        <polygon points={fillPoints} fill={`url(#${gradientId})`} />
        <polyline
          points={linePoints}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx={last.x} cy={last.y} r="3" fill="#6366f1" />
        <text
          x={Math.min(last.x, padL + plotW - 8)}
          y={Math.max(last.y - 6, 10)}
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          fill="#6366f1"
        >
          {lastScore}
        </text>
        <text x={padL} y={svgH - 2} fontSize="8" fill="#9ca3af">
          {formatTick(start, span)}
        </text>
        <text x={padL + plotW / 2} y={svgH - 2} textAnchor="middle" fontSize="8" fill="#9ca3af">
          {formatTick(mid.at, span)}
        </text>
        <text x={padL + plotW} y={svgH - 2} textAnchor="end" fontSize="8" fill="#9ca3af">
          {formatTick(end, span)}
        </text>
      </svg>
    </div>
  )
}
