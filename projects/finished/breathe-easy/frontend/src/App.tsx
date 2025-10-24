import { useState, useEffect, useRef } from 'react'
import { useDatabaseStatus } from './hooks/useDatabase'
import { BreathingCircle } from './components/BreathingCircle'
import { TechniqueSelector } from './components/TechniqueSelector'
import { ProgressTracker } from './components/ProgressTracker'
import { AmbientSounds } from './components/AmbientSounds'
import './App.css'

interface HealthResponse {
  status: string
  message: string
  stack: string
}

interface BreathingTechnique {
  id: string
  name: string
  description: string
  pattern: number[] // [inhale, hold, exhale, hold] in seconds
  color: string
}

const BREATHING_TECHNIQUES: BreathingTechnique[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Equal timing for all phases',
    pattern: [4, 4, 4, 4],
    color: '#667eea'
  },
  {
    id: '478',
    name: '4-7-8 Technique',
    description: 'Calming technique for anxiety',
    pattern: [4, 7, 8, 0],
    color: '#63b3ed'
  },
  {
    id: 'wimhof',
    name: 'Wim Hof Method',
    description: 'Power breathing for energy',
    pattern: [2, 0, 2, 0],
    color: '#48bb78'
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Set your own pattern',
    pattern: [3, 3, 3, 3],
    color: '#ed8936'
  }
]

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Breathing state
  const [isActive, setIsActive] = useState(false)
  const [currentTechnique, setCurrentTechnique] = useState(BREATHING_TECHNIQUES[0])
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale')
  const [phaseProgress, setPhaseProgress] = useState(0)
  const [sessionDuration, setSessionDuration] = useState(0)
  const [totalSessions, setTotalSessions] = useState(0)
  
  // Audio state
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [selectedSound, setSelectedSound] = useState('ocean')
  const [volume, setVolume] = useState(0.3)
  
  const dbStatus = useDatabaseStatus()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

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
    loadSessionStats()
  }, [])

  useEffect(() => {
    if (isActive) {
      startBreathingCycle()
    } else {
      stopBreathingCycle()
    }
    
    return () => stopBreathingCycle()
  }, [isActive, currentTechnique])

  useEffect(() => {
    if (isActive && sessionDuration > 0) {
      const timer = setInterval(() => {
        setSessionDuration(prev => prev + 1)
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [isActive, sessionDuration])

  const loadSessionStats = async () => {
    try {
      const response = await fetch('/api/sessions/stats')
      if (response.ok) {
        const stats = await response.json()
        setTotalSessions(stats.totalSessions || 0)
      }
    } catch (error) {
      console.error('Failed to load session stats:', error)
    }
  }

  const startBreathingCycle = () => {
    let phaseIndex = 0
    let phaseTime = 0
    const phases: ('inhale' | 'hold' | 'exhale' | 'pause')[] = ['inhale', 'hold', 'exhale', 'pause']
    
    const cycle = () => {
      const phaseDuration = currentTechnique.pattern[phaseIndex] * 10 // Convert to 100ms intervals
      
      if (phaseTime >= phaseDuration) {
        phaseIndex = (phaseIndex + 1) % phases.length
        phaseTime = 0
        setCurrentPhase(phases[phaseIndex])
      }
      
      setPhaseProgress((phaseTime / phaseDuration) * 100)
      phaseTime++
    }
    
    intervalRef.current = setInterval(cycle, 100)
  }

  const stopBreathingCycle = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setPhaseProgress(0)
    setCurrentPhase('inhale')
  }

  const toggleBreathing = () => {
    if (isActive) {
      setIsActive(false)
      setSessionDuration(0)
      saveSession()
    } else {
      setIsActive(true)
      setSessionDuration(0)
    }
  }

  const saveSession = async () => {
    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technique: currentTechnique.id,
          duration: sessionDuration,
          timestamp: Date.now()
        })
      })
      loadSessionStats()
    } catch (error) {
      console.error('Failed to save session:', error)
    }
  }

  const resetSession = () => {
    setIsActive(false)
    setSessionDuration(0)
    setPhaseProgress(0)
    setCurrentPhase('inhale')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
            <span className="text-4xl">🫁</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-2">
            Breathe Easy
          </h1>
          <p className="text-xl text-purple-200">
            Guided breathing exercises for calm and focus
          </p>
        </header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          
          {/* Left Column - Breathing Circle */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="text-center">
                <BreathingCircle 
                  phase={currentPhase}
                  progress={phaseProgress}
                  technique={currentTechnique}
                  isActive={isActive}
                />
                
                <div className="mt-8">
                  <h2 className="text-2xl font-semibold text-white mb-2">
                    {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}...
                  </h2>
                  <p className="text-purple-200 mb-6">
                    {currentTechnique.description}
                  </p>
                  
                  <div className="flex justify-center gap-4 mb-6">
                    <button
                      onClick={toggleBreathing}
                      className={`px-8 py-4 rounded-full font-bold text-lg transition-all ${
                        isActive 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {isActive ? '⏸️ Pause' : '▶️ Start'}
                    </button>
                    
                    {isActive && (
                      <button
                        onClick={resetSession}
                        className="px-6 py-4 rounded-full font-bold text-lg bg-gray-600 hover:bg-gray-700 text-white transition-all"
                      >
                        🔄 Reset
                      </button>
                    )}
                  </div>
                  
                  <div className="text-center text-white/80">
                    <div className="text-3xl font-bold mb-2">
                      {formatTime(sessionDuration)}
                    </div>
                    <div className="text-sm">Session Duration</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Controls */}
          <div className="space-y-6">
            
            {/* Technique Selector */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Breathing Techniques</h3>
              <TechniqueSelector
                techniques={BREATHING_TECHNIQUES}
                selected={currentTechnique}
                onSelect={setCurrentTechnique}
                disabled={isActive}
              />
            </div>

            {/* Ambient Sounds */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Ambient Sounds</h3>
              <AmbientSounds
                selectedSound={selectedSound}
                onSoundChange={setSelectedSound}
                volume={volume}
                onVolumeChange={setVolume}
                isEnabled={isAudioEnabled}
                onToggle={setIsAudioEnabled}
              />
            </div>

            {/* Progress Stats */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Your Progress</h3>
              <ProgressTracker
                totalSessions={totalSessions}
                todaySessions={1} // This would come from API
                totalMinutes={Math.floor(sessionDuration / 60)}
              />
            </div>

            {/* System Status */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
              
              {loading && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span className="ml-3 text-white text-sm">Checking...</span>
                </div>
              )}

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-200 text-sm">⚠️ {error}</p>
                </div>
              )}

              {health && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-200 text-sm">Backend Connected</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${dbStatus.connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                    <span className={`text-sm ${dbStatus.connected ? 'text-green-200' : 'text-red-200'}`}>
                      {dbStatus.connected ? 'Database Connected' : 'Database Disconnected'}
                    </span>
                  </div>
                  
                  <div className="text-xs text-white/60 mt-2">
                    <div>Stack: {health.stack}</div>
                    <div>Documents: {dbStatus.documents}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">
              ✨ Features
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-white/80">
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibold mb-2">Guided Breathing</h3>
                <p className="text-sm">Multiple techniques with visual guidance</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🎵</div>
                <h3 className="font-semibold mb-2">Ambient Sounds</h3>
                <p className="text-sm">Calming audio to enhance your practice</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold mb-2">Progress Tracking</h3>
                <p className="text-sm">Track your sessions and build habits</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-white/60">
          <p>Built with ❤️ using TinyApp Factory • Bun + Hono + Fireproof</p>
        </footer>
      </div>
    </div>
  )
}

export default App