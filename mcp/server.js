import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createProgressServer } from './registerTools.js'

const server = createProgressServer()
const transport = new StdioServerTransport()
await server.connect(transport)
