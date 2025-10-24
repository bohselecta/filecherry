import { useState } from 'react'
import { useCherries, useCherryOperations, useProjectSharing } from '../hooks/useDatabase'

interface Cherry {
  _id: string
  name: string
  description: string
  category: string
  stack: string
  size: string
  isRunning: boolean
  created: number
  lastRun?: number
}

export function CherryBowl() {
  const [newCherryName, setNewCherryName] = useState('')
  const [newCherryDesc, setNewCherryDesc] = useState('')
  const [newCherryCategory, setNewCherryCategory] = useState('productivity')
  const [newCherryStack, setNewCherryStack] = useState('go-gin')
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [selectedCherry, setSelectedCherry] = useState<Cherry | null>(null)

  const cherries = useCherries() as Cherry[]
  const { addCherry, deleteCherry, toggleCherryRunning } = useCherryOperations()
  const { shareProject } = useProjectSharing()

  const handleAddCherry = async () => {
    if (newCherryName.trim() && newCherryDesc.trim()) {
      await addCherry({
        name: newCherryName.trim(),
        description: newCherryDesc.trim(),
        category: newCherryCategory,
        stack: newCherryStack,
        size: estimateSize(newCherryStack)
      })
      setNewCherryName('')
      setNewCherryDesc('')
    }
  }

  const handleToggleRunning = async (id: string, isRunning: boolean) => {
    await toggleCherryRunning(id, !isRunning)
  }

  const handleDeleteCherry = async (id: string) => {
    await deleteCherry(id)
  }

  const handleShareCherry = (cherry: Cherry) => {
    setSelectedCherry(cherry)
    setShowShareDialog(true)
  }

  const handleShare = async () => {
    if (selectedCherry) {
      await shareProject(selectedCherry._id, {
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        public: true
      })
      setShowShareDialog(false)
      setSelectedCherry(null)
    }
  }

  const estimateSize = (stack: string) => {
    const sizes: { [key: string]: string } = {
      'go-gin': '8-18 MB',
      'go-fyne': '20-30 MB',
      'bun-hono': '50-100 MB',
      'rust-axum': '5-15 MB',
      'tauri-react': '6-14 MB',
      'static': '<2 MB'
    }
    return sizes[stack] || 'Unknown'
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-semibold text-white mb-4">
        🍒 Cherry Bowl
      </h3>
      
      {/* Add new cherry */}
      <div className="mb-6 p-4 bg-white/5 rounded-lg">
        <h4 className="text-white font-medium mb-3">Add Cherry to Bowl</h4>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            value={newCherryName}
            onChange={(e) => setNewCherryName(e.target.value)}
            placeholder="Cherry name"
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            type="text"
            value={newCherryDesc}
            onChange={(e) => setNewCherryDesc(e.target.value)}
            placeholder="Description"
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <select
            value={newCherryCategory}
            onChange={(e) => setNewCherryCategory(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="productivity">Productivity</option>
            <option value="creative">Creative</option>
            <option value="civic">Civic</option>
            <option value="business">Business</option>
            <option value="personal">Personal</option>
          </select>
          <select
            value={newCherryStack}
            onChange={(e) => setNewCherryStack(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="go-gin">Go + Gin</option>
            <option value="go-fyne">Go + Fyne</option>
            <option value="bun-hono">Bun + Hono</option>
            <option value="rust-axum">Rust + Axum</option>
            <option value="tauri-react">Tauri + React</option>
            <option value="static">Static HTML</option>
          </select>
        </div>
        <button
          onClick={handleAddCherry}
          disabled={!newCherryName.trim() || !newCherryDesc.trim()}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          Add Cherry
        </button>
      </div>

      {/* Cherry list */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {cherries.length === 0 ? (
          <p className="text-white/60 text-center py-4">
            No cherries in your bowl yet. Add one above! ✨
          </p>
        ) : (
          cherries
            .sort((a, b) => b.created - a.created) // Newest first
            .map((cherry) => (
              <div
                key={cherry._id}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-medium">{cherry.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      cherry.isRunning 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {cherry.isRunning ? 'Running' : 'Stopped'}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm mb-1">{cherry.description}</p>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span>{cherry.category}</span>
                    <span>•</span>
                    <span>{cherry.stack}</span>
                    <span>•</span>
                    <span>{cherry.size}</span>
                    <span>•</span>
                    <span>{formatTime(cherry.created)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleRunning(cherry._id, cherry.isRunning)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      cherry.isRunning
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {cherry.isRunning ? 'Stop' : 'Run'}
                  </button>
                  <button
                    onClick={() => handleShareCherry(cherry)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => handleDeleteCherry(cherry._id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Share Dialog */}
      {showShareDialog && selectedCherry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">
              Share Cherry: {selectedCherry.name}
            </h3>
            <p className="text-white/70 mb-4">
              Share this cherry with others using Fireproof's one-click sync. 
              They can import it directly into their cherry bowl.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Share with Fireproof Sync
              </button>
              <button
                onClick={() => setShowShareDialog(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex justify-between text-sm text-white/60">
          <span>Total: {cherries.length}</span>
          <span>Running: {cherries.filter(c => c.isRunning).length}</span>
          <span>Stopped: {cherries.filter(c => !c.isRunning).length}</span>
        </div>
      </div>
    </div>
  )
}
