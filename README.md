# 🏭 TinyApp Factory

A CLI tool for scaffolding tiny, portable full-stack applications that can be deployed as single binaries.

## 🎯 Philosophy

TinyApp Factory creates **lightweight, self-contained applications** that avoid framework bloat. Instead of defaulting to heavy frameworks like Next.js, it helps you choose the right stack for your specific needs.

## 🎯 App Types

TinyApp Factory creates different types of applications:

### 🖥️ **Native Desktop Apps** (Go + Fyne)
- **What**: True desktop applications that open in their own window
- **When**: System tools, utilities, business apps, developer tools
- **Size**: 20-30MB
- **Platform**: macOS, Windows, Linux
- **Magic**: Double-click → native window opens instantly

### 🌐 **Web Applications** (Go+Gin, Bun+Hono, Rust+Axum)
- **What**: Web servers with embedded frontends
- **When**: APIs, web services, full-stack applications
- **Size**: 5-100MB (includes server + frontend)
- **Platform**: Any system with a web browser
- **Magic**: Run executable → web server starts → open browser

### 📱 **Hybrid Apps** (Tauri + React)
- **What**: Desktop native + mobile PWA
- **When**: Cross-platform apps that work everywhere
- **Size**: 6-14MB
- **Platform**: Desktop (native) + Mobile (PWA)
- **Magic**: Desktop: native window | Mobile: installs like native app

### 🌍 **Universal Web Apps** (Static HTML)
- **What**: Pure HTML/CSS/JS files
- **When**: Simple tools, demos, prototypes
- **Size**: <2MB
- **Platform**: Any device with a browser
- **Magic**: Double-click HTML → opens in browser

## ✨ Features

- 🚀 **Single Binary Deployment** - Compile to portable executables
- 📦 **Multiple Stack Options** - Go+Gin (web), Go+Fyne (desktop), Bun+Hono, Rust+Axum, Tauri+React, Static HTML
- 🖥️ **Native Desktop Apps** - True desktop applications with Go+Fyne
- 🌐 **Web Applications** - Server-based apps with embedded frontends
- 🍒 **[Fireproof](https://fireproof.storage/) Database** - Local-first, encrypted, offline-capable database
- 🎨 **Beautiful Starter UI** - Modern React frontend with Tailwind CSS
- 🤖 **Cursor AI Integration** - Auto-generated `.cursorrules` and `PROMPT.md`
- 📊 **Size-Aware Decisions** - Choose based on binary size requirements
- 🔧 **Hot Reload Development** - Fast iteration with live reload
- 🔄 **Optional Cloud Sync** - Add sync capabilities with one command

## 🚀 Quick Start

### Installation

```bash
cd /Users/home/dev/tinyapp-factory
npm install
npm link  # Makes 'tinyapp' command available globally
```

### Create Your First App

```bash
tinyapp new
```

The CLI will guide you through:
1. **Project name** → Creates slug
2. **Stack selection** → Size/speed comparisons
3. **Configuration** → API? Database? Auth?
4. **Auto-generation** → Complete project with Cursor integration!

### Example Session

```
? Project name: ollama-chat-ui
? Select stack: 1 (Go + Gin)
? External APIs? Y
? Database? n
? Auth? n

✓ Created projects/drafts/ollama-chat-ui/
✓ Stack: Go + Gin
✓ Ready for Cursor!
```

Then:

```bash
cd projects/drafts/ollama-chat-ui
cursor .  # Opens in Cursor with .cursorrules loaded!
```

## 🏗️ Available Stacks

### Go + Gin
- **Size**: 8-18 MB
- **Compile Time**: Fast (15s)
- **Best For**: Production apps, maximum portability
- **Features**: Embedded frontend, cross-compilation, mature ecosystem

### Bun + Hono
- **Size**: 50-100 MB
- **Compile Time**: Fast (10s)
- **Best For**: TypeScript developers, rapid prototyping
- **Features**: Native TypeScript, hot reload, growing ecosystem

## 📁 Project Structure

```
tinyapp-factory/
├── cli.js                     # Main CLI tool
├── package.json               # NPM configuration
├── projects/
│   ├── drafts/               # Active development
│   └── finished/             # Completed apps
├── outputs/                  # Compiled binaries
│   ├── linux/
│   ├── macos/
│   └── windows/
└── templates/
    ├── go-gin/               # Go + Gin template
    └── bun-hono/             # Bun + Hono template
```

## 🍒 [Fireproof](https://fireproof.storage/) Database Integration

Every TinyApp Factory project includes **[Fireproof](https://fireproof.storage/)** - a local-first, encrypted database that works offline and can optionally sync to the cloud.

### Why Fireproof for "Cherries"
- **Truly Portable**: Database bundles with the app (~300KB)
- **Offline-First**: Works immediately with no server needed
- **Zero Config**: No setup, just import and use
- **Encrypted**: Content-addressed encrypted blobs by default
- **Optional Sync**: Add cloud sync later with one line of code
- **Works Everywhere**: Browser, Bun, Node.js, Deno compatible

### Built-in Features
- **Live Queries**: UI updates automatically when data changes
- **CRUD Operations**: Simple save, get, delete, query functions
- **React Hooks**: `useTodos()`, `useNotes()`, `useDatabaseStatus()`
- **Sync Options**: [Fireproof](https://fireproof.storage/) Cloud, PartyKit, S3, IPFS
- **Example Components**: TodoList with real-time updates

### Adding Database to Existing Projects
```bash
cd your-project
tinyapp add database
```

This adds:
- `@fireproof/core` and `use-fireproof` dependencies
- Database utility module (`lib/database.ts`)
- React hooks for live queries (`hooks/useDatabase.ts`)
- TodoList example component
- Sync utilities (`lib/sync.ts`)
- Updated `.cursorrules` with [Fireproof](https://fireproof.storage/) patterns

## 🍒 Example Cherries

TinyApp Factory comes with complete example applications that showcase different stacks and use cases:

### 🎮 Pixel Studio (Static HTML)
**Stack**: Static HTML + Canvas API + [Fireproof](https://fireproof.storage/)  
**Size**: < 2 MB  
**Features**: Complete pixel art creation tool with layers, animation, and export

```bash
# Try it yourself
tinyapp new pixel-studio --stack static-html
cd projects/drafts/pixel-studio
open index.html
```

**What you get**:
- Drawing tools (pencil, line, rectangle, circle, fill, eraser)
- Layer management system with visibility controls
- Frame-by-frame animation with playback
- Color palette with custom color picker
- Export to PNG, GIF, and sprite sheets
- Project save/load with [Fireproof](https://fireproof.storage/) database
- Responsive design for desktop and mobile

### 🫁 Breathe Easy (Bun + Hono)
**Stack**: Bun + Hono + React + [Fireproof](https://fireproof.storage/)  
**Size**: ~22 MB  
**Features**: Guided breathing exercises with animations and progress tracking

```bash
# Try it yourself
tinyapp new breathe-easy --stack bun-hono --database fireproof
cd projects/drafts/breathe-easy
bun install
bun run dev
```

**What you get**:
- Multiple breathing techniques (Box Breathing, 4-7-8, Wim Hof)
- Animated breathing circle with smooth transitions
- Ambient sounds (ocean, rain, forest, white noise)
- Progress tracking with sessions and streaks
- Achievement system with milestones
- Customizable timing and audio settings
- Offline-first with [Fireproof](https://fireproof.storage/) database

### 🎯 Why These Examples?

These cherries demonstrate the **full spectrum** of TinyApp Factory capabilities:

- **Static HTML**: Maximum portability, zero dependencies, instant loading
- **Bun + Hono**: Modern TypeScript stack with excellent developer experience
- **[Fireproof](https://fireproof.storage/) Integration**: Local-first database with optional cloud sync
- **Real-World Features**: Not just demos, but fully functional applications
- **Production Ready**: Clean code, proper error handling, responsive design

### 🚀 Build Your Own

Use these examples as inspiration for your own cherries:

```bash
# Creative tools
tinyapp new music-maker --stack static-html
tinyapp new photo-editor --stack bun-hono

# Productivity apps  
tinyapp new pomodoro-timer --stack static-html
tinyapp new habit-tracker --stack bun-hono --database fireproof

# Games
tinyapp new snake-game --stack static-html
tinyapp new wordle-clone --stack bun-hono

# Utilities
tinyapp new file-organizer --stack go-gin
tinyapp new password-manager --stack bun-hono --database fireproof
```

## 🎯 Commands

```bash
tinyapp new      # Create new project
tinyapp build    # Build all platforms
tinyapp finish   # Move to finished/
tinyapp list     # Show all projects
tinyapp add      # Add features (database, auth, sync)
tinyapp help     # Show help
```

## 🤖 Cursor AI Integration

Every project includes:

- **`.cursorrules`** - Stack-specific coding patterns and anti-patterns
- **`PROMPT.md`** - Architecture guide and development workflow
- **Pre-configured** - Ready for AI-assisted development

The `.cursorrules` file tells Cursor exactly how to code for your chosen stack, avoiding common pitfalls like accidentally using heavy frameworks.

## 📊 Size Analysis Examples

### App 1: Ollama Chat UI
| Stack | Size | Notes |
|-------|------|-------|
| Go + Gin | **10 MB** | ✅ Best choice |
| Bun + Hono | 65 MB | Works, but heavier |

### App 2: Web Synthesizer
| Stack | Size | Notes |
|-------|------|-------|
| Static HTML | **2 MB** | 🏆 Perfect - no backend needed! |
| Go + Gin | 10 MB | Overkill |

### App 3: BBS System
| Stack | Size | Notes |
|-------|------|-------|
| Go + Gin | **15 MB** | ✅ With SQLite |
| Bun + Hono | 80 MB | Works but bloated |

## 🎨 Beautiful Starter UI

Every template includes:
- Gradient purple theme
- Health check display
- Next steps guide
- Fully responsive design
- Ready to customize

## 🔮 Roadmap

See `ROADMAP.md` for upcoming features:
- Database integration (SQLite, PostgreSQL, MongoDB)
- Authentication (JWT, Sessions, OAuth)
- Additional stack templates (Rust, Tauri)
- Build automation improvements

## 📚 Documentation

- `SETUP.md` - Detailed installation guide
- `QUICKSTART.txt` - Visual ASCII quick-start
- `ROADMAP.md` - Future features and database/auth plans
- Each template has its own README

## 🚀 Ready to Build?

```bash
# Create the Ollama chat UI:
tinyapp new
# Name: Ollama Chat
# Stack: Go + Gin
# APIs: Yes
# DB: No
# Auth: No

cd projects/drafts/ollama-chat
go mod download
cd frontend && npm install
npm run dev  # Frontend dev server

# In another terminal:
go run main.go  # Backend

# Open Cursor and start building!
```

The `.cursorrules` file will guide Claude/Cursor perfectly for your chosen stack!

---

**Built with ❤️ for creating tiny, portable applications**
