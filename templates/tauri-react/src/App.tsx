import React, { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { useDatabaseStatus, useTodoOperations } from './hooks/useDatabase'
import { TodoList } from './components/TodoList'
import './App.css'

interface HealthResponse {
  status: string
  message: string
  stack: string
  platform?: string
  arch?: string
  time: string
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTodoDemo, setShowTodoDemo] = useState(false)

  const dbStatus = useDatabaseStatus()
  const { addTodo } = useTodoOperations()

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setLoading(true)
        const appInfo = await invoke('get_app_info')
        const systemInfo = await invoke('get_system_info')
        
        setHealth({
          status: 'ok',
          message: 'Tauri + React backend is healthy!',
          stack: 'Tauri + React',
          platform: (systemInfo as any).os,
          arch: (systemInfo as any).arch,
          time: (systemInfo as any).time
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    checkHealth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading {{PROJECT_NAME}}...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-red-200">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-8 flex flex-col items-center">
      <header className="w-full max-w-4xl text-center mb-12">
        <h1 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
          {{PROJECT_NAME}}
        </h1>
        <p className="text-xl text-purple-200">
          Your tiny, portable desktop app, ready to build!
        </p>
      </header>

      <main className="w-full max-w-4xl">
        {/* Health Check Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">
            🖥️ Desktop App Status
          </h2>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${health?.status === 'ok' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className={`font-medium ${health?.status === 'ok' ? 'text-green-200' : 'text-red-200'}`}>
                {health?.status === 'ok' ? 'App Running' : 'App Error'}
              </span>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/60">Platform:</span>
                  <span className="text-white ml-2">{health?.platform}</span>
                </div>
                <div>
                  <span className="text-white/60">Architecture:</span>
                  <span className="text-white ml-2">{health?.arch}</span>
                </div>
                <div>
                  <span className="text-white/60">Stack:</span>
                  <span className="text-white ml-2">{health?.stack}</span>
                </div>
                <div>
                  <span className="text-white/60">Time:</span>
                  <span className="text-white ml-2">{health?.time}</span>
                </div>
              </div>
            </div>

            <p className="text-purple-200 text-lg">{health?.message}</p>
          </div>
        </div>

        {/* Database Status Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">
            🍒 Fireproof Database
          </h2>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${dbStatus.connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className={`font-medium ${dbStatus.connected ? 'text-green-200' : 'text-red-200'}`}>
                {dbStatus.connected ? 'Database Connected' : 'Database Disconnected'}
              </span>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/60">Documents:</span>
                  <span className="text-white ml-2">{dbStatus.documents}</span>
                </div>
                <div>
                  <span className="text-white/60">Size:</span>
                  <span className="text-white ml-2">{dbStatus.size} bytes</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowTodoDemo(!showTodoDemo)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                {showTodoDemo ? 'Hide' : 'Show'} Todo Demo
              </button>
              <button
                onClick={() => addTodo('Sample todo from desktop app!')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Add Sample Data
              </button>
            </div>
          </div>
        </div>

        {/* Todo Demo */}
        {showTodoDemo && (
          <div className="mb-8">
            <TodoList />
          </div>
        )}

        {/* Next Steps Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">
            🎯 Next Steps
          </h2>
          <div className="space-y-4 text-purple-200">
            <div className="flex items-start space-x-3">
              <span className="text-purple-400 font-bold">1.</span>
              <p>Customize the UI in <code className="bg-white/10 px-2 py-1 rounded">src/App.tsx</code></p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-purple-400 font-bold">2.</span>
              <p>Add Tauri commands in <code className="bg-white/10 px-2 py-1 rounded">src-tauri/src/main.rs</code></p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-purple-400 font-bold">3.</span>
              <p>Use Fireproof for local data storage</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-purple-400 font-bold">4.</span>
              <p>Build with <code className="bg-white/10 px-2 py-1 rounded">npm run tauri:build</code></p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-purple-400 font-bold">5.</span>
              <p>Distribute your desktop cherry! 🍒</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App