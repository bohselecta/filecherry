import React, { useEffect, useRef } from 'react'

interface AmbientSoundsProps {
  selectedSound: string
  onSoundChange: (sound: string) => void
  volume: number
  onVolumeChange: (volume: number) => void
  isEnabled: boolean
  onToggle: (enabled: boolean) => void
}

const AMBIENT_SOUNDS = [
  { id: 'ocean', name: 'Ocean Waves', emoji: '🌊' },
  { id: 'rain', name: 'Rain', emoji: '🌧️' },
  { id: 'forest', name: 'Forest', emoji: '🌲' },
  { id: 'white-noise', name: 'White Noise', emoji: '📻' },
  { id: 'none', name: 'None', emoji: '🔇' }
]

export const AmbientSounds: React.FC<AmbientSoundsProps> = ({
  selectedSound,
  onSoundChange,
  volume,
  onVolumeChange,
  isEnabled,
  onToggle
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (selectedSound !== 'none' && isEnabled) {
      // In a real app, you'd load actual audio files
      // For demo purposes, we'll simulate audio loading
      console.log(`Playing ambient sound: ${selectedSound} at volume ${volume}`)
    }
  }, [selectedSound, isEnabled, volume])

  const handleSoundSelect = (soundId: string) => {
    onSoundChange(soundId)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(parseFloat(e.target.value))
  }

  const handleToggle = () => {
    onToggle(!isEnabled)
  }

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-white/80 text-sm">Ambient Sounds</span>
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isEnabled ? 'bg-purple-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Sound Selection */}
      {isEnabled && (
        <div className="space-y-2">
          <label className="text-white/70 text-sm">Sound</label>
          <div className="grid grid-cols-2 gap-2">
            {AMBIENT_SOUNDS.map((sound) => (
              <button
                key={sound.id}
                onClick={() => handleSoundSelect(sound.id)}
                className={`p-3 rounded-lg border transition-all text-center ${
                  selectedSound === sound.id
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="text-lg mb-1">{sound.emoji}</div>
                <div className="text-xs text-white/80">{sound.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Volume Control */}
      {isEnabled && selectedSound !== 'none' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-white/70 text-sm">Volume</label>
            <span className="text-white/60 text-xs">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`
            }}
          />
        </div>
      )}

      {/* Audio Status */}
      {isEnabled && selectedSound !== 'none' && (
        <div className="flex items-center gap-2 text-xs text-white/60">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Playing {AMBIENT_SOUNDS.find(s => s.id === selectedSound)?.name}</span>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid white;
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid white;
        }
      `}</style>
    </div>
  )
}
