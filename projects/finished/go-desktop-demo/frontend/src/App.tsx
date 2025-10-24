import { useState, useEffect } from 'react'
import { useDatabaseStatus, useCherryOperations } from './hooks/useDatabase'
import { CherryBowl } from './components/CherryBowl'
import './App.css'

interface HealthResponse {
  status: string
  message: string
  stack: string
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCherryBowl, setShowCherryBowl] = useState(false)
  
  const dbStatus = useDatabaseStatus()
  const { addCherry } = useCherryOperations()

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health')
        if (response.ok) {
          const data = await response.json()
          setHealth(data)
        } else {
          setError('Failed to connect to backend')
        }
      } catch (err) {
        setError('Backend not available')
      } finally {
        setLoading(false)
      }
    }

    checkHealth()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🍒 FileCherry Desktop
          </h1>
          <p className="text-xl text-purple-200">
            Cherry Bowl & Project Manager • Built with Go + Gin • TinyApp Factory
          </p>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Health Check Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">
              🚀 System Status
            </h2>
            
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <span className="ml-3 text-white">Checking backend...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-200">⚠️ {error}</p>
                <p className="text-red-300 text-sm mt-2">
                  Make sure the backend is running on port 3000
                </p>
              </div>
            )}

            {health && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-200 font-medium">
                    Backend Connected
                  </span>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/80">
                    <strong>Status:</strong> {health.status}
                  </p>
                  <p className="text-white/80">
                    <strong>Message:</strong> {health.message}
                  </p>
                  <p className="text-white/80">
                    <strong>Stack:</strong> {health.stack}
                  </p>
                </div>
              </div>
            )}
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
                  onClick={() => setShowCherryBowl(!showCherryBowl)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  {showCherryBowl ? 'Hide' : 'Show'} Cherry Bowl
                </button>
                <button
                  onClick={() => addCherry({
                    name: 'Sample Cherry',
                    description: 'A sample cherry for testing',
                    category: 'productivity',
                    stack: 'go-gin',
                    size: '12 MB'
                  })}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Add Sample Cherry
                </button>
              </div>
            </div>
          </div>

          {/* Cherry Bowl Demo */}
          {showCherryBowl && (
            <div className="mb-8">
              <CherryBowl />
            </div>
          )}

          {/* Next Steps Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">
              🎯 Next Steps
            </h2>
            <div className="space-y-4 text-white/80">
              <div className="flex items-start space-x-3">
                <span className="text-purple-400 font-bold">1.</span>
                <p>Customize this UI in <code className="bg-white/10 px-2 py-1 rounded">frontend/src/App.tsx</code></p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-purple-400 font-bold">2.</span>
                <p>Add API endpoints in <code className="bg-white/10 px-2 py-1 rounded">main.go</code></p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-purple-400 font-bold">3.</span>
                <p>Build for production with <code className="bg-white/10 px-2 py-1 rounded">go build -ldflags="-s -w"</code></p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-purple-400 font-bold">4.</span>
                <p>Deploy your single binary anywhere!</p>
              </div>
            </div>
          </div>

          {/* Developer Tools Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mt-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">
              🛠️ Developer Tools
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={() => window.open('http://localhost:3000', '_blank')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Open Backend API
                </button>
                <button
                  onClick={() => {
                    const dbInfo = {
                      name: 'go-desktop-demo',
                      documents: dbStatus.documents,
                      size: dbStatus.size,
                      lastModified: Date.now()
                    }
                    console.log('Database Info:', dbInfo)
                    alert('Database info logged to console')
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Log DB Info
                </button>
              </div>
              <div className="text-sm text-white/60">
                <p>• Backend API: <code className="bg-white/10 px-2 py-1 rounded">http://localhost:3000</code></p>
                <p>• Database: Fireproof with live queries</p>
                <p>• Hot Reload: Enabled for development</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-white/60">
          <p>Built with ❤️ using TinyApp Factory</p>
        </footer>
      </div>
    </div>
  )
}

export default App
