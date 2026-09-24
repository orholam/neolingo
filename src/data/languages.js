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
    tagline: 'A living language with almost no textbooks',
    description:
      'Spoken by ~50,000 people across Chad and Sudan, Dadjo is a tonal Nilo-Saharan language with rich oral poetry, yet almost none of it exists in print. You are learning a tongue that dictionaries are still being built for.',
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
    tagline: 'Readable after 4,000 years of silence',
    description:
      'Sumerian is a language isolate, related to nothing living, yet we can still read Gilgamesh in the original cuneiform. It invented writing itself, and words like “beer” and “freedom” first appear on its clay tablets.',
    cardAccent: 'from-violet-400 to-purple-500',
    cardTagLabel: 'AVAILABLE NOW',
    cardTagColor:
      'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
  },
  {
    id: 'korean',
    code: 'korean',
    name: 'Korean',
    nativeName: '한국어',
    region: 'Korea',
    speakers: '~80 million speakers',
    status: 'available',
    defaultEnabled: true,
    flag: '🇰🇷',
    tagline: 'The script with a known inventor',
    description:
      'Hangul is the only widely used writing system whose creator, date, and design goals are fully documented. King Sejong published it in 1443 so that “even a fool could learn it in ten days.”',
    cardAccent: 'from-red-400 to-rose-500',
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
    tagline: 'Languages on the edge of forgetting',
    description:
      'Cornish was extinct and came back. Aramaic was Jesus’s everyday language. Elfdalian has fewer than 3,000 speakers. We are building courses for tongues the world is at risk of losing.',
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

