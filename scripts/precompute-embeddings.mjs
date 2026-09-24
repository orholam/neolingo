/**
 * precompute-embeddings.mjs
 *
 * Runs once in Node.js. Downloads all-MiniLM-L6-v2 (~25 MB, cached after first run),
 * embeds every dictionary entry's English senses, applies PCA to 64 dimensions,
 * and writes compact JSON files to src/data/.
 *
 * Usage:  node scripts/precompute-embeddings.mjs
 */

import { pipeline } from '@xenova/transformers'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// ── helpers ──────────────────────────────────────────────────────────────────

function loadJsonl(p) {
  return readFileSync(p, 'utf8')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => JSON.parse(l))
}

function senseText(item) {
  const s = Array.isArray(item.senses) ? item.senses.filter(Boolean).join(', ') : ''
  return s.trim() || item.headword || 'word'
}

function dotProduct(a, b) {
  let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s
}

function vecNorm(v) { return Math.sqrt(dotProduct(v, v)) }

function centerMatrix(mat) {
  const n = mat.length, d = mat[0].length
  const mean = new Float64Array(d)
  for (const row of mat) for (let i = 0; i < d; i++) mean[i] += row[i] / n
  for (const row of mat) for (let i = 0; i < d; i++) row[i] -= mean[i]
}

function pca(centeredMat, k = 64, maxIter = 200) {
  const n = centeredMat.length, d = centeredMat[0].length
  const eigvecs = []
  const residual = centeredMat.map(r => Float64Array.from(r))

  for (let c = 0; c < k; c++) {
    let v = new Float64Array(d)
    for (let i = 0; i < d; i++) v[i] = Math.random() - 0.5
    let norm = vecNorm(v); for (let i = 0; i < d; i++) v[i] /= norm

    for (let it = 0; it < maxIter; it++) {
      const Xv = new Float64Array(n)
      for (let i = 0; i < n; i++) Xv[i] = dotProduct(residual[i], v)
      const newV = new Float64Array(d)
      for (let i = 0; i < n; i++) for (let j = 0; j < d; j++) newV[j] += Xv[i] * residual[i][j]
      norm = vecNorm(newV); if (norm < 1e-12) break
      for (let j = 0; j < d; j++) newV[j] /= norm
      const diff = vecNorm(Array.from(newV).map((x, j) => x - v[j]))
      v = newV; if (diff < 1e-8) break
    }
    eigvecs.push(v)
    for (let i = 0; i < n; i++) {
      const proj = dotProduct(residual[i], v)
      for (let j = 0; j < d; j++) residual[i][j] -= proj * v[j]
    }
    if (c % 8 === 0) process.stdout.write(`  PCA component ${c + 1}/${k}\r`)
  }
  console.log()
  return centeredMat.map(row => eigvecs.map(v => dotProduct(row, v)))
}

// ── main ─────────────────────────────────────────────────────────────────────

async function embedDictionary(extractor, entries) {
  const embeddings = []
  for (let i = 0; i < entries.length; i++) {
    const text = senseText(entries[i])
    const out = await extractor(text, { pooling: 'mean', normalize: true })
    embeddings.push(Array.from(out.data))
    if (i % 50 === 0 || i === entries.length - 1)
      process.stdout.write(`  ${i + 1}/${entries.length} embedded\r`)
  }
  console.log()
  return embeddings
}

async function main() {
  console.log('Loading model (downloads once, then cached)…')
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    quantized: true,
  })

  const datasets = [
    {
      name: 'Dadjo',
      jsonl: resolve(root, 'src/data/Dadjo/dadjo_dictionary.jsonl'),
      out: resolve(root, 'src/data/dadjoEmbeddings.json'),
    },
    {
      name: 'Sumerian',
      jsonl: resolve(root, 'src/data/sumerianDictionary.jsonl'),
      out: resolve(root, 'src/data/sumerianEmbeddings.json'),
    },
    {
      name: 'Korean',
      jsonl: resolve(root, 'src/data/koreanDictionary.jsonl'),
      out: resolve(root, 'src/data/koreanEmbeddings.json'),
    },
  ]

  for (const { name, jsonl, out } of datasets) {
    console.log(`\n── ${name} ──`)
    const entries = loadJsonl(jsonl)
    console.log(`  ${entries.length} entries`)

    console.log('  Embedding…')
    const rawEmbeddings = await embedDictionary(extractor, entries)

    // PCA to 64 dims so the JSON is ~10× smaller with negligible quality loss
    const targetDims = Math.min(64, rawEmbeddings[0].length, entries.length - 1)
    console.log(`  PCA to ${targetDims} dims…`)
    const mat = rawEmbeddings.map(e => Float64Array.from(e))
    centerMatrix(mat)
    const reduced = pca(mat, targetDims)

    // Build headword → [64 floats] map (3 decimal places = compact enough)
    const result = {}
    entries.forEach((item, i) => {
      result[item.headword] = reduced[i].map(x => Math.round(x * 1000) / 1000)
    })

    writeFileSync(out, JSON.stringify(result))
    console.log(`  Saved → ${out.replace(root, '.')}`)
    console.log(`  Size: ${(JSON.stringify(result).length / 1024).toFixed(1)} KB`)
  }

  console.log('\nDone. Commit the generated .json files.')
}

main().catch(err => { console.error(err); process.exit(1) })
