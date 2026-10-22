import assert from 'node:assert/strict'
import test from 'node:test'
import {
  computeShortTermMemory,
  pickReviewWordIds,
  reviewSelectionWeight,
  todayKey,
} from './wordMemory.js'

const now = Date.parse('2026-10-20T22:00:00')
const day = 24 * 60 * 60 * 1000

test('review weight squares the gap below 11', () => {
  assert.equal(reviewSelectionWeight(1), 100)
  assert.equal(reviewSelectionWeight(5), 36)
  assert.equal(reviewSelectionWeight(8), 9)
  assert.equal(reviewSelectionWeight(10), 1)
})

test('review draw skips permanent words and words already reviewed today', () => {
  const today = todayKey(new Date(now))
  const ids = pickReviewWordIds(
    ['faded', 'reviewed-today', 'permanent', 'learned-today', 'unknown'],
    {
      faded: { longTermMemory: 1, lastReviewedAt: now - 10 * day, lastOccasionDate: '2026-10-10' },
      'reviewed-today': { longTermMemory: 1, lastReviewedAt: now - 10 * day, lastOccasionDate: today },
      permanent: { longTermMemory: 10, lastReviewedAt: now - 30 * day, lastOccasionDate: '2026-09-01' },
      'learned-today': { longTermMemory: 1, lastReviewedAt: now, lastOccasionDate: today },
    },
    20,
    { now }
  )
  assert.deepEqual(ids, ['faded', 'unknown'])
})

test('a short due pool is the whole session', () => {
  const ids = pickReviewWordIds(
    ['a', 'b'],
    {
      a: { longTermMemory: 2, lastReviewedAt: now - 3 * day, lastOccasionDate: '2026-10-17' },
      b: { longTermMemory: 4, lastReviewedAt: now - 2 * day, lastOccasionDate: '2026-10-18' },
    },
    20,
    { now }
  )
  assert.deepEqual(ids, ['a', 'b'])
})

test('weighted draws prefer lower short-term memory', () => {
  const memory = {
    fresh: { longTermMemory: 9, lastReviewedAt: now - 0.1 * day, lastOccasionDate: '2026-10-19' },
    faded: { longTermMemory: 1, lastReviewedAt: now - 10 * day, lastOccasionDate: '2026-10-10' },
    unknown: null,
  }
  const weights = {
    fresh: reviewSelectionWeight(computeShortTermMemory(memory.fresh, now)),
    faded: reviewSelectionWeight(computeShortTermMemory(memory.faded, now)),
    unknown: reviewSelectionWeight(computeShortTermMemory(memory.unknown, now)),
  }
  const total = weights.fresh + weights.faded + weights.unknown
  const order = ['fresh', 'faded', 'unknown']

  const pick = (roll) => pickReviewWordIds(order, memory, 1, { now, random: () => roll })

  assert.deepEqual(pick(0.001), ['fresh'])
  assert.deepEqual(pick((weights.fresh + weights.faded / 2) / total), ['faded'])
  assert.deepEqual(pick((weights.fresh + weights.faded + weights.unknown / 2) / total), ['unknown'])
  assert.ok(weights.unknown > weights.faded)
  assert.ok(weights.faded > weights.fresh * 10)
})
