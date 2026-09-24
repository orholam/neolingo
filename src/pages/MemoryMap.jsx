import { useRef, useState, Suspense, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line, Grid } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import BrainViewToggle from '../components/BrainViewToggle'
import BrainCanvasFrame from '../components/BrainCanvasFrame'
import { COURSES, getLanguageId } from '../data/courses'
import { useWordMastery } from '../hooks/useWordMastery'
import { useWordMemory } from '../hooks/useWordMemory'
import { formatTimeSince } from '../utils/wordMemory'
import { buildMemoryLayout, applyMemoryHeights, MIN_WORDS } from '../utils/memoryMapGraph'
import {
  BrainCamera,
  BRAIN_CANVAS_GL,
  BRAIN_DPR,
  computeCameraDistance,
  computeGraphRadius,
} from '../utils/brainScene'

const LAYOUT_CACHE_PREFIX = 'neolingo-memory-map-layout'

// ─── Three.js components ──────────────────────────────────────────────────────

/** A word node that eases toward its target height, like settling under gravity / rising up. */
function MemoryWordNode({ node, index, isDark, onHover }) {
  const groupRef = useRef()
  const meshRef = useRef()
  const haloRef = useRef()
  const stemRef = useRef()
  const currentY = useRef(0)
  const phase = (index * 1.618) % (Math.PI * 2)
  const scale = 0.85 + 0.25 * (((index * 2654435761) >>> 0) / 4294967295)
  const coreR = 0.075 * scale
  const baseEmissive = isDark ? 1.6 : 0.0
  const haloBaseOpacity = isDark ? 0.22 : 0.38

  useFrame(({ clock }, delta) => {
    const targetY = node.position[1]
    currentY.current += (targetY - currentY.current) * Math.min(1, delta * 2.4)
    if (groupRef.current) {
      groupRef.current.position.set(node.position[0], currentY.current, node.position[2])
    }
    if (stemRef.current) {
      const len = Math.max(0.001, Math.abs(currentY.current))
      stemRef.current.scale.set(1, len, 1)
      stemRef.current.position.set(0, -currentY.current / 2, 0)
    }

    const t = clock.elapsedTime
    const pulse = 0.85 + 0.15 * Math.sin(t * 1.3 + phase)
    if (meshRef.current) meshRef.current.material.emissiveIntensity = baseEmissive * pulse
    if (haloRef.current) {
      haloRef.current.material.opacity = haloBaseOpacity * pulse
      haloRef.current.scale.setScalar(1 + 0.15 * Math.sin(t * 1.3 + phase + 0.4))
    }
  })

  return (
    <group
      ref={groupRef}
      position={[node.position[0], 0, node.position[2]]}
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover(node)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        onHover(null)
      }}
    >
      <mesh ref={stemRef}>
        <cylinderGeometry args={[0.008, 0.008, 1, 6]} />
        <meshBasicMaterial color={node.color} transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[coreR, 16, 16]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={baseEmissive}
          roughness={isDark ? 0.1 : 0.25}
          metalness={isDark ? 0.4 : 0.15}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={haloRef}>
        <sphereGeometry args={[coreR * 2.6, 12, 12]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={isDark ? 0.5 : 0.0}
          transparent
          opacity={haloBaseOpacity}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function Edges({ nodes, edges, isDark }) {
  return edges.map(({ i, j, intraCluster }, idx) => (
    <Line
      key={idx}
      points={[nodes[i].position, nodes[j].position]}
      color={isDark ? '#475569' : '#94a3b8'}
      lineWidth={intraCluster ? 1.6 : 0.8}
      transparent
      opacity={intraCluster ? (isDark ? 0.28 : 0.3) : (isDark ? 0.08 : 0.1)}
    />
  ))
}

function MemoryScene({ nodes, edges, isDark, onHover }) {
  const groupRef = useRef()
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1
    }
  })
  return (
    <group ref={groupRef}>
      <Edges nodes={nodes} edges={edges} isDark={isDark} />
      {nodes.map((node, i) => (
        <MemoryWordNode key={node.id} index={i} node={node} isDark={isDark} onHover={onHover} />
      ))}
    </group>
  )
}

function Scene({ nodes, edges, isDark, onHover, radius, mode }) {
  const orbitMin = Math.max(2, radius * 0.45)
  const orbitMax = Math.max(30, radius * 4.5)
  const gridColor = isDark ? '#334155' : '#cbd5e1'
  const gridSectionColor = isDark ? '#475569' : '#94a3b8'

  return (
    <>
      <BrainCamera radius={radius} />
      <ambientLight intensity={isDark ? 0.25 : 0.9} />
      <pointLight position={[6, 6, 6]} intensity={isDark ? 1.2 : 1.3} />
      <pointLight position={[-5, -3, 3]} intensity={0.5} color="#a78bfa" />
      <Grid
        position={[0, 0, 0]}
        args={[radius * 3.5, radius * 3.5]}
        cellSize={0.6}
        cellThickness={0.5}
        sectionSize={2.4}
        sectionThickness={1}
        fadeDistance={radius * 6}
        fadeStrength={1.2}
        infiniteGrid
        cellColor={gridColor}
        sectionColor={gridSectionColor}
      />
      <MemoryScene nodes={nodes} edges={edges} isDark={isDark} onHover={onHover} mode={mode} />
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        enableDamping
        dampingFactor={0.08}
        minDistance={orbitMin}
        maxDistance={orbitMax}
        target={[0, 0, 0]}
      />
      {isDark && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.25} luminanceSmoothing={0.9} intensity={1.2} mipmapBlur />
        </EffectComposer>
      )}
    </>
  )
}

// ─── Overlays ─────────────────────────────────────────────────────────────────

function Tooltip({ hovered }) {
  if (!hovered) return null
  const days = hovered.lastReviewedAt ? formatTimeSince(hovered.lastReviewedAt) : 'never'
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-20">
      <div className="bg-gray-900/90 dark:bg-gray-800/95 text-white backdrop-blur rounded-xl px-4 py-2.5 shadow-2xl border border-white/10">
        <div>
          <span className="font-bold text-sm">{hovered.label}</span>
          {hovered.translation && <span className="text-gray-400 text-sm ml-2">→ {hovered.translation}</span>}
        </div>
        <p className="text-[11px] text-gray-400 mt-0.5">
          LTM {hovered.longTermMemory.toFixed(1).replace(/\.0$/, '')}/10 · STM{' '}
          {hovered.shortTermMemory.toFixed(1).replace(/\.0$/, '')}/10 · reviewed {days}
        </p>
      </div>
    </div>
  )
}

function MemoryLegend({ mode }) {
  const lowLabel = mode === 'long' ? 'New' : 'Forgotten'
  const highLabel = mode === 'long' ? 'Permanent' : 'Fresh'
  return (
    <div className="absolute bottom-6 right-6 pointer-events-none select-none max-w-[180px]">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-xl px-3 py-2.5 border border-gray-200/60 dark:border-gray-700/60 shadow-lg">
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
          {mode === 'long' ? 'Long-term memory' : 'Short-term memory'}
        </p>
        <div className="h-2 rounded-full mb-1" style={{ background: 'linear-gradient(90deg, #ef4444, #f59e0b, #22c55e)' }} />
        <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      </div>
    </div>
  )
}

function MemoryModeToggle({ mode, onChange }) {
  return (
    <div className="inline-flex items-center rounded-2xl bg-white/95 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 p-1 shadow-lg gap-0.5">
      <button
        type="button"
        onClick={() => onChange('short')}
        className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 select-none ${
          mode === 'short'
            ? 'bg-purple-600 text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer'
        }`}
      >
        Short-term
      </button>
      <button
        type="button"
        onClick={() => onChange('long')}
        className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 select-none ${
          mode === 'long'
            ? 'bg-purple-600 text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer'
        }`}
      >
        Long-term
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MemoryMap() {
  const { langId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const mode = searchParams.get('view') === 'long' ? 'long' : 'short'

  const [isDark, setIsDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  )
  const [layout, setLayout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    if (typeof document === 'undefined') return
    const obs = new MutationObserver(() => setIsDark(document.documentElement.classList.contains('dark')))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  const course = COURSES[langId] || null
  const dictionary = course?.dictionary || []
  const languageId = course ? getLanguageId(course.id) : 'Dadjo'
  const { getUniversalMasteredWords } = useWordMastery(languageId, dictionary)
  const masteredItems = getUniversalMasteredWords()
  const masteredIdsJoined = masteredItems.map((m) => m.id).sort().join('|')
  const masteredSignature = useMemo(() => masteredIdsJoined, [masteredIdsJoined])
  const memory = useWordMemory(languageId, masteredItems.map((m) => m.id))

  useEffect(() => {
    setLayout(null)
    setHovered(null)
    setError(null)

    if (!course || !masteredItems.length) {
      setLoading(false)
      return
    }

    setLoading(true)
    const cacheKey = `${LAYOUT_CACHE_PREFIX}:${langId}:${masteredSignature}`

    try {
      const cached = typeof localStorage !== 'undefined' && localStorage.getItem(cacheKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed?.nodes?.length >= MIN_WORDS) {
          setLayout(parsed)
          setLoading(false)
          return
        }
      }
    } catch {
      /* ignore stale or invalid cache */
    }

    let cancelled = false
    course
      .embeddingsPath()
      .then((mod) => {
        if (cancelled) return
        const embeddingsMap = mod.default
        const result = buildMemoryLayout(masteredItems, embeddingsMap)
        if (result.error) {
          const { matched, total } = result
          throw new Error(
            `Need at least ${MIN_WORDS} words with embeddings. ${matched} of your ${total} mastered word${total !== 1 ? 's' : ''} matched.`
          )
        }
        try {
          if (typeof localStorage !== 'undefined') localStorage.setItem(cacheKey, JSON.stringify(result))
        } catch {
          /* quota or disabled */
        }
        setLayout(result)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        console.error(err)
        setError(err.message || 'Failed to load embeddings.')
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [langId, masteredSignature])

  // Snapshot timestamp used to derive short-term memory. `memory` is now
  // referentially stable across unrelated re-renders (see useWordMemory),
  // so this only recomputes when layout/mode genuinely change - not on
  // every render (e.g. hovering a node) - per the snapshot design.
  const now = Date.now()
  const graphData = useMemo(() => {
    if (!layout) return null
    const memoryByWordId = memory.getAllMemory(now)
    return applyMemoryHeights(layout, memoryByWordId, mode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, memory, mode])

  const bgColor = isDark ? '#0f172a' : '#e2e8f0'
  const graphRadius = useMemo(() => (graphData?.nodes ? computeGraphRadius(graphData.nodes) : 4), [graphData])

  if (!course) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Language not found.</p>
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold"
        >
          Go to dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800" style={{ background: bgColor }}>
      <BrainCanvasFrame embedded>
        {!loading && masteredItems.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-md px-6">
              <div className="text-6xl mb-4 opacity-50">🌱</div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">No mastered words yet</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Master some words via flashcards, then come back to watch their memory strength take shape.
              </p>
              <button
                type="button"
                onClick={() => navigate('/flashcards')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
              >
                Go to flashcards
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-4 animate-pulse">🌱</div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Computing memory map…</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-sm px-6">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-sm text-red-500 font-semibold mb-1">Something went wrong</p>
              <p className="text-xs text-gray-400">{error}</p>
            </div>
          </div>
        )}

        {graphData && !loading && (
          <Canvas
            dpr={BRAIN_DPR}
            gl={BRAIN_CANVAS_GL}
            camera={{
              position: [0, 0, computeCameraDistance(graphRadius)],
              fov: 45,
              near: 0.1,
              far: 200,
            }}
          >
            <color attach="background" args={[bgColor]} />
            <Suspense fallback={null}>
              <Scene
                nodes={graphData.nodes}
                edges={graphData.edges}
                isDark={isDark}
                onHover={setHovered}
                radius={graphRadius}
                mode={mode}
              />
            </Suspense>
          </Canvas>
        )}

        <Tooltip hovered={hovered} />
        {graphData && <MemoryLegend mode={mode} />}

        <div className="absolute bottom-6 left-6 pointer-events-none select-none z-10">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">{course.emoji}</span>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {course.label} — {mode === 'long' ? 'Long-Term' : 'Short-Term'} Memory
            </span>
          </div>
          {graphData && (
            <p className="text-sm text-gray-500 dark:text-gray-400 pl-9">
              {graphData.nodes.length} word{graphData.nodes.length !== 1 ? 's' : ''}
              {' · drag to rotate · scroll to zoom'}
            </p>
          )}
        </div>

        <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
          <BrainViewToggle current="memory" langId={langId} />
          <MemoryModeToggle mode={mode} onChange={(m) => setSearchParams({ view: m })} />
        </div>
      </BrainCanvasFrame>
    </div>
  )
}
