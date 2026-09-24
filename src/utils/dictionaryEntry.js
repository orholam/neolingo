export function getPrimaryGloss(entry) {
  if (!entry) return ''
  if (Array.isArray(entry.senses) && entry.senses.length > 0) {
    const first = entry.senses[0]
    if (typeof first === 'string') return first
    if (first && typeof first.gloss === 'string') return first.gloss
    if (first && typeof first.translation === 'string') return first.translation
  }
  if (typeof entry.gloss === 'string') return entry.gloss
  if (typeof entry.translation === 'string') return entry.translation
  return ''
}

export function getPhonetic(entry) {
  if (!entry) return ''
  if (typeof entry.phonetic === 'string') return entry.phonetic
  if (typeof entry.pronunciation === 'string') return entry.pronunciation
  return ''
}
