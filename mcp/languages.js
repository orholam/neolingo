export const LANGUAGES = [
  { id: 'dadjo', name: 'Dadjo', memoryKey: 'Dadjo', dictionary: 'src/data/Dadjo/dadjo_dictionary.jsonl' },
  { id: 'sumerian', name: 'Sumerian', memoryKey: 'Sumerian', dictionary: 'src/data/sumerianDictionary.jsonl' },
  { id: 'korean', name: 'Korean', memoryKey: 'Korean', dictionary: 'src/data/koreanDictionary.jsonl' },
  { id: 'french', name: 'French', memoryKey: 'French', dictionary: 'src/data/frenchDictionary.jsonl' },
]

export function findLanguage(query) {
  if (!query) return null
  const needle = String(query).trim().toLowerCase()
  return (
    LANGUAGES.find(
      (lang) =>
        lang.id === needle ||
        lang.name.toLowerCase() === needle ||
        lang.memoryKey.toLowerCase() === needle,
    ) || null
  )
}
