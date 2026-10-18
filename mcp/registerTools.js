import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { buildReport } from './report.js'

function textResult(value) {
  return {
    content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
  }
}

function errorResult(error) {
  return {
    isError: true,
    content: [{ type: 'text', text: error.message || 'Failed to read learning progress.' }],
  }
}

export function createProgressServer() {
  const server = new McpServer({
    name: 'neolingo-progress',
    version: '1.0.0',
  })

  server.registerTool(
    'get_learning_summary',
    {
      title: 'Learning progress summary',
      description:
        'Read-only vocabulary progress for every NeoLingo language: brain score, a past-week practice log (counts and brain-score change, not word lists), recently learned words, latest reviews, and words due for review. Pass dadjo, sumerian, korean, or french to limit to one language.',
      inputSchema: {
        language: z
          .string()
          .optional()
          .describe('Optional language id or name: dadjo, sumerian, korean, or french.'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ language }) => {
      try {
        return textResult(await buildReport({ language }))
      } catch (error) {
        return errorResult(error)
      }
    },
  )

  server.registerTool(
    'get_due_words',
    {
      title: 'Words due for review',
      description:
        'Read-only list of NeoLingo words whose short-term memory has faded below 5 and are not marked permanent. Weakest words come first.',
      inputSchema: {
        language: z
          .string()
          .optional()
          .describe('Optional language id or name: dadjo, sumerian, korean, or french.'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(40)
          .optional()
          .describe('How many due words to return per language. Defaults to 8.'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ language, limit }) => {
      try {
        return textResult(await buildReport({ language, dueOnly: true, dueLimit: limit }))
      } catch (error) {
        return errorResult(error)
      }
    },
  )

  return server
}
