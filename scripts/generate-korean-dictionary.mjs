/**
 * generate-korean-dictionary.mjs
 *
 * Builds src/data/koreanDictionary.jsonl (1000 beginner words) with short
 * English glosses suitable for flashcards.
 *
 * Requires: pip install datasets hangul-romanize deep-translator
 * Usage:    node scripts/generate-korean-dictionary.mjs
 */

import { execSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const script = resolve(__dirname, 'generate-korean-dictionary.py')

execSync(`python3 ${JSON.stringify(script)}`, { stdio: 'inherit' })
