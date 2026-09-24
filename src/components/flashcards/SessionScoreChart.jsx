export default function SessionScoreChart({ history }) {
  if (!history || history.length === 0) return null

  const padL = 32
  const padR = 8
  const padT = 8
  const padB = 4
  const plotW = 320
  const plotH = 120
  const svgW = padL + plotW + padR
  const svgH = padT + plotH + padB

  const scores = history.map((h) => h.score)
  const minVal = scores.reduce((min, v) => Math.min(min, v, 0), 0)
  const maxVal = scores.reduce((max, v) => Math.max(max, v, 0), 0)
  const range = maxVal - minVal || 1
  const denom = Math.max(scores.length - 1, 1)

  const toX = (i) => padL + (i / denom) * plotW
  const toY = (v) => padT + plotH - ((v - minVal) / range) * plotH

  const coords = scores.map((v, i) => ({ x: toX(i), y: toY(v) }))
  if (coords.length === 1) coords.push({ ...coords[0] })

  const linePoints = coords.map((c) => `${c.x},${c.y}`).join(' ')
  const lastValue = scores[scores.length - 1]
  const lineColor = lastValue >= 0 ? '#22c55e' : '#ef4444'

  let zeroY = toY(0)
  if (!Number.isFinite(zeroY)) zeroY = padT + plotH / 2
  zeroY = Math.max(padT, Math.min(padT + plotH, zeroY))

  const fillPoints =
    `${padL},${zeroY} ` + linePoints + ` ${coords[coords.length - 1].x},${zeroY}`

  const last = coords[coords.length - 1]

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${svgW} ${svgH}`}
      className="mt-4"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="scoreFillGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
          <stop offset="50%" stopColor="#22c55e" stopOpacity="0.05" />
          <stop offset="50%" stopColor="#ef4444" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      <polygon points={fillPoints} fill="url(#scoreFillGrad)" />

      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#d1d5db" strokeWidth="0.5" />
      <line
        x1={padL}
        y1={zeroY}
        x2={padL + plotW}
        y2={zeroY}
        stroke="#9ca3af"
        strokeWidth="0.5"
        strokeDasharray="4 2"
      />
      <text x={padL - 3} y={zeroY} textAnchor="end" dominantBaseline="middle" fontSize="7" fill="#9ca3af">
        0
      </text>

      {maxVal !== 0 && (
        <text x={padL - 3} y={padT + 3} textAnchor="end" dominantBaseline="hanging" fontSize="7" fill="#9ca3af">
          {maxVal}
        </text>
      )}
      {minVal !== 0 && (
        <text x={padL - 3} y={padT + plotH - 1} textAnchor="end" dominantBaseline="auto" fontSize="7" fill="#9ca3af">
          {minVal}
        </text>
      )}

      <polyline
        points={linePoints}
        fill="none"
        stroke={lineColor}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      <circle cx={last.x} cy={last.y} r="2.5" fill={lineColor} />
      <text
        x={last.x}
        y={last.y - 5}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize="7"
        fontWeight="bold"
        fill={lineColor}
      >
        {lastValue}
      </text>
    </svg>
  )
}
