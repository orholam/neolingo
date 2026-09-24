import { useMemo, useRef, useState, Suspense, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import BrainViewToggle from '../components/BrainViewToggle'
import BrainCanvasFrame from '../components/BrainCanvasFrame'
import { COURSES, getLanguageId } from '../data/courses'
import { useWordMastery } from '../hooks/useWordMastery'
import {
  BrainCamera,
  BRAIN_CANVAS_GL,
  BRAIN_DPR,
  computeCameraDistance,
  computeSphereRadius,
} from '../utils/brainScene'

const BRAIN_COURSES = Object.fromEntries(
  Object.entries(COURSES).map(([id, course]) => [
    id,
    {
      id: course.id,
      label: course.label,
      emoji: course.emoji,
      dictionary: course.dictionary,
      accent: course.accent,
      accentDim: course.accentDim,
    },
  ])
)

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
          lineWidth={2}
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
  const radius = computeSphereRadius(n)

  const { positions, edgePairs } = useMemo(() => {
    const positions = spherePoints(n, radius)
    const k = n <= 10 ? 3 : n <= 50 ? 4 : n <= 150 ? 3 : 2
    const edgePairs = buildEdges(positions, k)
    return { positions, edgePairs }
  }, [n, radius])

  const nodeColor = langConfig.accent
  const lineColor = isDark ? '#475569' : '#64748b'
  const orbitMin = Math.max(2, radius * 0.45)
  const orbitMax = Math.max(30, radius * 4.5)

  return (
    <>
      <BrainCamera radius={radius} />
      <ambientLight intensity={isDark ? 0.25 : 0.85} />
      <pointLight position={[6, 6, 6]} intensity={isDark ? 1.2 : 1.3} />
      <pointLight position={[-5, -3, 3]} intensity={0.45} color={nodeColor} />
      <BrainGraph
        positions={positions}
        edgePairs={edgePairs}
        nodeColor={nodeColor}
        lineColor={lineColor}
        isDark={isDark}
      />
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
          <Bloom
            luminanceThreshold={0.25}
            luminanceSmoothing={0.9}
            intensity={1.4}
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

  const course = BRAIN_COURSES[langId] || null
  const dictionary = course?.dictionary || []
  const languageId = course ? getLanguageId(course.id) : 'Dadjo'
  const { getUniversalMasteredWords } = useWordMastery(languageId, dictionary)
  const masteredItems = getUniversalMasteredWords()

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

  const bgColor = isDark ? '#0f172a' : '#e2e8f0'

  return (
    <div
      className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
      style={{ background: bgColor }}
    >
      <BrainCanvasFrame embedded>
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
                type="button"
                onClick={() => navigate('/flashcards/new')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
              >
                Start flashcards
              </button>
            </div>
          </div>
        ) : (
          <Canvas
            key={langId}
            dpr={BRAIN_DPR}
            gl={BRAIN_CANVAS_GL}
            camera={{ position: [0, 0, computeCameraDistance(computeSphereRadius(masteredItems.length))], fov: 45, near: 0.1, far: 200 }}
          >
            <color attach="background" args={[bgColor]} />
            <Suspense fallback={null}>
              <Scene masteredItems={masteredItems} langConfig={course} isDark={isDark} />
            </Suspense>
          </Canvas>
        )}

        {/* Info overlay — bottom-left */}
        <div className="absolute bottom-6 left-6 pointer-events-none select-none z-10">
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

        {/* View toggle — top-right */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <BrainViewToggle current="brain" langId={langId} />
        </div>
      </BrainCanvasFrame>
    </div>
  )
}

export default DigitalBrain
