export const LANGUAGES = [
  {
    id: 'dadjo',
    code: 'dadjo',
    name: 'Dadjo',
    nativeName: 'Dar Daju Daju',
    region: 'Chad & Sudan',
    speakers: '~50,000 speakers',
    status: 'available',
    defaultEnabled: true,
    flag: '🐏',
    tagline: 'Nilo-Saharan language of the Daju people',
    description:
      'A Nilo-Saharan language of the Daju people — rich oral tradition, unique tonal structure, rarely documented.',
    cardAccent: 'from-amber-400 to-orange-500',
    cardTagLabel: 'AVAILABLE NOW',
    cardTagColor:
      'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
  },
  {
    id: 'sumerian',
    code: 'sumerian',
    name: 'Sumerian',
    nativeName: '𒅴𒂠',
    region: 'Ancient Mesopotamia',
    speakers: 'Extinct · 2000 BCE',
    status: 'available',
    defaultEnabled: true,
    flag: '🏺',
    tagline: "The world's oldest written language",
    description:
      "The world's oldest written language — cuneiform tablets, mythology, and the foundation of all writing.",
    cardAccent: 'from-violet-400 to-purple-500',
    cardTagLabel: 'AVAILABLE NOW',
    cardTagColor:
      'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
  },
  {
    id: 'more-coming',
    code: 'more-coming',
    name: 'More coming',
    nativeName: '...',
    region: 'Worldwide',
    speakers: 'In development',
    status: 'coming-soon',
    defaultEnabled: false,
    flag: '🗺️',
    tagline: 'Cornish, Aramaic, Elfdalian and others',
    description:
      'Cornish, Aramaic, Elfdalian and others are being researched and added to the platform.',
    cardAccent: 'from-gray-300 to-gray-400',
    cardTagLabel: 'COMING SOON',
    cardTagColor:
      'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
  },
]

export function getAllLanguages() {
  return LANGUAGES
}

export function getLanguageById(id) {
  return LANGUAGES.find((lang) => lang.id === id || lang.code === id) || null
}

export function getDefaultLanguagePlan() {
  return LANGUAGES.filter((lang) => lang.defaultEnabled).map((lang) => lang.id)
}

export function normalizeLanguagePlan(plan) {
  if (!Array.isArray(plan)) return getDefaultLanguagePlan()

  const validIds = new Set(LANGUAGES.map((lang) => lang.id))
  const seen = new Set()

  const normalized = []
  for (const id of plan) {
    if (typeof id !== 'string') continue
    if (!validIds.has(id)) continue
    if (seen.has(id)) continue
    seen.add(id)
    normalized.push(id)
  }

  return normalized.length > 0 ? normalized : getDefaultLanguagePlan()
}

