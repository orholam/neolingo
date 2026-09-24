// Shared graph building for semantic 3D map (used by SemanticBrainMap and MiniSemanticMap).

import { dot, centerMatrix, pca3, kmeans } from './vectorMath'

export const CLUSTER_PALETTE = [
  '#f472b6', '#60a5fa', '#34d399', '#fb923c',
  '#a78bfa', '#facc15', '#f87171', '#2dd4bf',
  '#818cf8', '#4ade80',
]

export const MIN_WORDS = 2

/**
 * Build nodes, edges, and clusters for the semantic map.
 * @param {Array} masteredItems - from getUniversalMasteredWords()
 * @param {Object} embeddingsMap - word -> vector
 * @param {number} [maxNodes] - optional cap (e.g. for mini widget)
 * @returns {{ nodes, edges, clusters } | { error: true, matched, total }}
 */
export function buildGraph(masteredItems, embeddingsMap, maxNodes = null) {
  const getEntry = (item) => item.entry ?? item
  const getHeadword = (item) =>
    (getEntry(item).headword ?? '').trim().toLowerCase()

  const map =
    typeof embeddingsMap === 'object' && embeddingsMap !== null
      ? Object.fromEntries(
          Object.entries(embeddingsMap).map(([k, v]) => [
            (k ?? '').trim().toLowerCase(),
            v,
          ])
        )
      : {}

  let found = masteredItems
    .map((item) => ({
      item,
      entry: getEntry(item),
      vec: map[getHeadword(item)],
    }))
    .filter((x) => x.vec)

  if (maxNodes != null && found.length > maxNodes) {
    found = found.slice(0, maxNodes)
  }

  if (found.length < MIN_WORDS)
    return {
      error: true,
      matched: found.length,
      total: masteredItems.length,
    }

  const rawEmbeddings = found.map((x) => x.vec)
  const n = found.length
  const k = Math.max(2, Math.min(10, Math.round(Math.sqrt(n / 2))))

  const labels = kmeans(rawEmbeddings, k)

  const mat = rawEmbeddings.map((e) => Float32Array.from(e))
  centerMatrix(mat)
  const coords3d = pca3(mat)

  const bags = Array.from({ length: k }, () => [])
  const stopwords = new Set([
    'the', 'and', 'for', 'that', 'with', 'from', 'are', 'one', 'two', 'not',
    'its',
  ])
  found.forEach(({ entry }, i) => {
    const words = (Array.isArray(entry.senses) ? entry.senses : [entry.english || ''])
      .join(' ')
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2 && !stopwords.has(w))
    bags[labels[i]].push(...words)
  })
  const clusterLabels = bags.map((words) => {
    const freq = {}
    for (const w of words) freq[w] = (freq[w] || 0) + 1
    return (
      Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([w]) => w)
        .join(' · ') || 'misc'
    )
  })

  const usedClusters = [...new Set(labels)]
  const colorMap = {}
  usedClusters.forEach(
    (cid, i) => (colorMap[cid] = CLUSTER_PALETTE[i % CLUSTER_PALETTE.length])
  )

  const nodes = found.map(({ entry }, i) => ({
    label: entry.headword,
    translation: Array.isArray(entry.senses)
      ? entry.senses[0] || ''
      : entry.english || '',
    position: coords3d[i],
    cluster: labels[i],
    color: colorMap[labels[i]],
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
        sim:
          nd.cluster === nodes[i].cluster && j !== i
            ? dot(rawEmbeddings[i], rawEmbeddings[j])
            : -1,
      }))
      .filter((x) => x.sim > -1)
      .sort((a, b) => b.sim - a.sim)
      .slice(0, 3)
      .forEach(({ j }) => tryAdd(i, j, true))
  }
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      if (
        nodes[i].cluster !== nodes[j].cluster &&
        dot(rawEmbeddings[i], rawEmbeddings[j]) > 0.72
      )
        tryAdd(i, j, false)

  const clusterCounts = {}
  for (const l of labels) clusterCounts[l] = (clusterCounts[l] || 0) + 1

  const clusters = usedClusters.map((cid) => ({
    id: cid,
    color: colorMap[cid],
    label: clusterLabels[cid],
    count: clusterCounts[cid] || 0,
  }))

  return { nodes, edges, clusters }
}
