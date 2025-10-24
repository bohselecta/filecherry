# Development Guide for {{PROJECT_NAME}}

## Project Setup
This {{STACK}} application was created with TinyApp Factory.

### Quick Start

1. Install dependencies: `bun install`
2. Start development: `bun run dev`
3. Open http://localhost:3000


### Architecture
- **Backend**: Bun with Hono framework
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Build**: Single binary deployment

### Development Workflow
1. Make changes to frontend in `frontend/src/`
2. API changes go in backend files
3. Test with development servers
4. Build for production when ready

### API Patterns
- Health check: `GET /api/health`
- Add new endpoints in backend files
- Use consistent JSON responses
- Keep endpoints simple and focused

### Frontend Patterns
- Components in `frontend/src/components/`
- Pages in `frontend/src/`
- API calls use `fetch()` with relative URLs
- State management with React hooks

### Build Commands

- Development: `bun run dev`
- Production build: `bun build --compile --minify --bytecode`
- Cross-platform: `bun build --compile --target=bun-linux-x64`


## Features Status
- External APIs: ❌ Disabled
- Database: ✅ Enabled
- Authentication: ❌ Disabled

## Next Steps
1. Customize the UI in `frontend/src/App.tsx`
2. Add API endpoints in backend files
3. Implement your specific features
4. Test thoroughly before building
5. Use `tinyapp build` to create production binaries
