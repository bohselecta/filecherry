# 🍒 FileCherry

**Portable tools you can share. Built with TinyApp Factory.**

FileCherry is a platform for discovering, creating, and sharing "cherries" - tiny, powerful, portable applications that run anywhere without installation. Each cherry is a self-contained executable (1-50 MB) with its own database, beautiful UI, and optional cloud sync.

## 🌟 Features

- **🤖 AI-Powered Generation**: Describe what you need, let DeepSeek create it
- **💾 Truly Portable**: Single executables for macOS, Windows, Linux
- **🔒 Privacy-First**: Data stays on your device, optional E2E encrypted sync
- **⚡ Zero Dependencies**: No Node, Docker, or database servers required
- **🎨 Beautiful UIs**: Modern React interfaces with Tailwind CSS
- **🔄 Optional Sync**: Start local, add Fireproof cloud sync when ready

## 🚀 Quick Start

### For Users (Browse & Download Cherries)

1. Visit [filecherry.com](https://filecherry.com)
2. Browse available cherries or search by category
3. Download a cherry (single file, 1-50 MB)
4. Double-click to run - no installation needed!
5. Your data stays private on your device

### For Creators (Build Custom Cherries)

#### Option 1: AI Generation (Easiest)

1. Visit the "Create" section on filecherry.com
2. Describe what your cherry should do
3. Click "Generate My Cherry"
4. Download and use!

#### Option 2: Manual Creation with TinyApp Factory

```bash
# Install TinyApp Factory
npm install -g tinyapp-factory

# Create a new cherry
tinyapp new my-cherry --stack go-gin

# Add features
tinyapp add database --type fireproof
tinyapp add sync --provider fireproof-cloud
tinyapp add auth --provider device

# Build
tinyapp build

# Your cherry is ready in ./outputs/
```

## 🏗️ Architecture

### Frontend (index.html + app.js)
- Static HTML/CSS/JS site
- Cherry browser with search & filtering
- AI-powered cherry generator UI
- Cherry Bowl (personal collection manager)
- Built with Tailwind CSS

### Backend (server.js)
- Express.js API server
- DeepSeek integration for AI generation
- TinyApp Factory CLI orchestration
- Cherry build pipeline
- Download management

### Tech Stack
- **Frontend**: Vanilla JS, Tailwind CSS
- **Backend**: Node.js, Express
- **AI**: DeepSeek API
- **Cherry Builder**: TinyApp Factory CLI
- **Database**: Fireproof (embedded)
- **Sync**: Fireproof Cloud, PartyKit, S3

## 📦 Installation (Self-Hosted)

### Prerequisites
- Node.js 18+
- TinyApp Factory CLI installed globally
- DeepSeek API key (optional, for AI generation)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/filecherry.git
cd filecherry
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env and add your DEEPSEEK_API_KEY
```

4. **Start the server**
```bash
npm start
```

5. **Visit the site**
```
http://localhost:3000
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEEPSEEK_API_KEY` | DeepSeek API key for AI generation | None (uses mock data) |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment (development/production) | development |
| `WORKSPACE_DIR` | Build workspace directory | ./workspace |
| `BUILDS_DIR` | Output directory for built cherries | ./builds |

### DeepSeek API Setup

1. Sign up at [platform.deepseek.com](https://platform.deepseek.com)
2. Create an API key
3. Add to `.env`: `DEEPSEEK_API_KEY=your_key_here`
4. Restart the server

**Note**: Without an API key, the system uses mock data for demonstration.

## 🍒 Cherry Categories

### Productivity
- Task managers
- Note-taking apps
- Time trackers
- Todo lists

### Creative
- Drawing tools
- Music creation
- Color palette generators
- Design utilities

### Civic
- Community tools
- Public service apps
- Resource finders
- Emergency helpers

### Business
- Invoice generators
- CRM tools
- Inventory trackers
- Report builders

### Personal
- Habit trackers
- Expense managers
- Journal apps
- Personal dashboards

## 🔐 Security

### API Key Protection
**CRITICAL**: Never expose your DeepSeek API key in frontend code!

The included implementation:
- ✅ Backend proxies all API calls
- ✅ API keys stay server-side
- ✅ Frontend never sees credentials
- ✅ Rate limiting on API endpoints

### Cherry Security
- All cherries run locally (no remote code execution)
- Optional E2E encryption for sync
- User controls all data
- No telemetry or tracking

## 🚢 Deployment

### Option 1: Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy
```

### Option 3: Docker
```bash
# Build image
docker build -t filecherry .

# Run
docker run -p 3000:3000 \
  -e DEEPSEEK_API_KEY=your_key \
  filecherry
```

### Option 4: Traditional Server
```bash
# On your server
git clone https://github.com/yourusername/filecherry.git
cd filecherry
npm install
npm start

# Use PM2 for production
pm2 start server.js --name filecherry
pm2 save
```

## 📊 Analytics & Metrics

Track cherry usage (optional):

```javascript
// In app.js, add analytics
function trackDownload(cherryId) {
  // Your analytics code here
  console.log('Cherry downloaded:', cherryId);
}
```

## 🤝 Contributing

We love contributions! Here's how:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Cherry Contribution Guidelines

Want to add a cherry to the marketplace?

1. Build your cherry with TinyApp Factory
2. Test on multiple platforms
3. Create a pull request with:
   - Cherry binary (or build instructions)
   - Screenshots
   - Description and features
   - Category and metadata

## 📚 Documentation

- **TinyApp Factory**: [Link to TinyApp Factory docs]
- **Fireproof Database**: https://use-fireproof.com/docs
- **DeepSeek API**: https://platform.deepseek.com/docs

## 🐛 Troubleshooting

### "Cherry generation failed"
- Check your DeepSeek API key in `.env`
- Ensure TinyApp Factory is installed: `tinyapp --version`
- Check server logs for detailed errors

### "Build failed"
- Ensure all dependencies are installed
- Check that TinyApp Factory templates are up to date
- Verify disk space for builds

### "Download not working"
- Check that `BUILDS_DIR` exists and is writable
- Verify cherry was built successfully
- Check browser console for errors

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **TinyApp Factory** - Cherry build system
- **Fireproof** - Embedded database
- **DeepSeek** - AI code generation
- **Tailwind CSS** - Beautiful styling
- **React** - UI framework

## 💬 Community

- **Discord**: [Link to Discord]
- **GitHub Discussions**: [Link to discussions]
- **Twitter**: [@filecherry](https://twitter.com/filecherry)

## 🗺️ Roadmap

### Phase 1: MVP (Current)
- ✅ Cherry marketplace
- ✅ AI generation with DeepSeek
- ✅ Cherry Bowl (personal collection)
- ✅ Download system

### Phase 2: Enhanced Features
- [ ] User accounts (optional)
- [ ] Cherry ratings & reviews
- [ ] Social sharing
- [ ] Cherry analytics dashboard

### Phase 3: Advanced
- [ ] Cherry updates & versioning
- [ ] Marketplace monetization
- [ ] Custom domain support
- [ ] Cherry templates marketplace

### Phase 4: Enterprise
- [ ] Private cherry stores
- [ ] Organization management
- [ ] Custom branding
- [ ] SSO integration

---

**Made with 🍒 by the FileCherry team**

*Portable tools, shareable everywhere.*