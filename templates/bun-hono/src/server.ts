import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'

const app = new Hono()

// CORS middleware
app.use('*', cors())

// Serve static files from frontend build
app.use('/*', serveStatic({ 
  root: './frontend/dist',
  rewriteRequestPath: (path) => {
    // Serve index.html for all non-API routes
    if (!path.startsWith('/api') && !path.includes('.')) {
      return '/index.html'
    }
    return path
  }
}))

// API routes
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    message: '{{PROJECT_NAME}} is running!',
    stack: '{{STACK}}',
    runtime: 'Bun + Hono'
  })
})

// Catch-all for SPA routing
app.get('*', serveStatic({ 
  root: './frontend/dist',
  path: './index.html'
}))

const port = {{PORT}}

console.log(`🚀 {{PROJECT_NAME}} starting on port ${port}`)
console.log(`📊 Stack: {{STACK}}`)
console.log(`🌐 Open http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
