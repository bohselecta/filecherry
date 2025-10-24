# {{PROJECT_NAME}} - Rust + Axum Template

A tiny, portable full-stack application built with Rust + Axum backend and React frontend.

## 🚀 Features

- **Rust + Axum**: High-performance async web server
- **React + TypeScript**: Modern frontend with Vite
- **Embedded Frontend**: Frontend bundled into the binary
- **Fireproof Database**: Local-first, encrypted database
- **Tailwind CSS**: Beautiful, responsive UI
- **Tiny Binary**: 5-10 MB executable

## 📦 Binary Size

- **Linux**: ~6-8 MB
- **macOS**: ~7-9 MB  
- **Windows**: ~6-8 MB

## 🛠️ Development

### Prerequisites

- Rust 1.70+
- Node.js 18+
- npm or yarn

### Setup

1. **Install Rust** (if not already installed):
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source ~/.cargo/env
   ```

2. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Build frontend**:
   ```bash
   npm run build
   ```

4. **Run development server**:
   ```bash
   # Terminal 1: Frontend dev server
   cd frontend
   npm run dev
   
   # Terminal 2: Rust backend
   cargo run
   ```

5. **Visit**: http://localhost:3000

## 🔨 Building for Production

### Single Command Build

```bash
# Build everything
npm run build:all
```

### Manual Build

```bash
# 1. Build frontend
cd frontend
npm run build

# 2. Build Rust binary
cd ..
cargo build --release

# 3. Binary is in target/release/{{PROJECT_SLUG}}
```

### Cross-Platform Compilation

```bash
# Linux
cargo build --release --target x86_64-unknown-linux-gnu

# macOS (Intel)
cargo build --release --target x86_64-apple-darwin

# macOS (Apple Silicon)
cargo build --release --target aarch64-apple-darwin

# Windows
cargo build --release --target x86_64-pc-windows-gnu
```

## 🍒 Fireproof Database

This template includes Fireproof - a local-first, encrypted database that works offline.

### Features

- **Truly Portable**: Database bundles with the app (~300KB)
- **Offline-First**: Works immediately with no server needed
- **Zero Config**: No setup, just import and use
- **Encrypted**: Content-addressed encrypted blobs by default
- **Optional Sync**: Add cloud sync later with one line of code

### Usage

```typescript
import { fireproof } from '@fireproof/core'

// Initialize database
const db = fireproof('{{PROJECT_SLUG}}')

// Save data
await db.put({
  _id: crypto.randomUUID(),
  type: 'todo',
  text: 'Hello Fireproof!',
  done: false,
  created: Date.now()
})

// Query data
const todos = await db.query('type', { key: 'todo' })
```

### React Hooks

```typescript
import { useTodos, useDatabaseStatus } from './hooks/useDatabase'

function App() {
  const todos = useTodos() // Live query - updates automatically!
  const dbStatus = useDatabaseStatus()
  
  return (
    <div>
      <p>Database: {dbStatus.connected ? 'Connected' : 'Disconnected'}</p>
      <p>Documents: {dbStatus.documents}</p>
      <ul>
        {todos.map(todo => (
          <li key={todo._id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  )
}
```

### Sync Options

```typescript
// Fireproof Cloud (easiest)
import { connect } from '@fireproof/cloud'
await connect(db, 'your-sync-id')

// PartyKit (real-time collaboration)
import { connect } from '@fireproof/partykit'
await connect(db, 'your-partykit-url')

// Self-hosted S3
import { connect } from '@fireproof/s3'
await connect(db, 'your-s3-config')
```

## 🏗️ Architecture

### Backend (Rust + Axum)

- **Server**: Axum async web framework
- **Embedded Assets**: Frontend bundled with `include_dir!`
- **API Routes**: RESTful endpoints for data
- **CORS**: Configured for development
- **Performance**: Optimized for minimal binary size

### Frontend (React + TypeScript)

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development
- **Styling**: Tailwind CSS
- **Database**: Fireproof with React hooks
- **State**: Local state + Fireproof live queries

### File Structure

```
{{PROJECT_SLUG}}/
├── Cargo.toml              # Rust dependencies
├── src/
│   └── main.rs             # Axum server
├── frontend/               # React frontend
│   ├── package.json
│   ├── src/
│   │   ├── App.tsx         # Main component
│   │   ├── lib/
│   │   │   ├── database.ts # Fireproof setup
│   │   │   └── sync.ts     # Sync utilities
│   │   └── hooks/
│   │       └── useDatabase.ts # React hooks
│   └── dist/               # Built frontend (embedded)
└── target/
    └── release/
        └── {{PROJECT_SLUG}} # Final binary
```

## 🎯 Performance

### Binary Size Optimization

The Rust template is optimized for minimal size:

- **Release Profile**: `opt-level = "z"` (optimize for size)
- **LTO**: Link-time optimization enabled
- **Strip**: Debug symbols removed
- **Single Codegen Unit**: Better optimization
- **Panic Abort**: Smaller panic handling

### Runtime Performance

- **Async/Await**: Non-blocking I/O
- **Memory Safety**: No garbage collection overhead
- **Zero-Cost Abstractions**: Rust's performance guarantees
- **Embedded Assets**: No file system dependencies

## 🔧 Customization

### Adding New API Routes

```rust
// In src/main.rs
let app = Router::new()
    .route("/api/health", get(health_check))
    .route("/api/custom", get(custom_endpoint)) // Add your route
    .fallback(serve_frontend);

async fn custom_endpoint() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "Custom endpoint!"
    }))
}
```

### Adding Frontend Components

```typescript
// In frontend/src/components/
export function CustomComponent() {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
      <h2>Custom Component</h2>
    </div>
  )
}
```

### Database Schema

```typescript
// Define your data types
interface Todo {
  _id: string
  type: 'todo'
  text: string
  done: boolean
  created: number
}

interface Note {
  _id: string
  type: 'note'
  title: string
  content: string
  tags: string[]
  created: number
}
```

## 🚢 Deployment

### Standalone Binary

The built binary is completely standalone:

```bash
# Copy to any machine
scp target/release/{{PROJECT_SLUG}} user@server:/opt/myapp/

# Run directly
./{{PROJECT_SLUG}}
```

### Docker (Optional)

```dockerfile
FROM rust:1.70 as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
COPY --from=builder /app/target/release/{{PROJECT_SLUG}} /usr/local/bin/
EXPOSE 3000
CMD ["{{PROJECT_SLUG}}"]
```

## 🐛 Troubleshooting

### Common Issues

**"Frontend not loading"**
- Ensure `frontend/dist/` exists
- Run `npm run build` in frontend directory
- Check `include_dir!` path in `main.rs`

**"Binary too large"**
- Use `cargo build --release`
- Check Cargo.toml release profile
- Remove unused dependencies

**"Database not working"**
- Check Fireproof imports
- Ensure `@fireproof/core` is installed
- Verify database initialization

### Development Tips

- Use `cargo watch` for auto-rebuild: `cargo install cargo-watch && cargo watch -x run`
- Frontend hot reload: `npm run dev` in frontend directory
- Check logs: Add `RUST_LOG=debug` environment variable

## 📚 Next Steps

1. **Customize the UI**: Modify `frontend/src/App.tsx`
2. **Add API endpoints**: Extend `src/main.rs` routes
3. **Database operations**: Use Fireproof hooks in components
4. **Add sync**: Implement cloud sync with Fireproof
5. **Deploy**: Build and distribute your cherry!

---

**Built with 🍒 by TinyApp Factory**

*Portable tools, shareable everywhere.*
