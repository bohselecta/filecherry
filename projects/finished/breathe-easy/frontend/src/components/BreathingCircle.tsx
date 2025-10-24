import React from 'react'

interface BreathingCircleProps {
  phase: 'inhale' | 'hold' | 'exhale' | 'pause'
  progress: number
  technique: {
    id: string
    name: string
    pattern: number[]
    color: string
  }
  isActive: boolean
}

export const BreathingCircle: React.FC<BreathingCircleProps> = ({
  phase,
  progress,
  technique,
  isActive
}) => {
  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale':
        return '#63b3ed' // Blue
      case 'hold':
        return '#f6ad55' // Orange
      case 'exhale':
        return '#48bb78' // Green
      case 'pause':
        return '#a0aec0' // Gray
      default:
        return technique.color
    }
  }

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In'
      case 'hold':
        return 'Hold'
      case 'exhale':
        return 'Breathe Out'
      case 'pause':
        return 'Rest'
      default:
        return 'Ready'
    }
  }

  const getPhaseEmoji = () => {
    switch (phase) {
      case 'inhale':
        return '⬆️'
      case 'hold':
        return '⏸️'
      case 'exhale':
        return '⬇️'
      case 'pause':
        return '😌'
      default:
        return '🫁'
    }
  }

  // Calculate circle size based on phase and progress
  const getCircleSize = () => {
    if (!isActive) return 120
    
    const baseSize = 120
    const maxExpansion = 80
    
    switch (phase) {
      case 'inhale':
        return baseSize + (maxExpansion * (progress / 100))
      case 'hold':
        return baseSize + maxExpansion
      case 'exhale':
        return baseSize + (maxExpansion * (1 - progress / 100))
      case 'pause':
        return baseSize
      default:
        return baseSize
    }
  }

  const circleSize = getCircleSize()
  const strokeWidth = 8
  const radius = (circleSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative flex items-center justify-center">
      {/* Background Circle */}
      <div 
        className="absolute rounded-full border-4 border-white/20 transition-all duration-300 ease-in-out"
        style={{
          width: circleSize,
          height: circleSize,
          backgroundColor: 'rgba(255, 255, 255, 0.05)'
        }}
      />
      
      {/* Progress Circle */}
      <svg
        className="absolute transform -rotate-90 transition-all duration-100 ease-out"
        width={circleSize}
        height={circleSize}
      >
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          stroke={getPhaseColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-100 ease-out"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))'
          }}
        />
      </svg>
      
      {/* Center Content */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <div className="text-4xl mb-2 animate-pulse">
          {getPhaseEmoji()}
        </div>
        <div 
          className="text-xl font-bold mb-1 transition-colors duration-300"
          style={{ color: getPhaseColor() }}
        >
          {getPhaseText()}
        </div>
        <div className="text-sm text-white/60">
          {Math.round(progress)}%
        </div>
        {!isActive && (
          <div className="text-xs text-white/40 mt-2">
            Click Start to begin
          </div>
        )}
      </div>
      
      {/* Pulse Effect */}
      {isActive && (
        <div 
          className="absolute rounded-full animate-ping opacity-20"
          style={{
            width: circleSize + 20,
            height: circleSize + 20,
            backgroundColor: getPhaseColor(),
            top: -10,
            left: -10
          }}
        />
      )}
    </div>
  )
}
