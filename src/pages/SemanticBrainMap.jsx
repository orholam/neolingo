import { useRef, useState, Suspense, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import Header from '../components/Header'
import BrainViewToggle from '../components/BrainViewToggle'
import { dadjoDictionary } from '../data/dadjoDictionary'
import { sumerianDictionary } from '../data/sumerianDictionary'
import { useWordMastery } from '../hooks/useWordMastery'
import { buildGraph, MIN_WORDS } from '../utils/semanticMapGraph'

const COURSES = {
  dadjo: {
    id: 'dadjo', label: 'Dadjo', emoji: '🌍',
    dictionary: dadjoDictionary,
    embeddingsPath: () => import('../data/dadjoEmbeddings.json'),
  },
  sumerian: {
    id: 'sumerian', label: 'Ancient Sumerian', emoji: '𒀭',
    dictionary: sumerianDictionary,
    embeddingsPath: () => import('../data/sumerianEmbeddings.json'),
  },
}

const CACHE_KEY_PREFIX = 'neolingo-semantic-map'
const CLUSTER_TITLE_CACHE_PREFIX = 'neolingo-semantic-cluster-title'

/** Generate a short category title from a cluster's word list via OpenAI. Results cached in localStorage by label. */
async function fetchClusterTitle(label) {
  if (!label || typeof label !== 'string') return null
  const cacheKey = `${CLUSTER_TITLE_CACHE_PREFIX}:${label}`
  try {
    const cached = typeof localStorage !== 'undefined' && localStorage.getItem(cacheKey)
    if (cached) return cached
  } catch (_) { /* ignore */ }

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY
  if (!apiKey) return null

  const words = label.split(/\s*·\s*/).filter(Boolean).slice(0, 10)
  const prompt = `You are naming a category for a language-learning app. Below are example words from one semantic cluster. Give a single short category name in English (2–4 words) that describes what all these words have in common. Examples: "Body parts", "Daily actions", "Nature and weather", "Family and people". Do NOT list or repeat the words—only output the category name.\n\nWords: ${words.join(', ')}`

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 20,
        temperature: 0.3,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const title = data?.choices?.[0]?.message?.content?.trim()
    if (title) {
      try { localStorage.setItem(cacheKey, title) } catch (_) { /* quota */ }
      return title
    }
  } catch (_) { /* network or parse */ }
  return null
}

// ─── Three.js components ──────────────────────────────────────────────────────

function WordNode({ position, color, label, translation, index, isDark, onHover }) {
  const meshRef = useRef()
  const haloRef = useRef()
  const phase = (index * 1.618) % (Math.PI * 2)
  const scale = 0.85 + 0.25 * (((index * 2654435761) >>> 0) / 4294967295)
  const coreR = 0.07 * scale
  const baseEmissive = isDark ? 1.6 : 0.0
  const haloBaseOpacity = isDark ? 0.22 : 0.38

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const pulse = 0.85 + 0.15 * Math.sin(t * 1.3 + phase)
    if (meshRef.current) meshRef.current.material.emissiveIntensity = baseEmissive * pulse
    if (haloRef.current) {
      haloRef.current.material.opacity = haloBaseOpacity * pulse
      haloRef.current.scale.setScalar(1 + 0.15 * Math.sin(t * 1.3 + phase + 0.4))
    }
  })

  const vec = new THREE.Vector3(...position)
  return (
    <group
      position={vec}
      onPointerOver={e => { e.stopPropagation(); onHover({ label, translation }) }}
      onPointerOut={e => { e.stopPropagation(); onHover(null) }}
    >
      <mesh ref={meshRef}>
        <sphereGeometry args={[coreR, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={baseEmissive}
          roughness={isDark ? 0.1 : 0.25} metalness={isDark ? 0.4 : 0.15} toneMapped={false} />
      </mesh>
      <mesh ref={haloRef}>
        <sphereGeometry args={[coreR * 2.6, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isDark ? 0.5 : 0.0}
          transparent opacity={haloBaseOpacity} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Edges({ nodes, edges, isDark }) {
  return edges.map(({ i, j, intraCluster }, idx) => (
    <Line
      key={idx}
      points={[nodes[i].position, nodes[j].position]}
      color={isDark
        ? (intraCluster ? nodes[i].color : '#334155')
        : (intraCluster ? nodes[i].color : '#94a3b8')}
      lineWidth={intraCluster ? 0.9 : 0.3}
      transparent
      opacity={intraCluster ? (isDark ? 0.55 : 0.6) : (isDark ? 0.08 : 0.12)}
    />
  ))
}

function BrainScene({ nodes, edges, isDark, onHover }) {
  const groupRef = useRef()
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12
      groupRef.current.rotation.x += delta * 0.03
    }
  })
  return (
    <group ref={groupRef}>
      <Edges nodes={nodes} edges={edges} isDark={isDark} />
      {nodes.map((node, i) => (
        <WordNode key={i} index={i} position={node.position} color={node.color}
          label={node.label} translation={node.translation} isDark={isDark} onHover={onHover} />
      ))}
    </group>
  )
}

function Scene({ nodes, edges, isDark, onHover }) {
  return (
    <>
      <ambientLight intensity={isDark ? 0.15 : 0.85} />
      <pointLight position={[6, 6, 6]} intensity={isDark ? 1.0 : 1.2} />
      <pointLight position={[-5, -3, 3]} intensity={0.5} color="#a78bfa" />
      <BrainScene nodes={nodes} edges={edges} isDark={isDark} onHover={onHover} />
      <OrbitControls enablePan enableZoom enableRotate minDistance={2} maxDistance={30} />
      {isDark && (
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.85} intensity={2.0} mipmapBlur />
        </EffectComposer>
      )}
    </>
  )
}

// ─── Overlays ─────────────────────────────────────────────────────────────────

function Tooltip({ hovered }) {
  if (!hovered) return null
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-20">
      <div className="bg-gray-900/90 dark:bg-gray-800/95 text-white backdrop-blur rounded-xl px-4 py-2.5 shadow-2xl border border-white/10">
        <span className="font-bold text-sm">{hovered.label}</span>
        {hovered.translation && (
          <span className="text-gray-400 text-sm ml-2">→ {hovered.translation}</span>
        )}
      </div>
    </div>
  )
}

function ClusterLegend({ clusters, clusterTitles = {} }) {
  if (!clusters.length) return null
  return (
    <div className="absolute bottom-6 right-6 pointer-events-none select-none max-w-[180px]">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-xl px-3 py-2 border border-gray-200/60 dark:border-gray-700/60 shadow-lg">
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">Clusters</p>
        <div className="space-y-1">
          {clusters.map(({ id, color, label, count }) => (
            <div key={id} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs text-gray-700 dark:text-gray-300 truncate" title={label}>
                {clusterTitles[label] ?? label}
              </span>
              <span className="text-[10px] text-gray-400 ml-auto pl-1">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SemanticBrainMap() {
  const { langId } = useParams()
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  )
  const [graphData, setGraphData] = useState(null)
  const [clusterTitles, setClusterTitles] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    if (typeof document === 'undefined') return
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains('dark'))
    )
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  const course = COURSES[langId] || null
  const dictionary = course?.dictionary || []
  const languageId = course?.id === 'sumerian' ? 'Sumerian' : 'Dadjo'
  const { getUniversalMasteredWords } = useWordMastery(languageId, dictionary)
  const masteredItems = getUniversalMasteredWords()
  const masteredSignature = useMemo(
    () => masteredItems.map(m => m.id).sort().join('|'),
    [masteredItems.length, masteredItems.map(m => m.id).sort().join(',')]
  )

  useEffect(() => {
    if (!course || !masteredItems.length) { setLoading(false); return }

    const cacheKey = `${CACHE_KEY_PREFIX}:${langId}:${masteredSignature}`

    try {
      const cached = typeof localStorage !== 'undefined' && localStorage.getItem(cacheKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed?.nodes?.length >= MIN_WORDS) {
          setGraphData(parsed)
          setLoading(false)
          setError(null)
          return
        }
      }
    } catch (_) { /* ignore stale or invalid cache */ }

    course.embeddingsPath()
      .then(mod => {
        const embeddingsMap = mod.default
        const result = buildGraph(masteredItems, embeddingsMap)
        if (result.error) {
          const { matched, total } = result
          throw new Error(
            `Need at least ${MIN_WORDS} words with embeddings. ${matched} of your ${total} mastered word${total !== 1 ? 's' : ''} matched.`
          )
        }
        try {
          if (typeof localStorage !== 'undefined') localStorage.setItem(cacheKey, JSON.stringify(result))
        } catch (_) { /* quota or disabled */ }
        setGraphData(result)
        setLoading(false)
        setError(null)
      })
      .catch(err => {
        console.error(err)
        setError(err.message || 'Failed to load embeddings.')
        setLoading(false)
      })
  }, [langId, masteredSignature])

  // When graph has clusters, ensure each has a title: use cache or fetch from LLM (needs VITE_OPENAI_API_KEY in .env)
  useEffect(() => {
    if (!graphData?.clusters?.length) return
    graphData.clusters.forEach(({ label }) => {
      fetchClusterTitle(label).then((title) => {
        if (title) setClusterTitles((prev) => ({ ...prev, [label]: title }))
      })
    })
  }, [graphData])

  const bgColor = isDark ? '#0f172a' : '#e2e8f0'

  if (!course) {
    return (
      <div className="h-screen bg-gray-950 flex flex-col">
        <Header variant="main" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Language not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ background: bgColor }}>
      <Header variant="main" />

      <div className="flex-1 relative min-h-0 pt-20">

        {/* ── No mastered words ── */}
        {!loading && masteredItems.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-md px-6">
              <div className="text-6xl mb-4 opacity-50">🧠</div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                No mastered words yet
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Master some words via flashcards and come back to see your semantic map.
              </p>
              <button
                onClick={() => navigate('/flashcards')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Go to flashcards
              </button>
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-4 animate-pulse">🧠</div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                Computing semantic clusters…
              </p>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-sm px-6">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-sm text-red-500 font-semibold mb-1">Something went wrong</p>
              <p className="text-xs text-gray-400">{error}</p>
            </div>
          </div>
        )}

        {/* ── 3D canvas ── */}
        {graphData && !loading && (
          <Canvas
            style={{ width: '100%', height: '100%', display: 'block' }}
            camera={{ position: [0, 0, 14], fov: 50 }}
            gl={{ antialias: true }}
          >
            <color attach="background" args={[bgColor]} />
            <Suspense fallback={null}>
              <Scene nodes={graphData.nodes} edges={graphData.edges} isDark={isDark} onHover={setHovered} />
            </Suspense>
          </Canvas>
        )}

        <Tooltip hovered={hovered} />
        {graphData && <ClusterLegend clusters={graphData.clusters} clusterTitles={clusterTitles} />}

        {/* ── Bottom-left info ── */}
        <div className="absolute bottom-6 left-6 pointer-events-none select-none">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">{course.emoji}</span>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {course.label} — Semantic Map
            </span>
          </div>
          {graphData && (
            <p className="text-sm text-gray-500 dark:text-gray-400 pl-9">
              {graphData.nodes.length} word{graphData.nodes.length !== 1 ? 's' : ''}
              {' · '}{graphData.clusters.length} cluster{graphData.clusters.length !== 1 ? 's' : ''}
              {' · drag to rotate · scroll to zoom'}
            </p>
          )}
        </div>

        {/* ── Top-right nav, sits just below the fixed header ── */}
        <div className="absolute top-[88px] right-4 flex items-center gap-2 z-10">
          <BrainViewToggle current="map" langId={langId} />
        </div>
      </div>
    </div>
  )
}
