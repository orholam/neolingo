// Graph building for the Short-Term / Long-Term Memory 3D maps.
//
// Words are laid out on a flat X/Z plane using 2D PCA over their embeddings
// (same semantic clustering approach as semanticMapGraph.js), and height (Y)
// is applied separately from live memory scores so the expensive layout can
// be cached while height stays fresh on every render.

import { dot, centerMatrix, pcaN, kmeans } from './vectorMath'
import { MIN_MEMORY, MAX_MEMORY, clampMemory } from './wordMemory'

export const MIN_WORDS = 2

// How far short-term memory dips below the surface (STM=1) / long-term
// memory rises above the ground (LTM=10).
export const DIP_DEPTH = 3.2
export const RISE_HEIGHT = 3.2

const RED = [239, 68, 68]
const AMBER = [245, 158, 11]
const GREEN = [34, 197, 94]

function lerpChannel(a, b, t) {
  return Math.round(a + (b - a) * t)
}

function toHex([r, g, b]) {
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

/** Red (weak) -> amber -> green (strong) gradient for a 1-10 memory value. */
export function memoryColor(value) {
  const t = Math.max(0, Math.min(1, (value - MIN_MEMORY) / (MAX_MEMORY - MIN_MEMORY)))
  const [c1, c2, localT] = t < 0.5 ? [RED, AMBER, t / 0.5] : [AMBER, GREEN, (t - 0.5) / 0.5]
  return toHex([
    lerpChannel(c1[0], c2[0], localT),
    lerpChannel(c1[1], c2[1], localT),
    lerpChannel(c1[2], c2[2], localT),
  ])
}

/**
 * Build the horizontal (X/Z) layout, clustering, and edges for the memory
 * maps. Does not depend on time, so callers can cache this the same way
 * SemanticBrainMap caches buildGraph's result.
 */
export function buildMemoryLayout(masteredItems, embeddingsMap, maxNodes = null) {
  const getEntry = (item) => item.entry ?? item
  const getHeadword = (item) => (getEntry(item).headword ?? '').trim().toLowerCase()

  const map =
    typeof embeddingsMap === 'object' && embeddingsMap !== null
      ? Object.fromEntries(
          Object.entries(embeddingsMap).map(([k, v]) => [(k ?? '').trim().toLowerCase(), v])
        )
      : {}

  let found = masteredItems
    .map((item) => ({
      id: item.id,
      entry: getEntry(item),
      vec: map[getHeadword(item)],
    }))
    .filter((x) => x.vec)

  if (maxNodes != null && found.length > maxNodes) {
    found = found.slice(0, maxNodes)
  }

  if (found.length < MIN_WORDS) {
    return { error: true, matched: found.length, total: masteredItems.length }
  }

  const rawEmbeddings = found.map((x) => x.vec)
  const n = found.length
  const k = Math.max(2, Math.min(10, Math.round(Math.sqrt(n / 2))))
  const labels = kmeans(rawEmbeddings, k)

  const mat = rawEmbeddings.map((e) => Float32Array.from(e))
  centerMatrix(mat)
  const coords2d = pcaN(mat, 2)

  const nodes = found.map(({ id, entry }, i) => ({
    id,
    label: entry.headword,
    translation: Array.isArray(entry.senses) ? entry.senses[0] || '' : entry.english || '',
    x: coords2d[i][0],
    z: coords2d[i][1],
    cluster: labels[i],
  }))

  const edgeSet = new Set()
  const edges = []
  const tryAdd = (i, j, intra) => {
    const key = i < j ? `${i}-${j}` : `${j}-${i}`
    if (!edgeSet.has(key)) {
      edgeSet.add(key)
      edges.push({ i, j, intraCluster: intra })
    }
  }
  for (let i = 0; i < n; i++) {
    nodes
      .map((nd, j) => ({
        j,
        sim: nd.cluster === nodes[i].cluster && j !== i ? dot(rawEmbeddings[i], rawEmbeddings[j]) : -1,
      }))
      .filter((x) => x.sim > -1)
      .sort((a, b) => b.sim - a.sim)
      .slice(0, 3)
      .forEach(({ j }) => tryAdd(i, j, true))
  }
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      if (nodes[i].cluster !== nodes[j].cluster && dot(rawEmbeddings[i], rawEmbeddings[j]) > 0.72)
        tryAdd(i, j, false)

  return { nodes, edges }
}

/**
 * Applies live memory-derived heights/colors on top of a cached layout.
 * Pure and cheap - safe to call on every render/tick.
 *
 * @param {{nodes, edges}} layout - result of buildMemoryLayout
 * @param {Object} memoryByWordId - wordId -> { longTermMemory, shortTermMemory, lastReviewedAt }
 * @param {'short'|'long'} mode
 */
export function applyMemoryHeights(layout, memoryByWordId, mode) {
  const nodes = layout.nodes.map((node) => {
    const mem = memoryByWordId[node.id]
    const longTermMemory = clampMemory(mem?.longTermMemory ?? MIN_MEMORY)
    const shortTermMemory = clampMemory(mem?.shortTermMemory ?? MIN_MEMORY)
    const value = mode === 'long' ? longTermMemory : shortTermMemory
    const y =
      mode === 'long'
        ? ((longTermMemory - MIN_MEMORY) / (MAX_MEMORY - MIN_MEMORY)) * RISE_HEIGHT
        : ((shortTermMemory - MAX_MEMORY) / (MAX_MEMORY - MIN_MEMORY)) * DIP_DEPTH

    return {
      ...node,
      position: [node.x, y, node.z],
      groundPosition: [node.x, 0, node.z],
      value,
      longTermMemory,
      shortTermMemory,
      lastReviewedAt: mem?.lastReviewedAt ?? null,
      reviewCount: mem?.reviewCount ?? 0,
      color: memoryColor(value),
    }
  })
  return { nodes, edges: layout.edges }
}
