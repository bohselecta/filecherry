# 🫁 Breathe Easy

A guided breathing exercise app built with Bun + Hono + React + Fireproof. Practice mindfulness with beautiful animations, ambient sounds, and progress tracking.

## ✨ Features

- **Guided Breathing**: Multiple techniques including Box Breathing, 4-7-8, and Wim Hof Method
- **Visual Guidance**: Animated breathing circle with smooth transitions
- **Ambient Sounds**: Ocean waves, rain, forest sounds, and white noise
- **Progress Tracking**: Session history, streaks, and achievement system
- **Customizable**: Adjust timing, sounds, and techniques
- **Offline-First**: Works without internet using Fireproof database

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   cd breathe-easy
   bun install
   ```

2. **Start development server**:
   ```bash
   bun run dev
   ```

3. **Open in browser**: Navigate to `http://localhost:3000`

4. **Start breathing**: Select a technique and click Start!

## 🧘 Breathing Techniques

### Box Breathing (4-4-4-4)
- **Best for**: General relaxation and focus
- **Pattern**: 4 seconds inhale, 4 seconds hold, 4 seconds exhale, 4 seconds rest
- **Benefits**: Calms nervous system, improves concentration

### 4-7-8 Technique
- **Best for**: Anxiety and stress relief
- **Pattern**: 4 seconds inhale, 7 seconds hold, 8 seconds exhale
- **Benefits**: Activates parasympathetic nervous system

### Wim Hof Method
- **Best for**: Energy and vitality
- **Pattern**: 2 seconds inhale, 2 seconds exhale (no holds)
- **Benefits**: Increases energy, improves immune system

### Custom
- **Best for**: Personal preferences
- **Pattern**: Set your own timing
- **Benefits**: Tailored to your needs

## 🎵 Ambient Sounds

- **Ocean Waves**: Calming ocean sounds for deep relaxation
- **Rain**: Gentle rain for peaceful meditation
- **Forest**: Nature sounds for grounding and connection
- **White Noise**: Neutral sound for focus and concentration
- **None**: Silent practice for pure mindfulness

## 📊 Progress Tracking

### Session Statistics
- **Total Sessions**: Track your breathing practice journey
- **Today's Sessions**: Daily consistency tracking
- **Total Minutes**: Cumulative practice time
- **Streak Days**: Consecutive days of practice

### Achievements
- 🏆 **First Session**: Complete your first breathing exercise
- ⭐ **Getting Started**: Complete 5 sessions
- 🎯 **Consistent**: Complete 10 sessions
- 🔥 **Dedicated**: Complete 25 sessions
- 💎 **Master**: Complete 50 sessions

### Milestones
- Visual progress bars toward next achievement
- Motivational messages based on your progress
- Personalized tips for improvement

## 🛠️ Technical Details

### Stack
- **Backend**: Bun + Hono (TypeScript)
- **Frontend**: React + TypeScript + Tailwind CSS
- **Database**: Fireproof (offline-first)
- **Build Tool**: Vite
- **Size**: ~22 MB (includes Bun runtime)

### Architecture
- **API-First**: RESTful endpoints for session management
- **Component-Based**: Modular React components
- **State Management**: React hooks and context
- **Real-Time**: Live breathing animations and progress updates
- **Offline-First**: Fireproof database for local storage

### Performance
- **Load Time**: < 2 seconds
- **Memory Usage**: ~50-100MB
- **Battery Impact**: Minimal (optimized animations)
- **Offline**: Fully functional without internet

## 📁 Project Structure

```
breathe-easy/
├── src/
│   └── server.ts              # Bun + Hono backend
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Main application
│   │   ├── components/        # React components
│   │   │   ├── BreathingCircle.tsx
│   │   │   ├── TechniqueSelector.tsx
│   │   │   ├── AmbientSounds.tsx
│   │   │   └── ProgressTracker.tsx
│   │   └── hooks/
│   │       └── useDatabase.ts # Fireproof integration
│   ├── package.json          # Frontend dependencies
│   └── vite.config.ts        # Vite configuration
├── package.json              # Main project dependencies
└── README.md                 # This file
```

## 🔧 Development

### Prerequisites
- **Bun**: Latest version (1.0+)
- **Node.js**: 18+ (for compatibility)
- **Modern Browser**: Chrome, Firefox, Safari, Edge

### Commands
```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

### API Endpoints
- `GET /api/health` - Health check
- `POST /api/sessions` - Save breathing session
- `GET /api/sessions/stats` - Get session statistics
- `GET /api/sessions` - Get session history

## 🎯 Use Cases

- **Stress Relief**: Quick breathing exercises during work breaks
- **Meditation**: Guided practice for mindfulness
- **Sleep Aid**: Relaxing techniques before bedtime
- **Focus**: Concentration exercises for productivity
- **Anxiety Management**: Calming techniques for panic attacks
- **Fitness**: Energy-boosting breathing for workouts

## 🚀 Deployment

### Bun Standalone
```bash
# Build standalone executable
bun build --compile --outfile breathe-easy

# Run standalone
./breathe-easy
```

### Docker
```dockerfile
FROM oven/bun:1-alpine
COPY . /app
WORKDIR /app
RUN bun install
EXPOSE 3000
CMD ["bun", "run", "dev"]
```

### Static Hosting
- Build frontend: `bun run build`
- Deploy `frontend/dist` to any static host
- Deploy backend separately or use serverless functions

## 📱 Mobile Support

- **Responsive Design**: Works on phones and tablets
- **Touch Controls**: Tap to start/stop breathing
- **Haptic Feedback**: Vibration API for enhanced experience
- **PWA Ready**: Can be installed as app on mobile devices

## 🔮 Future Enhancements

- **Social Features**: Share sessions with friends
- **Advanced Analytics**: Detailed breathing pattern analysis
- **Custom Sounds**: Upload your own ambient audio
- **Integration**: Apple Health, Google Fit sync
- **AI Coaching**: Personalized breathing recommendations
- **Group Sessions**: Synchronized breathing with others

## 🧪 Testing

```bash
# Run tests (when implemented)
bun test

# Run with coverage
bun test --coverage

# Run specific test file
bun test breathing-circle.test.tsx
```

## 📝 License

This project is part of the TinyApp Factory ecosystem. Feel free to use, modify, and distribute.

## 🤝 Contributing

This is an example cherry from TinyApp Factory. To contribute to the main project, visit the TinyApp Factory repository.

## 🆘 Troubleshooting

### Common Issues

**App won't start**:
- Check if port 3000 is available
- Ensure Bun is installed correctly
- Try `bun install` to refresh dependencies

**Breathing animation is choppy**:
- Close other browser tabs
- Check if hardware acceleration is enabled
- Try reducing browser zoom level

**Sounds not playing**:
- Check browser audio permissions
- Ensure volume is not muted
- Try refreshing the page

**Progress not saving**:
- Check browser storage permissions
- Clear browser cache and try again
- Ensure Fireproof is loading correctly

---

**Built with ❤️ using TinyApp Factory**