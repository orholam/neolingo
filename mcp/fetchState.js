import { createClient } from '@supabase/supabase-js'
import postgres from 'postgres'
import { snapshotFromRow } from '../src/lib/learningState.js'

const STATE_COLUMNS = `user_id, language_progress, language_mastered_words, language_word_memory, flashcard_sessions, practice_log, language_streak, language_gems, language_hearts, language_plan, selected_course, updated_at`

async function fetchFromDatabase() {
  const userId = process.env.NEOLINGO_USER_ID
  if (!userId) {
    throw new Error('Set NEOLINGO_USER_ID to the learner this server should read.')
  }
  const sql = postgres(process.env.NEOLINGO_MCP_DATABASE_URL, {
    ssl: 'require',
    max: 1,
    idle_timeout: 5,
    connect_timeout: 10,
  })
  try {
    const rows = await sql.unsafe(
      `select ${STATE_COLUMNS} from public.user_learning_state where user_id = $1 limit 1`,
      [userId],
    )
    if (!rows.length) {
      throw new Error('No learning progress is synced yet. Sign in and practice once so the snapshot uploads.')
    }
    return { snapshot: snapshotFromRow(rows[0]), updatedAt: rows[0].updated_at }
  } finally {
    await sql.end({ timeout: 2 })
  }
}

export function credentialProblem() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) return 'Set VITE_SUPABASE_URL in .env.'
  if (!key) {
    return 'Set SUPABASE_SECRET_KEY in .env to the project secret key (Supabase dashboard → Project Settings → API). The publishable key cannot read user_learning_state because of row level security. Restart the neolingo-progress MCP after saving it.'
  }
  return null
}

export async function fetchLearningState() {
  if (process.env.NEOLINGO_MCP_DATABASE_URL) return fetchFromDatabase()

  const problem = credentialProblem()
  if (problem) {
    const error = new Error(problem)
    error.code = 'missing_credentials'
    throw error
  }

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  let query = supabase
    .from('user_learning_state')
    .select(
      'user_id, language_progress, language_mastered_words, language_word_memory, flashcard_sessions, practice_log, language_streak, language_gems, language_hearts, language_plan, selected_course, updated_at',
    )
    .order('updated_at', { ascending: false })
    .limit(2)

  if (process.env.NEOLINGO_USER_ID) {
    query = query.eq('user_id', process.env.NEOLINGO_USER_ID)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) {
    throw new Error('No learning progress is synced yet. Sign in and practice once so the snapshot uploads.')
  }
  if (data.length > 1 && !process.env.NEOLINGO_USER_ID) {
    throw new Error('More than one learner is stored. Set NEOLINGO_USER_ID in .env to the user you want.')
  }

  const row = data[0]
  return {
    snapshot: snapshotFromRow(row),
    updatedAt: row.updated_at,
  }
}
