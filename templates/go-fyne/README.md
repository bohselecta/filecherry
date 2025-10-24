# 🍒 {{PROJECT_NAME}} - Native Desktop App

A beautiful, native desktop application built with Go + Fyne.

## ✨ Features

- ✅ **True Native Desktop App** - Opens in its own window, no browser required
- 📊 **Live Stats Dashboard** - Real-time task statistics
- 🎯 **Priority Management** - High, medium, low with visual indicators
- 🔄 **Task Management** - Add, complete, delete tasks
- 🔍 **Smart Filtering** - View all, pending, or completed tasks
- ⏰ **Timestamps** - Track when tasks were created
- 🎨 **Modern UI** - Clean, responsive interface

## 🚀 Quick Start

### Prerequisites
- Go 1.21 or later
- Fyne GUI framework

### Installation
```bash
go mod tidy
go build -o {{PROJECT_NAME}} main.go
```

### Run
```bash
./{{PROJECT_NAME}}
```

## 🎯 What Makes This Special

This is a **true native desktop application**, not a web app or Electron wrapper:

- **Native Performance** - Compiled Go code with native GUI
- **No Browser Required** - Opens in its own desktop window
- **Cross-Platform** - Works on macOS, Windows, and Linux
- **Lightweight** - ~20-30MB executable
- **Offline-First** - Works without internet connection

## 🏗️ Architecture

- **Language**: Go
- **GUI Framework**: Fyne v2
- **Architecture**: Native desktop application
- **Data Storage**: In-memory (can be extended with SQLite/Fireproof)

## 🍒 Built with TinyApp Factory

This app was created using TinyApp Factory's Go + Fyne template, demonstrating how to build true native desktop applications that are portable and self-contained.

## 🔧 Development

### Hot Reload
```bash
# Install air for hot reload
go install github.com/cosmtrek/air@latest

# Run with hot reload
air
```

### Cross-Platform Build
```bash
# macOS
GOOS=darwin GOARCH=amd64 go build -o {{PROJECT_NAME}}-macos main.go

# Windows
GOOS=windows GOARCH=amd64 go build -o {{PROJECT_NAME}}-windows.exe main.go

# Linux
GOOS=linux GOARCH=amd64 go build -o {{PROJECT_NAME}}-linux main.go
```

## 📊 Performance

- **Startup Time**: < 1 second
- **Memory Usage**: ~20-50MB
- **Binary Size**: ~20-30MB
- **CPU Usage**: Minimal (native efficiency)

---

**Enjoy your new native desktop application!** 🍒✨
