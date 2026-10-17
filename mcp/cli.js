import { buildReport } from './report.js'

const args = process.argv.slice(2)
const dueOnly = args.includes('--due')
const langFlag = args.indexOf('--language')
const language = langFlag >= 0 ? args[langFlag + 1] : undefined

try {
  const report = await buildReport({ language, dueOnly })
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
} catch (error) {
  process.stderr.write(`${error.message || error}\n`)
  process.exitCode = 1
}
