import React from 'react'

interface ProgressTrackerProps {
  totalSessions: number
  todaySessions: number
  totalMinutes: number
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  totalSessions,
  todaySessions,
  totalMinutes
}) => {
  const getStreakDays = () => {
    // In a real app, this would calculate actual streak from database
    return Math.min(totalSessions, 7)
  }

  const getMotivationalMessage = () => {
    if (totalSessions === 0) {
      return "Start your breathing journey today!"
    } else if (totalSessions < 5) {
      return "Great start! Keep building your practice."
    } else if (totalSessions < 20) {
      return "You're building a wonderful habit!"
    } else {
      return "Amazing dedication to your wellbeing!"
    }
  }

  const getNextMilestone = () => {
    const milestones = [5, 10, 25, 50, 100]
    const next = milestones.find(m => m > totalSessions)
    return next || null
  }

  const nextMilestone = getNextMilestone()
  const progressToNext = nextMilestone ? (totalSessions / nextMilestone) * 100 : 100

  return (
    <div className="space-y-4">
      {/* Motivational Message */}
      <div className="text-center p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20">
        <p className="text-sm text-white/90 font-medium">
          {getMotivationalMessage()}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 rounded-lg bg-white/5">
          <div className="text-2xl font-bold text-purple-400">{totalSessions}</div>
          <div className="text-xs text-white/60">Total Sessions</div>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-white/5">
          <div className="text-2xl font-bold text-blue-400">{todaySessions}</div>
          <div className="text-xs text-white/60">Today</div>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-white/5">
          <div className="text-2xl font-bold text-green-400">{totalMinutes}</div>
          <div className="text-xs text-white/60">Minutes</div>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-white/5">
          <div className="text-2xl font-bold text-orange-400">{getStreakDays()}</div>
          <div className="text-xs text-white/60">Day Streak</div>
        </div>
      </div>

      {/* Next Milestone */}
      {nextMilestone && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Next Milestone</span>
            <span className="text-white/60 text-xs">{totalSessions}/{nextMilestone}</span>
          </div>
          
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressToNext, 100)}%` }}
            />
          </div>
          
          <div className="text-center text-xs text-white/60">
            {nextMilestone - totalSessions} more sessions to go!
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="space-y-2">
        <span className="text-white/70 text-sm">Achievements</span>
        <div className="flex flex-wrap gap-2">
          {totalSessions >= 1 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-300 text-xs">
              <span>🏆</span>
              <span>First Session</span>
            </div>
          )}
          
          {totalSessions >= 5 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs">
              <span>⭐</span>
              <span>Getting Started</span>
            </div>
          )}
          
          {totalSessions >= 10 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs">
              <span>🎯</span>
              <span>Consistent</span>
            </div>
          )}
          
          {totalSessions >= 25 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs">
              <span>🔥</span>
              <span>Dedicated</span>
            </div>
          )}
          
          {totalSessions >= 50 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs">
              <span>💎</span>
              <span>Master</span>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
        <div className="text-white/70 text-sm font-medium mb-2">💡 Tip</div>
        <div className="text-xs text-white/60">
          {totalSessions < 5 
            ? "Try practicing at the same time each day to build a habit."
            : totalSessions < 20
            ? "Experiment with different breathing techniques to find what works best for you."
            : "Consider extending your sessions or trying advanced techniques like Wim Hof breathing."
          }
        </div>
      </div>
    </div>
  )
}
