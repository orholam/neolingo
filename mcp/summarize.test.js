import assert from 'node:assert/strict'
import test from 'node:test'
import { summarizeSnapshot } from './summarize.js'

const now = Date.parse('2026-10-17T18:00:00')

const dictionaries = {
  Dadjo: [{ headword: 'watiri', senses: ['car'] }, { headword: 'biling', senses: ['house'] }],
}

test('reports brain score and vocabulary history, not lessons', () => {
  const learnedAt = now - 2 * 24 * 60 * 60 * 1000
  const reviewedAt = now - 60 * 60 * 1000
  const summary = summarizeSnapshot(
    {
      selected_course: 'dadjo',
      language_plan: ['dadjo'],
      language_progress: {
        totalXP: 80,
        completedLessons: [1],
        mistakes: [{ lessonId: 1 }],
      },
      language_mastered_words: { Dadjo: ['watiri::0', 'biling::1'] },
      language_word_memory: {
        Dadjo: {
          'watiri::0': {
            longTermMemory: 2,
            firstLearnedAt: learnedAt,
            lastReviewedAt: reviewedAt,
            reviewCount: 3,
          },
          'biling::1': {
            longTermMemory: 1,
            firstLearnedAt: learnedAt - 1000,
            lastReviewedAt: learnedAt - 1000,
            reviewCount: 0,
          },
        },
      },
      flashcard_sessions: {
        Dadjo: [
          {
            id: 's1',
            createdAt: learnedAt,
            wordIndices: [0, 1],
            history: [{ struggling: 0, inProgress: 0, mastered: 2 }],
            passes: 6,
          },
        ],
      },
    },
    { now, dictionaries },
  )

  assert.equal(summary.completedLessons, undefined)
  assert.equal(summary.xp, undefined)
  assert.equal(summary.languages[0].name, 'Dadjo')
  assert.equal(summary.languages[0].brainScore > 0, true)
  assert.equal(summary.brainScore, summary.languages[0].brainScore)
  assert.equal(summary.languages[0].newWords[0].word, 'watiri')
  assert.equal(summary.languages[0].newWords[0].gloss, 'car')
  assert.equal(summary.languages[0].reviews[0].word, 'watiri')
  assert.equal(summary.languages[0].reviews[0].reviewCount, 3)
  assert.equal(summary.languages[0].newWordSessions[0].wordCount, 2)
  assert.equal(summary.languages[0].newWordSessions[0].words[0], 'watiri')
  assert.equal(summary.languages[0].newWordSessions[0].masteredPercent, 100)
  assert.equal(summary.languages[0].brainScoreRecent.at(-1).score, summary.languages[0].brainScore)
})

test('due-only report lists faded words', () => {
  const report = summarizeSnapshot(
    {
      language_plan: ['dadjo'],
      language_mastered_words: { Dadjo: ['watiri::0'] },
      language_word_memory: {
        Dadjo: {
          'watiri::0': {
            longTermMemory: 1,
            lastReviewedAt: now - 20 * 24 * 60 * 60 * 1000,
            reviewCount: 1,
          },
        },
      },
      flashcard_sessions: {},
    },
    { now, dictionaries, dueOnly: true },
  )
  assert.equal(report.languages[0].dueCount, 1)
  assert.equal(report.languages[0].due[0].word, 'watiri')
  assert.equal(report.brainScore, undefined)
})
