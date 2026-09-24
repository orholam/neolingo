// Shared vector/matrix math for building word-embedding graphs (semantic map,
// memory maps). Pure, dependency-free numeric helpers.

export function dot(a, b) {
  let s = 0
  for (let i = 0; i < a.length; i++) s += a[i] * b[i]
  return s
}

export function norm(v) {
  return Math.sqrt(dot(v, v))
}

/** Mean-centers each column of `mat` in place. */
export function centerMatrix(mat) {
  const n = mat.length,
    d = mat[0].length
  const mean = new Float32Array(d)
  for (const row of mat) for (let i = 0; i < d; i++) mean[i] += row[i] / n
  for (const row of mat) for (let i = 0; i < d; i++) row[i] -= mean[i]
}

/**
 * Power-iteration PCA. Returns `n` components per row, scaled so the largest
 * absolute coordinate across all rows/components is 3.8 (matches the layout
 * scale used throughout the 3D brain views).
 */
export function pcaN(centeredMat, n, maxIter = 120) {
  const rows = centeredMat.length,
    d = centeredMat[0].length
  const eigvecs = []
  const residual = centeredMat.map((r) => Float32Array.from(r))

  for (let c = 0; c < n; c++) {
    let v = new Float32Array(d)
    for (let i = 0; i < d; i++) v[i] = Math.random() - 0.5
    let n2 = norm(v)
    for (let i = 0; i < d; i++) v[i] /= n2

    for (let it = 0; it < maxIter; it++) {
      const Xv = new Float32Array(rows)
      for (let i = 0; i < rows; i++) Xv[i] = dot(residual[i], v)
      const newV = new Float32Array(d)
      for (let i = 0; i < rows; i++)
        for (let j = 0; j < d; j++) newV[j] += Xv[i] * residual[i][j]
      n2 = norm(newV)
      if (n2 < 1e-12) break
      for (let j = 0; j < d; j++) newV[j] /= n2
      const diff = norm(newV.map((x, j) => x - v[j]))
      v = newV
      if (diff < 1e-6) break
    }
    eigvecs.push(v)
    for (let i = 0; i < rows; i++) {
      const p = dot(residual[i], v)
      for (let j = 0; j < d; j++) residual[i][j] -= p * v[j]
    }
  }

  const coords = centeredMat.map((row) => eigvecs.map((v) => dot(row, v)))
  const maxVal = coords.reduce((m, c) => Math.max(m, ...c.map(Math.abs)), 0) || 1
  return coords.map((c) => c.map((x) => (x / maxVal) * 3.8))
}

/** Convenience wrapper for the common 3-component case. */
export function pca3(centeredMat, maxIter = 120) {
  return pcaN(centeredMat, 3, maxIter)
}

export function kmeans(points, k, maxIter = 100) {
  const n = points.length,
    d = points[0].length
  if (n <= k) return points.map((_, i) => i % k)

  const cIdx = [Math.floor(Math.random() * n)]
  for (let c = 1; c < k; c++) {
    const dists = points.map((p) => {
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
