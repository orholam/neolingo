import rawDictionary from './Dadjo/dadjo_dictionary.jsonl?raw'

// Parse the JSONL dictionary file into an array of entries
function parseDictionary(raw) {
  if (!raw) return []

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

export const dadjoDictionary = parseDictionary(rawDictionary)

