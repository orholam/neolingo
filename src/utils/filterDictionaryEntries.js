export function filterDictionaryEntries(entries, query, extraFields = []) {
  const q = query.trim().toLowerCase()
  if (!q) return entries

  return entries.filter((entry) => {
    const headword = (entry.headword || '').toLowerCase()
    const phonetic = (entry.phonetic || '').toLowerCase()
    const sensesText = (entry.senses || []).join(' ').toLowerCase()

    if (headword.includes(q) || phonetic.includes(q) || sensesText.includes(q)) {
      return true
    }

    return extraFields.some((field) => (entry[field] || '').toLowerCase().includes(q))
  })
}
