// Shared graph building for semantic 3D map (used by SemanticBrainMap and MiniSemanticMap).

export const CLUSTER_PALETTE = [
  '#f472b6', '#60a5fa', '#34d399', '#fb923c',
  '#a78bfa', '#facc15', '#f87171', '#2dd4bf',
  '#818cf8', '#4ade80',
]

export const MIN_WORDS = 2

function dot(a, b) {
  let s = 0
  for (let i = 0; i < a.length; i++) s += a[i] * b[i]
  return s
}
function norm(v) {
  return Math.sqrt(dot(v, v))
}

function centerMatrix(mat) {
  const n = mat.length,
    d = mat[0].length
  const mean = new Float32Array(d)
  for (const row of mat) for (let i = 0; i < d; i++) mean[i] += row[i] / n
  for (const row of mat) for (let i = 0; i < d; i++) row[i] -= mean[i]
}

function pca3(centeredMat, maxIter = 120) {
  const n = centeredMat.length,
    d = centeredMat[0].length
  const eigvecs = []
  const residual = centeredMat.map((r) => Float32Array.from(r))

  for (let c = 0; c < 3; c++) {
    let v = new Float32Array(d)
    for (let i = 0; i < d; i++) v[i] = Math.random() - 0.5
    let n2 = norm(v)
    for (let i = 0; i < d; i++) v[i] /= n2

    for (let it = 0; it < maxIter; it++) {
      const Xv = new Float32Array(n)
      for (let i = 0; i < n; i++) Xv[i] = dot(residual[i], v)
      const newV = new Float32Array(d)
      for (let i = 0; i < n; i++)
        for (let j = 0; j < d; j++) newV[j] += Xv[i] * residual[i][j]
      n2 = norm(newV)
      if (n2 < 1e-12) break
      for (let j = 0; j < d; j++) newV[j] /= n2
      const diff = norm(newV.map((x, j) => x - v[j]))
      v = newV
      if (diff < 1e-6) break
    }
    eigvecs.push(v)
    for (let i = 0; i < n; i++) {
      const p = dot(residual[i], v)
      for (let j = 0; j < d; j++) residual[i][j] -= p * v[j]
    }
  }

  const coords = centeredMat.map((row) => eigvecs.map((v) => dot(row, v)))
  const maxVal = coords.reduce((m, c) => Math.max(m, ...c.map(Math.abs)), 0) || 1
  return coords.map((c) => c.map((x) => (x / maxVal) * 3.8))
}

function kmeans(points, k, maxIter = 100) {
  const n = points.length,
    d = points[0].length
  if (n <= k) return points.map((_, i) => i % k)

  const cIdx = [Math.floor(Math.random() * n)]
  for (let c = 1; c < k; c++) {
    const dists = points.map((p, i) => {
      let minD = Infinity
      for (const ci of cIdx) {
        const diff = points[ci].map((x, j) => x - p[j])
        minD = Math.min(minD, dot(diff, diff))
      }
      return minD
    })
    const total = dists.reduce((s, x) => s + x, 0)
    let r = Math.random() * total,
      chosen = n - 1
    for (let i = 0; i < n; i++) {
      r -= dists[i]
      if (r <= 0) {
        chosen = i
        break
      }
    }
    cIdx.push(chosen)
  }

  let centers = cIdx.map((i) => Float32Array.from(points[i]))
  let labels = new Int32Array(n)

  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false
    for (let i = 0; i < n; i++) {
      let best = 0,
        bestD = Infinity
      for (let c = 0; c < k; c++) {
        const diff = centers[c].map((x, j) => x - points[i][j])
        const d2 = dot(diff, diff)
        if (d2 < bestD) {
          bestD = d2
          best = c
        }
      }
      if (labels[i] !== best) {
        labels[i] = best
        changed = true
      }
    }
    if (!changed) break
    const sums = Array.from({ length: k }, () => new Float32Array(d))
    const counts = new Int32Array(k)
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < d; j++) sums[labels[i]][j] += points[i][j]
      counts[labels[i]]++
    }
    centers = sums.map((s, c) =>
      counts[c] > 0 ? s.map((x) => x / counts[c]) : centers[c]
    )
  }
  return Array.from(labels)
}

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
