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

// In-memory storage for demo (in production, use Fireproof or a database)
let sessions: Array<{
  id: string
  technique: string
  duration: number
  timestamp: number
}> = []

// API routes
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    message: 'Breathe Easy is running!',
    stack: 'Bun + Hono',
    runtime: 'Bun + Hono'
  })
})

// Breathing session endpoints
app.post('/api/sessions', async (c) => {
  try {
    const body = await c.req.json()
    const session = {
      id: crypto.randomUUID(),
      technique: body.technique,
      duration: body.duration,
      timestamp: body.timestamp || Date.now()
    }
    
    sessions.push(session)
    
    return c.json({
      success: true,
      session
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to save session'
    }, 500)
  }
})

app.get('/api/sessions/stats', (c) => {
  const totalSessions = sessions.length
  const totalMinutes = sessions.reduce((sum, session) => sum + session.duration, 0)
  
  // Calculate today's sessions
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todaySessions = sessions.filter(session => 
    new Date(session.timestamp) >= today
  ).length
  
  // Calculate streak (simplified)
  const streakDays = Math.min(totalSessions, 7)
  
  return c.json({
    totalSessions,
    todaySessions,
    totalMinutes: Math.floor(totalMinutes / 60),
    streakDays,
    sessions: sessions.slice(-10) // Last 10 sessions
  })
})

app.get('/api/sessions', (c) => {
  const limit = parseInt(c.req.query('limit') || '20')
  const offset = parseInt(c.req.query('offset') || '0')
  
  const paginatedSessions = sessions
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(offset, offset + limit)
  
  return c.json({
    sessions: paginatedSessions,
    total: sessions.length,
    hasMore: offset + limit < sessions.length
  })
})

// Catch-all for SPA routing
app.get('*', serveStatic({ 
  root: './frontend/dist',
  path: './index.html'
}))

const port = 3000

console.log(`🚀 Breathe Easy starting on port ${port}`)
console.log(`📊 Stack: Bun + Hono`)
console.log(`🌐 Open http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
