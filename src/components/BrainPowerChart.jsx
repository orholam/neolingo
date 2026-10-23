import { useState } from 'react'

function formatTick(ts, span) {
  const date = new Date(ts)
  if (span < 2 * 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function formatHover(ts) {
  return new Date(ts).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function axisRange(series) {
  let minScore = series[0].score
  let maxScore = series[0].score
  for (const point of series) {
    minScore = Math.min(minScore, point.score)
    maxScore = Math.max(maxScore, point.score)
  }
  const span = Math.max(1, maxScore - minScore)
  const low = minScore <= span * 0.5 ? 0 : Math.max(0, minScore - span * 0.25)
  const high = Math.max(low + 1, maxScore + span * 0.15)
  return { low, high, maxScore }
}

function eventToSvg(svg, event) {
  const point = svg.createSVGPoint()
  point.x = event.clientX
  point.y = event.clientY
  const matrix = svg.getScreenCTM()
  if (!matrix) return null
  return point.matrixTransform(matrix.inverse())
}

export default function BrainPowerChart({
  series,
  gradientId = 'brain-power-fill',
  className = 'mt-4',
}) {
  const [hover, setHover] = useState(null)

  if (!series || series.length < 2) return null
  const start = series[0].at
  const end = series[series.length - 1].at
  const span = end - start
  if (span < 60 * 1000) return null

  const { low, high, maxScore } = axisRange(series)
  const maxLabel = String(Math.round(maxScore))
  const padL = Math.max(28, 10 + maxLabel.length * 6)
  const padR = 8
  const padT = 16
  const padB = 18
  const plotW = 320
  const plotH = 96
  const svgW = padL + plotW + padR
  const svgH = padT + plotH + padB

  const toX = (at) => padL + ((at - start) / span) * plotW
  const toY = (score) => padT + plotH - ((score - low) / (high - low)) * plotH

  const coords = series.map((point) => ({
    x: toX(point.at),
    y: toY(point.score),
    at: point.at,
    score: point.score,
    recorded: Boolean(point.recorded),
  }))
  const linePoints = coords.map((c) => `${c.x},${c.y}`).join(' ')
  const baseline = padT + plotH
  const fillPoints = `${coords[0].x},${baseline} ${linePoints} ${coords[coords.length - 1].x},${baseline}`
  const last = coords[coords.length - 1]
  const lastScore = Math.round(series[series.length - 1].score)
  const mid = series[Math.floor(series.length / 2)]

  let peak = coords[0]
  for (const point of coords) {
    if (point.score > peak.score) peak = point
  }
  const showPeak = Math.round(peak.score) > lastScore
  const peakX = Math.min(padL + plotW - 12, Math.max(padL + 12, peak.x))
  const lastLabelX = Math.min(last.x, padL + plotW - 8)
  const labelsClose = showPeak && Math.abs(peakX - lastLabelX) < 28

  function updateHover(event) {
    const svg = event.currentTarget
    const cursor = eventToSvg(svg, event)
    if (!cursor || cursor.x < padL || cursor.x > padL + plotW) {
      setHover(null)
      return
    }
    let best = coords[0]
    let bestDx = Math.abs(best.x - cursor.x)
    let bestDy = Math.abs(best.y - cursor.y)
    for (const point of coords) {
      const dx = Math.abs(point.x - cursor.x)
      const dy = Math.abs(point.y - cursor.y)
      if (dx < bestDx - 0.5 || (Math.abs(dx - bestDx) <= 0.5 && dy < bestDy)) {
        best = point
        bestDx = dx
        bestDy = dy
      }
    }
    const jump = []
    for (const point of coords) {
      if (!point.recorded || Math.abs(point.x - best.x) > 1.5) continue
      const rounded = Math.round(point.score)
      if (!jump.includes(rounded)) jump.push(rounded)
    }
    const bounds = svg.parentElement.getBoundingClientRect()
    setHover({
      left: Math.min(bounds.width - 8, Math.max(8, event.clientX - bounds.left)),
      top: Math.max(8, event.clientY - bounds.top),
      score: Math.round(best.score),
      label: formatHover(best.at),
      change: jump.length > 1 ? `${jump[0]} → ${jump[jump.length - 1]}` : null,
      x: best.x,
      y: best.y,
    })
  }

  return (
    <div className={`relative ${className}`}>
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
        Over time
      </p>
      <svg
        width="100%"
        viewBox={`0 0 ${svgW} ${svgH}`}
        role="img"
        aria-label={`Brain power over time. Latest score ${lastScore}. Highest score ${maxLabel}.`}
        className="cursor-crosshair overflow-visible touch-pan-y"
        onPointerDown={updateHover}
        onPointerMove={updateHover}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width={svgW} height={svgH} fill="transparent" />
        <line
          x1={padL}
          y1={baseline}
          x2={padL + plotW}
          y2={baseline}
          stroke="#9ca3af"
          strokeWidth="0.5"
        />
        <text x={padL - 4} y={toY(maxScore) + 3} textAnchor="end" fontSize="8" fill="#9ca3af">
          {maxLabel}
        </text>
        <text x={padL - 4} y={baseline} textAnchor="end" dominantBaseline="middle" fontSize="8" fill="#9ca3af">
          {Math.round(low)}
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
        {coords.map((point, index) =>
          point.recorded ? (
            <circle
              key={`${point.at}-${index}`}
              cx={point.x}
              cy={point.y}
              r="2.2"
              className="fill-white stroke-indigo-500 dark:fill-gray-900"
              strokeWidth="1.5"
            />
          ) : null
        )}
        {showPeak && <circle cx={peak.x} cy={peak.y} r="3.5" fill="#6366f1" />}
        <circle cx={last.x} cy={last.y} r="3" fill="#6366f1" />
        {showPeak && (
          <text
            x={peakX}
            y={Math.max(peak.y - (labelsClose ? 14 : 7), 10)}
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill="#6366f1"
          >
            {Math.round(peak.score)}
          </text>
        )}
        <text
          x={lastLabelX}
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
        {hover && (
          <line
            x1={hover.x}
            y1={padT}
            x2={hover.x}
            y2={baseline}
            stroke="#6366f1"
            strokeWidth="1"
            strokeDasharray="2 2"
            pointerEvents="none"
          />
        )}
      </svg>
      {hover && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-md bg-gray-900 px-2 py-1 text-white shadow-md dark:bg-gray-100 dark:text-gray-900"
          style={{ left: hover.left, top: Math.max(0, hover.top - 12) }}
        >
          <div className="text-sm font-bold tabular-nums leading-none">{hover.score}</div>
          {hover.change && (
            <div className="mt-0.5 whitespace-nowrap text-[10px] font-semibold tabular-nums">{hover.change}</div>
          )}
          <div className="mt-0.5 whitespace-nowrap text-[10px] opacity-80">{hover.label}</div>
        </div>
      )}
    </div>
  )
}
