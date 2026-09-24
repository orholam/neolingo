import { useRef, useState, Suspense, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { buildGraph, MIN_WORDS } from '../utils/semanticMapGraph'
import { COURSES, getLanguageId } from '../data/courses'
import { useWordMastery } from '../hooks/useWordMastery'
import { BrainCamera, BRAIN_CANVAS_GL, BRAIN_DPR, computeGraphRadius } from '../utils/brainScene'

const CACHE_KEY_PREFIX = 'neolingo-semantic-map'

// Module-level in-memory cache — survives component remounts within the same browser session.
const graphMemoryCache = new Map()

// Minimal 3D scene for the widget
function MiniWordNode({ position, color, index, isDark }) {
  const meshRef = useRef()
  const haloRef = useRef()
  const phase = (index * 1.618) % (Math.PI * 2)
  const scale = 0.85 + 0.2 * (((index * 2654435761) >>> 0) / 4294967295)
  const coreR = 0.06 * scale
  const baseEmissive = isDark ? 1.4 : 0.0
  const haloBaseOpacity = isDark ? 0.2 : 0.35

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const pulse = 0.88 + 0.12 * Math.sin(t * 1.2 + phase)
    if (meshRef.current)
      meshRef.current.material.emissiveIntensity = baseEmissive * pulse
    if (haloRef.current) {
      haloRef.current.material.opacity = haloBaseOpacity * pulse
      haloRef.current.scale.setScalar(1 + 0.12 * Math.sin(t * 1.2 + phase + 0.4))
    }
  })

  const vec = new THREE.Vector3(...position)
  return (
    <group position={vec}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[coreR, 12, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={baseEmissive}
          roughness={isDark ? 0.1 : 0.25}
          metalness={isDark ? 0.4 : 0.15}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={haloRef}>
        <sphereGeometry args={[coreR * 2.4, 10, 10]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
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

function MiniEdges({ nodes, edges, isDark }) {
  return edges.map(({ i, j, intraCluster }, idx) => (
    <Line
      key={idx}
      points={[nodes[i].position, nodes[j].position]}
      color={
        isDark
          ? intraCluster
            ? nodes[i].color
            : '#334155'
          : intraCluster
            ? nodes[i].color
            : '#94a3b8'
      }
      lineWidth={intraCluster ? 2 : 1}
      transparent
      opacity={
        intraCluster ? (isDark ? 0.5 : 0.55) : isDark ? 0.06 : 0.1
      }
    />
  ))
}

function MiniBrainScene({ nodes, edges, isDark }) {
  const groupRef = useRef()
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15
      groupRef.current.rotation.x += delta * 0.04
    }
  })
  return (
    <group ref={groupRef}>
      <MiniEdges nodes={nodes} edges={edges} isDark={isDark} />
      {nodes.map((node, i) => (
        <MiniWordNode
          key={i}
          index={i}
          position={node.position}
          color={node.color}
          isDark={isDark}
        />
      ))}
    </group>
  )
}

function MiniScene({ nodes, edges, isDark }) {
  const radius = computeGraphRadius(nodes)

  return (
    <>
      <BrainCamera radius={radius} />
      <ambientLight intensity={isDark ? 0.22 : 0.9} />
      <pointLight position={[6, 6, 6]} intensity={isDark ? 1.1 : 1.2} />
      <pointLight position={[-5, -3, 3]} intensity={0.45} color="#a78bfa" />
      <MiniBrainScene nodes={nodes} edges={edges} isDark={isDark} />
    </>
  )
}

export default function MiniSemanticMap({ courseId }) {
  const navigate = useNavigate()

  // Compute course + mastery BEFORE useState so the lazy initializers can
  // check the module-level memory cache synchronously on every mount.
  const course = COURSES[courseId] || COURSES.dadjo
  const dictionary = course?.dictionary || []
  const languageId = getLanguageId(course.id)
  const { getUniversalMasteredWords } = useWordMastery(languageId, dictionary)
  const masteredItems = getUniversalMasteredWords()
  const masteredSignature = useMemo(
    () => masteredItems.map((m) => m.id).sort().join('|'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [masteredItems.length, masteredItems.map((m) => m.id).sort().join(',')]
  )
  const memKey = `${courseId}:${masteredSignature}`

  const [isDark, setIsDark] = useState(
    () =>
      typeof document !== 'undefined' &&
      document.documentElement.classList.contains('dark')
  )

  // Initialize graphData from memory cache — no flash on remount if already loaded
  const [graphData, setGraphData] = useState(() => graphMemoryCache.get(memKey) ?? null)

  // Only start in loading state when we actually need an async fetch
  const [loading, setLoading] = useState(() => {
    if (!masteredItems.length) return false
    if (graphMemoryCache.has(memKey)) return false
    // Check localStorage synchronously for an even faster cold-start
    try {
      const lsKey = `${CACHE_KEY_PREFIX}:${courseId}:${masteredSignature}`
      const cached = typeof localStorage !== 'undefined' && localStorage.getItem(lsKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed?.nodes?.length >= MIN_WORDS) return false
      }
    } catch (_) { /* ignore */ }
    return true
  })

  const [error, setError] = useState(null)

  useEffect(() => {
    if (typeof document === 'undefined') return
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains('dark'))
    )
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!course || !masteredItems.length) {
      setLoading(false)
      return
    }

    // Memory cache hit — instant, no loading state needed
    if (graphMemoryCache.has(memKey)) {
      setGraphData(graphMemoryCache.get(memKey))
      setLoading(false)
      return
    }

    const lsKey = `${CACHE_KEY_PREFIX}:${courseId}:${masteredSignature}`

    // localStorage cache hit
    try {
      const cached = typeof localStorage !== 'undefined' && localStorage.getItem(lsKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed?.nodes?.length >= MIN_WORDS) {
          graphMemoryCache.set(memKey, parsed)
          setGraphData(parsed)
          setLoading(false)
          setError(null)
          return
        }
      }
    } catch (_) {
      /* ignore stale or invalid cache */
    }

    // Full async fetch
    setLoading(true)
    setError(null)
    course
      .embeddingsPath()
      .then((mod) => {
        const result = buildGraph(masteredItems, mod.default)
        if (result.error) {
          setGraphData(null)
          setError(null)
        } else {
          graphMemoryCache.set(memKey, result)
          try {
            if (typeof localStorage !== 'undefined')
              localStorage.setItem(lsKey, JSON.stringify(result))
          } catch (_) {
            /* quota or disabled */
          }
          setGraphData(result)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError(err.message || 'Failed to load map.')
        setLoading(false)
      })
  }, [courseId, masteredSignature])

  const bgColor = isDark ? '#0f172a' : '#e2e8f0'

  const handleClick = () => navigate(`/brain-map/${courseId}`)

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pb-3">
      <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">
          Semantic Map
        </h3>
        <button
          type="button"
          onClick={handleClick}
          className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline"
        >
          View full
        </button>
      </div>

      <button
        type="button"
        onClick={handleClick}
        className="w-full block rounded-none overflow-hidden bg-gray-100 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-inset"
        style={{ height: 200 }}
      >
        {loading && (
          <div
            className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500"
            style={{ background: bgColor }}
          >
            <span className="text-sm">Loading…</span>
          </div>
        )}

        {!loading && !graphData && masteredItems.length === 0 && (
          <div
            className="w-full h-full flex flex-col items-center justify-center text-center px-3"
            style={{ background: bgColor }}
          >
            <span className="text-2xl opacity-60 mb-1">🌐</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Master words to see your map
            </span>
          </div>
        )}

        {!loading && !graphData && masteredItems.length > 0 && !error && (
          <div
            className="w-full h-full flex flex-col items-center justify-center text-center px-3"
            style={{ background: bgColor }}
          >
            <span className="text-2xl opacity-60 mb-1">🌐</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Need at least {MIN_WORDS} words with embeddings
            </span>
          </div>
        )}

        {error && !loading && (
          <div
            className="w-full h-full flex flex-col items-center justify-center text-center px-3"
            style={{ background: bgColor }}
          >
            <span className="text-xs text-red-500 dark:text-red-400">
              Couldn&apos;t load map
            </span>
          </div>
        )}

        {graphData && !loading && (
          <Canvas
            dpr={BRAIN_DPR}
            gl={BRAIN_CANVAS_GL}
            camera={{ position: [0, 0, 11], fov: 48, near: 0.1, far: 100 }}
          >
            <color attach="background" args={[bgColor]} />
            <Suspense fallback={null}>
              <MiniScene
                nodes={graphData.nodes}
                edges={graphData.edges}
                isDark={isDark}
              />
            </Suspense>
          </Canvas>
        )}
      </button>

      {graphData && !loading && (
        <p className="text-[10px] text-gray-500 dark:text-gray-400 px-4 pt-1">
          {graphData.nodes.length} words · {graphData.clusters.length} clusters
        </p>
      )}
    </div>
  )
}
