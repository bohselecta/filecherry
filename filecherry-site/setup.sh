#!/bin/bash

# FileCherry Quick Start Setup Script
# This script will get FileCherry running in under 5 minutes

echo "🍒 FileCherry Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. You have: $(node -v)"
    exit 1
fi

echo "✓ Node.js $(node -v) found"

# Check NPM
if ! command -v npm &> /dev/null; then
    echo "❌ NPM not found"
    exit 1
fi

echo "✓ NPM $(npm -v) found"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed"

# Check for .env file
echo ""
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Add your DeepSeek API key to .env"
    echo "   Edit .env and set: DEEPSEEK_API_KEY=your_key_here"
    echo "   Get a key at: https://platform.deepseek.com/api_keys"
    echo ""
    read -p "Press Enter to continue (will use mock data without API key)..."
else
    echo "✓ .env file exists"
fi

# Create directories
echo ""
echo "📁 Creating workspace directories..."
mkdir -p workspace
mkdir -p builds
echo "✓ Directories created"

# Check TinyApp Factory
echo ""
echo "🔧 Checking TinyApp Factory..."
if ! command -v tinyapp &> /dev/null; then
    echo "⚠️  TinyApp Factory not found"
    echo "   For full functionality, install it:"
    echo "   npm install -g tinyapp-factory"
    echo ""
    echo "   FileCherry will still work for browsing and collection management."
    echo "   AI generation requires TinyApp Factory for building cherries."
else
    TINYAPP_VERSION=$(tinyapp --version 2>/dev/null || echo "unknown")
    echo "✓ TinyApp Factory found: $TINYAPP_VERSION"
fi

# All done!
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Start the server:"
echo "   npm start"
echo ""
echo "🌐 Then visit:"
echo "   http://localhost:3000"
echo ""
echo "📚 Read the docs:"
echo "   README.md - Getting started"
echo "   ARCHITECTURE.md - Technical details"
echo "   DEPLOYMENT.md - Production deployment"
echo ""
echo "🍒 Happy cherry building!"
echo ""