# 🚀 TinyApp Factory Setup Guide

This guide will walk you through installing and setting up TinyApp Factory on your system.

## 📋 Prerequisites

Before installing TinyApp Factory, make sure you have:

- **Node.js 14+** - [Download here](https://nodejs.org/)
- **npm** - Comes with Node.js
- **Go 1.21+** (for Go+Gin projects) - [Download here](https://golang.org/dl/)
- **Bun 1.0+** (for Bun+Hono projects) - [Install here](https://bun.sh/)

## 🔧 Installation

### Step 1: Clone or Download

If you're reading this, you likely already have the TinyApp Factory files. If not:

```bash
# If you have git access
git clone <repository-url> tinyapp-factory
cd tinyapp-factory

# Or download and extract the files to a folder
```

### Step 2: Install Dependencies

```bash
cd tinyapp-factory
npm install
```

This installs the required dependencies:
- `inquirer` - Interactive CLI prompts
- `chalk` - Colored terminal output
- `fs-extra` - Enhanced file system operations
- `commander` - CLI command handling

### Step 3: Make CLI Available Globally

```bash
npm link
```

This creates a global `tinyapp` command that you can use from anywhere.

### Step 4: Verify Installation

```bash
tinyapp help
```

You should see the TinyApp Factory help message.

## 🎯 First Project Setup

### Create Your First App

```bash
tinyapp new
```

Follow the interactive prompts:

1. **Project Name**: Enter a descriptive name (e.g., "My Awesome App")
2. **Stack Selection**: Choose between Go+Gin and Bun+Hono
3. **Configuration**: Answer questions about APIs, database, auth

### Example Walkthrough

```
? Project name: hello-world
? Select stack: (Use arrow keys)
❯ Go + Gin (8-18 MB, fast compile)
  Bun + Hono (50-100 MB, familiar JS)

? External APIs? (y/N) n
? Database? (y/N) n  
? Auth? (y/N) n

✓ Created projects/drafts/hello-world/
✓ Stack: Go + Gin
✓ Ready for Cursor!
```

### Navigate to Your Project

```bash
cd projects/drafts/hello-world
```

## 🔧 Development Environment Setup

### For Go + Gin Projects

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

### For Bun + Hono Projects

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Start development:**
   ```bash
   bun run dev
   ```

4. **Open your browser:**
   - Application: http://localhost:3000
   - API: http://localhost:3000/api/health

## 🎨 Opening in Cursor

1. **Open the project in Cursor:**
   ```bash
   cursor .
   ```

2. **The `.cursorrules` file is automatically loaded** - Cursor will now understand your stack!

3. **Start chatting with Claude** - Ask it to:
   - Add new API endpoints
   - Create React components
   - Implement features
   - Optimize the build

## 🔨 Building for Production

### Go + Gin Projects

```bash
# Build frontend
cd frontend
npm run build

# Build Go binary
cd ..
go build -ldflags="-s -w" -o myapp

# Cross-compile for other platforms
GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o myapp-linux
GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o myapp.exe
```

### Bun + Hono Projects

```bash
# Build everything
bun run build

# Manual build with options
bun build --compile --minify --bytecode src/server.ts --outfile myapp

# Cross-platform builds
bun build --compile --minify --bytecode --target=bun-linux-x64 src/server.ts --outfile myapp-linux
```

## 🐛 Troubleshooting

### Common Issues

**"tinyapp: command not found"**
- Run `npm link` again
- Check if `/usr/local/bin` is in your PATH

**"Go modules not found"**
- Run `go mod download` in your project directory
- Make sure Go is installed and in your PATH

**"Bun not found"**
- Install Bun: `curl -fsSL https://bun.sh/install | bash`
- Restart your terminal

**"Frontend build fails"**
- Run `cd frontend && npm install`
- Check Node.js version (needs 16+)

**"Port already in use"**
- Change the port in your server file
- Kill existing processes: `lsof -ti:3000 | xargs kill`

### Getting Help

1. Check the project's `README.md` file
2. Look at the `PROMPT.md` for development guidance
3. Review the `.cursorrules` for stack-specific patterns
4. Ask Claude in Cursor for help!

## 🎉 You're Ready!

You now have TinyApp Factory set up and ready to create tiny, portable applications. 

**Next steps:**
1. Create your first project with `tinyapp new`
2. Open it in Cursor
3. Start building with AI assistance!

Happy coding! 🚀
