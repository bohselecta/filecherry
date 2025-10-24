# 🍒 FileCherry Desktop - Your Cherry Bowl & Marketplace

FileCherry is a native desktop application that serves as your personal cherry bowl and marketplace for tiny, portable applications called "cherries".

## ✨ What is FileCherry?

FileCherry is **THE** desktop application that makes the entire cherry ecosystem work. It's not a website - it's a native desktop app that runs on macOS, Windows, and Linux.

### 🎯 Core Concept

- **Cherry Marketplace**: Browse and discover tiny apps built with Go, Rust, Bun, and more
- **Cherry Bowl**: Install cherries into your personal collection
- **AI Builder**: Use AI to generate custom cherries with TinyApp Factory
- **Native Desktop**: True desktop application, no browser required

## 🚀 Features

### 🏠 **Home Dashboard**
- Welcome screen with quick stats
- Recent cherries and quick actions
- Easy navigation to all features

### 🍒 **Cherry Marketplace**
- Browse available cherries by category
- Search and filter functionality
- One-click installation
- Cherry details and ratings

### 🥣 **My Cherry Bowl**
- Manage installed cherries
- Organize favorites
- Run cherries directly
- Uninstall management

### 🤖 **AI Cherry Builder**
- Enter AI API key (DeepSeek, OpenAI, etc.)
- Describe your cherry idea
- AI generates the cherry using TinyApp Factory
- Automatic installation to cherry bowl

### ⚙️ **Settings**
- General preferences
- Storage path configuration
- Auto-update settings
- About information

## 🎯 App Types Supported

FileCherry can manage cherries built with:

- **Go + Fyne** (Native Desktop) - 20-30MB
- **Go + Gin** (Web Server) - 8-18MB  
- **Bun + Hono** (Web Server) - 50-100MB
- **Rust + Axum** (Web Server) - 5-10MB
- **Tauri + React** (Hybrid) - 6-14MB
- **Static HTML** (Web) - <2MB

## 🚀 Quick Start

### Prerequisites
- Go 1.21 or later
- Fyne GUI framework

### Installation
```bash
go mod tidy
go build -o filecherry-desktop main.go
```

### Run
```bash
./filecherry-desktop
```

## 🎨 User Interface

FileCherry features a clean, modern interface with:

- **Tabbed Navigation**: Easy switching between features
- **Native Look & Feel**: Uses system-native UI components
- **Responsive Design**: Adapts to different window sizes
- **Cherry Icons**: Visual representation of each cherry type

## 🔧 Technical Details

- **Language**: Go
- **GUI Framework**: Fyne v2
- **Architecture**: Native desktop application
- **Data Storage**: Local file system
- **AI Integration**: Supports multiple AI providers
- **Cross-Platform**: macOS, Windows, Linux

## 🍒 Cherry Management

### Installing Cherries
1. Browse the marketplace
2. Click "Install" on desired cherry
3. Cherry is added to your cherry bowl
4. Run directly from the app

### Running Cherries
- Click "▶ Run" in cherry bowl
- Cherry opens in its own window/process
- Native desktop apps open native windows
- Web apps start local servers

### AI Cherry Generation
1. Go to AI Builder tab
2. Enter your AI API key
3. Describe your cherry idea
4. AI builds cherry using TinyApp Factory
5. Cherry is automatically installed

## 🎯 The FileCherry Vision

FileCherry represents a new paradigm in application distribution:

- **Tiny Apps**: Small, focused applications
- **Local-First**: Everything runs locally
- **Portable**: Self-contained executables
- **AI-Powered**: Generate custom apps
- **Community**: Share and discover cherries

## 🔮 Future Features

- **Cherry Sharing**: Share cherries with friends
- **Cloud Sync**: Optional cloud backup
- **Plugin System**: Extend FileCherry functionality
- **Cherry Store**: Official cherry repository
- **Developer Tools**: Cherry development utilities

---

**FileCherry Desktop - Where cherries come to life!** 🍒✨
