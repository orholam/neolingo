import assert from 'node:assert/strict'
import test from 'node:test'
import { seriesFromPracticeLog } from './brainPower.js'

const day = 24 * 60 * 60 * 1000

const dadjoSessions = [
  { at: 1792374271006, scoreBefore: 89, scoreAfter: 94 },
  { at: 1792374576150, scoreBefore: 94, scoreAfter: 100 },
  { at: 1792374902340, scoreBefore: 100, scoreAfter: 107 },
  { at: 1792446340123, scoreBefore: 100, scoreAfter: 105 },
  { at: 1792446620041, scoreBefore: 105, scoreAfter: 107 },
  { at: 1792548265275, scoreBefore: 98, scoreAfter: 104 },
  { at: 1792549315695, scoreBefore: 104, scoreAfter: 123 },
  { at: 1792629255219, scoreBefore: 113, scoreAfter: 118 },
  { at: 1792630380244, scoreBefore: 118, scoreAfter: 126 },
  { at: 1792772136078, scoreBefore: 110, scoreAfter: 117 },
]

test('a sitting with several sessions is one rise, not a stack of jumps', () => {
  const after = seriesFromPracticeLog(dadjoSessions, 117, dadjoSessions.at(-1).at + 5000)
  const firstSitting = after.filter((point) => point.recorded && point.at <= dadjoSessions[2].at)
  assert.deepEqual(
    firstSitting.map((point) => point.score),
    [89, 107]
  )
})

test('practice log keeps an earlier peak above today', () => {
  const after = seriesFromPracticeLog(dadjoSessions, 117, dadjoSessions.at(-1).at + 5000)
  assert.equal(Math.round(Math.max(...after.map((point) => point.score))), 126)
  assert.equal(Math.round(after.at(-1).score), 117)
  assert.equal(
    after.some((point) => point.recorded && point.score === 110),
    true
  )
  const jump = after.filter((point) => point.at === dadjoSessions.at(-1).at && point.recorded)
  assert.deepEqual(
    jump.map((point) => point.score),
    [110, 117]
  )
})

test('opening the app before practice still shows the old peak and the fade', () => {
  const prior = dadjoSessions.slice(0, -1)
  const openedAt = prior.at(-1).at + 2 * day
  const series = seriesFromPracticeLog(prior, 110, openedAt)
  assert.equal(Math.round(series.at(-1).score), 110)
  assert.equal(Math.round(Math.max(...series.map((point) => point.score))), 126)
  const peakAt = series.find((point) => point.score === 126).at
  const faded = series.filter((point) => point.at > peakAt)
  for (let i = 1; i < faded.length; i++) {
    assert.equal(faded[i].score <= faded[i - 1].score, true)
  }
})

test('sessions without saved scores do not invent a curve', () => {
  assert.equal(seriesFromPracticeLog([], 10, Date.now()), null)
  assert.equal(
    seriesFromPracticeLog([{ at: Date.now(), scoreBefore: null, scoreAfter: null }], 10, Date.now()),
    null
  )
})
