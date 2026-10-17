import { loadDictionaries } from './dictionaries.js'
import { fetchLearningState } from './fetchState.js'
import { findLanguage } from './languages.js'
import { summarizeSnapshot } from './summarize.js'

export async function buildReport({ language, dueOnly = false, dueLimit, historyLimit } = {}) {
  const match = language ? findLanguage(language) : null
  if (language && !match) {
    const error = new Error(`Unknown language "${language}". Use dadjo, sumerian, korean, or french.`)
    error.code = 'unknown_language'
    throw error
  }

  const { snapshot, updatedAt } = await fetchLearningState()
  return summarizeSnapshot(snapshot, {
    updatedAt,
    dictionaries: loadDictionaries(),
    language: match,
    dueOnly,
    dueLimit,
    historyLimit,
  })
}
