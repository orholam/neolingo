import { useState } from 'react'

const RISE_PX = 18

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
  const high = Math.max(low + 1, maxScore + span * 0.2)
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

function spreadRises(coords) {
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1]
    const point = coords[i]
    if (point.score <= prev.score + 0.5) continue
    if (point.x - prev.x >= RISE_PX) continue
    const floor = i >= 2 ? coords[i - 2].x + 8 : point.x - RISE_PX
    prev.x = Math.min(point.x - 3, Math.max(floor, point.x - RISE_PX))
  }
}

function alongLine(drawn, x) {
  if (x <= drawn[0].x) return { ...drawn[0], change: null }
  for (let i = 1; i < drawn.length; i++) {
    const right = drawn[i]
    const left = drawn[i - 1]
    if (x > right.x && i < drawn.length - 1) continue
    const width = right.x - left.x
    const t = width <= 0 ? 1 : Math.min(1, Math.max(0, (x - left.x) / width))
    const score = left.score + (right.score - left.score) * t
    const at = left.at + (right.at - left.at) * t
    const y = left.y + (right.y - left.y) * t
    const rising = right.score > left.score + 0.5 && width <= RISE_PX + 4
    return {
      x: left.x + width * t,
      y,
      at,
      score,
      change: rising ? `${Math.round(left.score)} → ${Math.round(right.score)}` : null,
    }
  }
  const last = drawn[drawn.length - 1]
  return { ...last, change: null }
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
  const padR = 12
  const padT = 18
  const padB = 18
  const plotW = 320
  const plotH = 88
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
  const recorded = coords.filter((point) => point.recorded)
  const drawn = recorded.length >= 2 ? recorded.map((point) => ({ ...point })) : coords.map((point) => ({ ...point }))
  spreadRises(drawn)

  const linePoints = drawn.map((point) => `${point.x},${point.y}`).join(' ')
  const baseline = padT + plotH
  const fillPoints = `${drawn[0].x},${baseline} ${linePoints} ${drawn[drawn.length - 1].x},${baseline}`
  const last = drawn[drawn.length - 1]
  const lastScore = Math.round(last.score)
  const mid = series[Math.floor(series.length / 2)]

  let peak = drawn[0]
  for (const point of drawn) {
    if (point.score > peak.score) peak = point
  }
  const showPeak = Math.round(peak.score) > lastScore
  const peakX = Math.min(padL + plotW - 14, Math.max(padL + 14, peak.x))
  const lastOnEdge = last.x > padL + plotW - 22

  function updateHover(event) {
    const svg = event.currentTarget
    const cursor = eventToSvg(svg, event)
    if (!cursor || cursor.x < padL || cursor.x > padL + plotW) {
      setHover(null)
      return
    }
    const point = alongLine(drawn, cursor.x)
    const bounds = svg.parentElement.getBoundingClientRect()
    setHover({
      left: Math.min(bounds.width - 8, Math.max(8, event.clientX - bounds.left)),
      top: Math.max(8, event.clientY - bounds.top),
      score: Math.round(point.score),
      label: formatHover(point.at),
      change: point.change,
      x: point.x,
      y: point.y,
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
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width={svgW} height={svgH} fill="transparent" />
        <line
          x1={padL}
          y1={baseline}
          x2={padL + plotW}
          y2={baseline}
          stroke="currentColor"
          className="text-gray-200 dark:text-gray-800"
          strokeWidth="1"
        />
        <text
          x={padL - 6}
          y={baseline}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize="9"
          className="fill-gray-400 dark:fill-gray-500"
        >
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
        {showPeak && (
          <text
            x={peakX}
            y={Math.max(peak.y - 8, 11)}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="#6366f1"
          >
            {Math.round(peak.score)}
          </text>
        )}
        <circle cx={last.x} cy={last.y} r="3.5" fill="#6366f1" />
        <text
          x={lastOnEdge ? last.x - 8 : last.x}
          y={Math.max(last.y - 8, 11)}
          textAnchor={lastOnEdge ? 'end' : 'middle'}
          fontSize="11"
          fontWeight="700"
          fill="#6366f1"
        >
          {lastScore}
        </text>
        <text x={padL} y={svgH - 2} fontSize="9" className="fill-gray-400 dark:fill-gray-500">
          {formatTick(start, span)}
        </text>
        <text
          x={padL + plotW / 2}
          y={svgH - 2}
          textAnchor="middle"
          fontSize="9"
          className="fill-gray-400 dark:fill-gray-500"
        >
          {formatTick(mid.at, span)}
        </text>
        <text
          x={padL + plotW}
          y={svgH - 2}
          textAnchor="end"
          fontSize="9"
          className="fill-gray-400 dark:fill-gray-500"
        >
          {formatTick(end, span)}
        </text>
        {hover && (
          <g pointerEvents="none">
            <line
              x1={hover.x}
              y1={padT}
              x2={hover.x}
              y2={baseline}
              stroke="#6366f1"
              strokeWidth="1"
              strokeDasharray="2 3"
              opacity="0.45"
            />
            <circle cx={hover.x} cy={hover.y} r="3.5" fill="#ffffff" stroke="#6366f1" strokeWidth="2" />
          </g>
        )}
      </svg>
      {hover && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg bg-gray-900 px-2.5 py-1.5 text-white shadow-lg dark:bg-white dark:text-gray-900"
          style={{ left: hover.left, top: Math.max(0, hover.top - 10) }}
        >
          <div className="text-sm font-bold tabular-nums leading-none">{hover.change || hover.score}</div>
          <div className="mt-1 whitespace-nowrap text-[10px] text-white/70 dark:text-gray-500">{hover.label}</div>
        </div>
      )}
    </div>
  )
}
