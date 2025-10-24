# Test Fireproof

A lightweight, portable full-stack application built with Go + Gin.

## Features

- 🚀 Single binary deployment
- 📦 Embedded frontend assets
- 🔧 Hot reload development
- 📊 Health check API
- 🍒 **Fireproof Database** - Local-first, encrypted, offline-capable
- 🎨 Modern React UI with Tailwind CSS
- 🔄 Optional cloud sync capabilities

## 🍒 Fireproof Database

This template includes **Fireproof** - a local-first, encrypted database that works offline and can optionally sync to the cloud.

### Database Features
- **Live Queries**: UI updates automatically when data changes
- **CRUD Operations**: Simple save, get, delete, query functions
- **React Hooks**: `useTodos()`, `useNotes()`, `useDatabaseStatus()`
- **Offline-First**: Works without internet connection
- **Encrypted**: All data is encrypted by default
- **Optional Sync**: Add cloud sync later with one line

### Database Usage Examples

```typescript
// Basic operations
import { db } from './lib/database'

// Save a document
await db.put({
  _id: crypto.randomUUID(),
  type: 'todo',
  text: 'Learn Fireproof',
  done: false,
  created: Date.now()
})

// Query documents
const todos = await db.query('type', { key: 'todo' })

// Get single document
const todo = await db.get('document-id')
```

```typescript
// React hooks for live updates
import { useTodos, useDatabaseStatus } from './hooks/useDatabase'

function TodoApp() {
  const todos = useTodos() // Updates automatically!
  const dbStatus = useDatabaseStatus()
  
  return (
    <div>
      <p>Database: {dbStatus.connected ? 'Connected' : 'Disconnected'}</p>
      <p>Documents: {dbStatus.documents}</p>
      {todos.map(todo => (
        <div key={todo._id}>{todo.text}</div>
      ))}
    </div>
  )
}
```

### Sync Options (Optional)

```typescript
import { enableFireproofCloudSync } from './lib/sync'

// Enable cloud sync
const syncStatus = await enableFireproofCloudSync()
console.log('Sync URL:', syncStatus.url)
```

## Quick Start

### Prerequisites
- Go 1.21+
- Node.js 16+
- npm or yarn

### Development Setup

1. **Install Go dependencies:**
   ```bash
   go mod download
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Start development servers:**
   
   Terminal 1 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```
   
   Terminal 2 (Backend):
   ```bash
   go run main.go
   ```

4. **Open your browser:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api/health

## Building for Production

### Frontend Build
```bash
cd frontend
npm run build
```

### Go Binary Build
```bash
# Basic build
go build -o test-fireproof

# Optimized build (smaller binary)
go build -ldflags="-s -w" -o test-fireproof

# Cross-compilation examples
GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o test-fireproof-linux
GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o test-fireproof.exe
GOOS=darwin GOARCH=amd64 go build -ldflags="-s -w" -o test-fireproof-macos
```

## Project Structure

```
test-fireproof/
├── main.go              # Go server with embedded frontend
├── go.mod               # Go dependencies
├── .gitignore           # Git ignore rules
├── .cursorrules         # Cursor AI rules
├── PROMPT.md            # Development guide
└── frontend/            # React frontend
    ├── src/
    │   ├── App.tsx      # Main React component
    │   ├── App.css      # Component styles
    │   ├── main.tsx     # React entry point
    │   └── index.css    # Global styles
    ├── index.html       # HTML template
    ├── package.json     # Frontend dependencies
    └── vite.config.js   # Vite configuration
```

## API Endpoints

- `GET /api/health` - Health check endpoint

## Development Notes

- Frontend assets are automatically embedded in the Go binary
- Use relative API calls (`/api/`) not absolute URLs
- The Go server serves the built frontend from the embedded filesystem
- Hot reload works in development mode

## Stack Details

- **Backend**: Go with Gin framework
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Build**: Single binary with embedded assets
- **Size**: ~8-18 MB final binary

## Next Steps

1. Customize the UI in `frontend/src/App.tsx`
2. Add new API endpoints in `main.go`
3. Implement your specific features
4. Test thoroughly before building
5. Deploy your single binary anywhere!
