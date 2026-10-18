import assert from 'node:assert/strict'
import test from 'node:test'
import { combinePractice, summarizePractice } from '../src/utils/practiceLog.js'

const now = Date.parse('2026-10-17T18:00:00')

test('past week counts reviews and new words without listing them', () => {
  const summary = summarizePractice(
    combinePractice(
      {
        Dadjo: [
          {
            id: 'review:1',
            at: now - 2 * 60 * 60 * 1000,
            day: '2026-10-17',
            kind: 'review',
            count: 8,
            scoreBefore: 90,
            scoreAfter: 94,
            source: 'session',
          },
        ],
      },
      {
        Dadjo: {
          'a::0': { firstLearnedAt: now - 2 * 24 * 60 * 60 * 1000, reviewCount: 0, longTermMemory: 1 },
          'b::1': {
            firstLearnedAt: now - 3 * 24 * 60 * 60 * 1000,
            lastReviewedAt: now - 24 * 60 * 60 * 1000,
            reviewCount: 2,
            longTermMemory: 2,
          },
        },
      },
      now,
    ),
    { now },
  )

  assert.equal(summary.recentSessions.length, 1)
  assert.equal(summary.recentSessions[0].brainDelta, 4)
  assert.equal(summary.recentSessions[0].count, 8)
  assert.equal(summary.recentSessions[0].word, undefined)
  const today = summary.pastWeek.find((day) => day.day === '2026-10-17')
  assert.equal(today.reviews, 8)
  assert.equal(today.brainDelta, 4)
  assert.equal(summary.pastWeek.some((day) => day.newWords > 0), true)
})
