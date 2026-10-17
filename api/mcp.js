import { timingSafeEqual } from 'node:crypto'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { createProgressServer } from '../mcp/registerTools.js'

function bearer(request) {
  const header = request.headers.authorization || ''
  return header.startsWith('Bearer ') ? header.slice('Bearer '.length) : ''
}

function tokenMatches(request) {
  const expected = process.env.MCP_ACCESS_TOKEN
  if (!expected) return false
  const got = Buffer.from(bearer(request))
  const want = Buffer.from(expected)
  if (got.length !== want.length) return false
  return timingSafeEqual(got, want)
}

export default async function handler(request, response) {
  if (!process.env.MCP_ACCESS_TOKEN || !process.env.NEOLINGO_MCP_DATABASE_URL) {
    response.status(503).json({ error: 'mcp_not_configured' })
    return
  }
  if (!tokenMatches(request)) {
    response.status(401).json({ error: 'unauthorized' })
    return
  }

  const server = createProgressServer()
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  })
  response.on('close', () => {
    transport.close().catch(() => {})
    server.close().catch(() => {})
  })
  try {
    await server.connect(transport)
    await transport.handleRequest(request, response)
  } catch (error) {
    console.error('mcp request failed', error)
    if (!response.headersSent) {
      response.status(500).json({ error: 'mcp_failed' })
    }
  }
}
