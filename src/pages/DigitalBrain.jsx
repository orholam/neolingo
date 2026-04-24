import { useMemo, useRef, useState, Suspense, useEffect } from 'react'
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

const COURSES = {
  dadjo: { id: 'dadjo', label: 'Dadjo', emoji: '🌍', dictionary: dadjoDictionary, accent: '#f59e0b', accentDim: '#78350f' },
  sumerian: { id: 'sumerian', label: 'Ancient Sumerian', emoji: '𒀭', dictionary: sumerianDictionary, accent: '#a78bfa', accentDim: '#4c1d95' },
}

// Fibonacci-sphere layout — evenly distributes n points on a sphere
function spherePoints(n, radius) {
  if (n === 1) return [new THREE.Vector3(0, 0, radius)]
  const points = []
  const phi = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = phi * i
    points.push(new THREE.Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius))
  }
  return points
}

// k-nearest-neighbors by Euclidean distance in 3-space
function buildEdges(positions, k = 4) {
  const n = positions.length
  const edges = []
  const added = new Set()
  for (let i = 0; i < n; i++) {
    const dists = []
    for (let j = 0; j < n; j++) {
      if (i === j) continue
      dists.push({ j, d: positions[i].distanceTo(positions[j]) })
    }
    dists.sort((a, b) => a.d - b.d)
    for (let c = 0; c < Math.min(k, dists.length); c++) {
      const j = dists[c].j
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (!added.has(key)) {
        added.add(key)
        edges.push([i, j])
      }
    }
  }
  return edges
}

// Precomputed per-node size variation using a seeded pattern
function nodeScale(i) {
  return 0.85 + 0.3 * (((i * 2654435761) >>> 0) / 4294967295)
}

function Node({ position, color, index, isDark }) {
  const innerRef = useRef()
  const haloRef = useRef()
  const phase = (index * 1.618) % (Math.PI * 2)
  const scale = nodeScale(index)
  const coreR = 0.055 * scale

  // In light mode nodes don't need blinding emissive — rely on color + specular instead
  const baseEmissive = isDark ? 1.8 : 0.0
  const haloBaseOpacity = isDark ? 0.18 : 0.35

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const pulse = 0.85 + 0.15 * Math.sin(t * 1.4 + phase)
    if (innerRef.current) {
      innerRef.current.material.emissiveIntensity = baseEmissive * pulse
    }
    if (haloRef.current) {
      haloRef.current.material.opacity = haloBaseOpacity * pulse
      const s = 1 + 0.18 * Math.sin(t * 1.4 + phase + 0.4)
      haloRef.current.scale.setScalar(s)
    }
  })

  return (
    <group position={position}>
      {/* Core sphere */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[coreR, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={baseEmissive}
          roughness={isDark ? 0.1 : 0.25}
          metalness={isDark ? 0.4 : 0.15}
          toneMapped={false}
        />
      </mesh>
      {/* Soft halo */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[coreR * 2.8, 12, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isDark ? 0.6 : 0.0}
          transparent
          opacity={haloBaseOpacity}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function BrainGraph({ positions, edgePairs, nodeColor, lineColor, isDark }) {
  const groupRef = useRef()

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15
      groupRef.current.rotation.x += delta * 0.04
    }
  })

  return (
    <group ref={groupRef}>
      {edgePairs.map(([i, j], idx) => (
        <Line
          key={idx}
          points={[positions[i], positions[j]]}
          color={lineColor}
          lineWidth={0.6}
        />
      ))}
      {positions.map((pos, i) => (
        <Node key={i} index={i} position={pos} color={nodeColor} isDark={isDark} />
      ))}
    </group>
  )
}

function Scene({ masteredItems, langConfig, isDark }) {
  const n = masteredItems.length
  // Radius grows with sqrt so the sphere scales nicely
  const radius = Math.max(2.5, 1.4 * Math.sqrt(n))

  const { positions, edgePairs } = useMemo(() => {
    const positions = spherePoints(n, radius)
    const k = n <= 10 ? 3 : n <= 50 ? 4 : n <= 150 ? 3 : 2
    const edgePairs = buildEdges(positions, k)
    return { positions, edgePairs }
  }, [n, radius])

  const nodeColor = langConfig.accent
  // In light mode use a dark slate edge so they're visible against the pale bg
  const lineColor = isDark ? '#334155' : '#64748b'

  return (
    <>
      <ambientLight intensity={isDark ? 0.15 : 0.8} />
      <pointLight position={[6, 6, 6]} intensity={isDark ? 1.0 : 1.2} />
      <pointLight position={[-5, -3, 3]} intensity={0.4} color={nodeColor} />
      <BrainGraph
        positions={positions}
        edgePairs={edgePairs}
        nodeColor={nodeColor}
        lineColor={lineColor}
        isDark={isDark}
      />
      <OrbitControls enablePan enableZoom enableRotate minDistance={2} maxDistance={30} />
      {/* Only bloom in dark mode — in light mode it washes everything out */}
      {isDark && (
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.85}
            intensity={2.2}
            mipmapBlur
          />
        </EffectComposer>
      )}
    </>
  )
}

function DigitalBrain() {
  const { langId } = useParams()
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  )

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

  if (!course) {
    return (
      <div className="h-screen bg-gray-900 flex flex-col">
        <Header variant="main" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 mb-4">Language not found.</p>
            <button
              onClick={() => navigate('/home')}
              className="px-4 py-2 rounded-lg bg-gray-700 text-gray-200"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const bgColor = isDark ? '#0f172a' : '#e2e8f0'

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ background: bgColor }}>
      <Header variant="main" />

      {/* Canvas fills all remaining height */}
      <div className="flex-1 relative min-h-0 pt-20">
        {masteredItems.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-md px-6">
              <div className="text-6xl mb-4 opacity-50">🧠</div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                No mastered words yet
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Your digital brain grows as you master words. Complete flashcard sessions to see them here.
              </p>
              <button
                onClick={() => navigate('/flashcards')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Go to flashcards
              </button>
              <button
                onClick={() => navigate('/mastered')}
                className="ml-3 px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Mastered words
              </button>
            </div>
          </div>
        ) : (
          <Canvas
            style={{ width: '100%', height: '100%', display: 'block' }}
            camera={{ position: [0, 0, 12], fov: 50 }}
            gl={{ antialias: true }}
          >
            <color attach="background" args={[bgColor]} />
            <Suspense fallback={null}>
              <Scene masteredItems={masteredItems} langConfig={course} isDark={isDark} />
            </Suspense>
          </Canvas>
        )}

        {/* Info overlay — bottom-left */}
        <div className="absolute bottom-6 left-6 pointer-events-none select-none">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">{course.emoji}</span>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {course.label} — Digital Brain
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 pl-9">
            {masteredItems.length} word{masteredItems.length !== 1 ? 's' : ''} mastered
            {masteredItems.length > 0 && ' · drag to rotate · scroll to zoom'}
          </p>
        </div>

        {/* Nav — top-right of canvas, sits just below the fixed header */}
        <div className="absolute top-[88px] right-4 flex items-center gap-2 z-10">
          <BrainViewToggle current="brain" langId={langId} />
          <button
            onClick={() => navigate('/mastered')}
            className="px-4 py-2 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            Mastered words
          </button>
        </div>
      </div>
    </div>
  )
}

export default DigitalBrain
