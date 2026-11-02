import { dadjoGrammarReference } from './dadjoGrammarReference'
import { koreanGrammarReference } from './koreanGrammarReference'

export const GRAMMAR_BY_COURSE = {
  dadjo: dadjoGrammarReference,
  korean: koreanGrammarReference,
}

export function listGrammarCourses() {
  return Object.keys(GRAMMAR_BY_COURSE)
}
