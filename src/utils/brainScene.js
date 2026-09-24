import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

/** Radius for fibonacci-sphere layout used by DigitalBrain. */
export function computeSphereRadius(nodeCount) {
  const n = Math.max(1, nodeCount)
  return Math.max(2.5, 1.4 * Math.sqrt(n))
}

/** Max distance from origin for semantic-map PCA nodes. */
export function computeGraphRadius(nodes) {
  if (!nodes?.length) return 4
  let max = 0
  for (const node of nodes) {
    const [x = 0, y = 0, z = 0] = node.position || []
    const d = Math.hypot(x, y, z)
    if (d > max) max = d
  }
  return Math.max(3, max * 1.4)
}

/** Pull camera back so the full graph stays in frame. */
export function computeCameraDistance(radius) {
  return Math.max(10, radius * 2.75 + 5)
}

/** Fit camera and orbit limits to graph size. */
export function BrainCamera({ radius, minFactor = 0.55, maxFactor = 4.5 }) {
  const distance = computeCameraDistance(radius)
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, radius * 0.15, distance)
    camera.lookAt(0, 0, 0)
    camera.near = 0.1
    camera.far = Math.max(200, distance * 8)
    camera.updateProjectionMatrix()
  }, [camera, distance, radius])

  return null
}

export const BRAIN_CANVAS_GL = {
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance',
}

export const BRAIN_DPR = [1, 2]
