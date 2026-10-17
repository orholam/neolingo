import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LANGUAGES } from './languages.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function parseDictionary(raw) {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      try {
        return JSON.parse(line)
      } catch {
        return null
      }
    })
    .filter(Boolean)
    .sort((a, b) => {
      const ha = (a.headword || '').toLowerCase()
      const hb = (b.headword || '').toLowerCase()
      if (ha < hb) return -1
      if (ha > hb) return 1
      return 0
    })
}

function primaryGloss(entry) {
  if (!entry) return ''
  if (Array.isArray(entry.senses) && entry.senses.length > 0) {
    const first = entry.senses[0]
    if (typeof first === 'string') return first
    if (first && typeof first.gloss === 'string') return first.gloss
  }
  return ''
}

let cached

export function loadDictionaries() {
  if (cached) return cached
  const byMemoryKey = {}
  for (const lang of LANGUAGES) {
    const raw = readFileSync(join(root, lang.dictionary), 'utf8')
    byMemoryKey[lang.memoryKey] = parseDictionary(raw)
  }
  cached = byMemoryKey
  return byMemoryKey
}

export function lookupWord(entries, wordId) {
  const id = String(wordId)
  const sep = id.lastIndexOf('::')
  if (sep === -1) return { word: id, gloss: '' }
  const word = id.slice(0, sep)
  const index = Number(id.slice(sep + 2))
  const entry = Number.isInteger(index) ? entries?.[index] : null
  const gloss = entry && entry.headword === word ? primaryGloss(entry) : ''
  return { word, gloss }
}
