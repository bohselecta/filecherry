import React from 'react'

interface BreathingTechnique {
  id: string
  name: string
  description: string
  pattern: number[]
  color: string
}

interface TechniqueSelectorProps {
  techniques: BreathingTechnique[]
  selected: BreathingTechnique
  onSelect: (technique: BreathingTechnique) => void
  disabled?: boolean
}

export const TechniqueSelector: React.FC<TechniqueSelectorProps> = ({
  techniques,
  selected,
  onSelect,
  disabled = false
}) => {
  const getPatternText = (pattern: number[]) => {
    const [inhale, hold, exhale, pause] = pattern
    let text = `${inhale}s in`
    if (hold > 0) text += `, ${hold}s hold`
    text += `, ${exhale}s out`
    if (pause > 0) text += `, ${pause}s rest`
    return text
  }

  return (
    <div className="space-y-3">
      {techniques.map((technique) => (
        <button
          key={technique.id}
          onClick={() => !disabled && onSelect(technique)}
          disabled={disabled}
          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
            selected.id === technique.id
              ? 'border-purple-500 bg-purple-500/20'
              : 'border-white/20 bg-white/5 hover:bg-white/10'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: technique.color }}
                />
                <h4 className="font-semibold text-white">
                  {technique.name}
                </h4>
              </div>
              <p className="text-sm text-white/70 mb-2">
                {technique.description}
              </p>
              <div className="text-xs text-white/50">
                {getPatternText(technique.pattern)}
              </div>
            </div>
            
            {selected.id === technique.id && (
              <div className="text-purple-400 text-xl">
                ✓
              </div>
            )}
          </div>
        </button>
      ))}
      
      {disabled && (
        <div className="text-xs text-white/50 text-center mt-2">
          Stop the current session to change technique
        </div>
      )}
    </div>
  )
}
