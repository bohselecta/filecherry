# FileCherry Architecture Documentation

## Overview

FileCherry is a full-stack platform for creating, distributing, and managing portable desktop applications ("cherries"). This document details the system architecture, data flow, and integration points.

## System Components

```
┌─────────────────────────────────────────────────────────────┐
│                      FileCherry.com                         │
│                                                             │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │  Cherry       │  │  AI Cherry   │  │  Cherry Bowl    │ │
│  │  Marketplace  │  │  Generator   │  │  (Collection)   │ │
│  └───────┬───────┘  └──────┬───────┘  └────────┬────────┘ │
│          │                  │                    │          │
└──────────┼──────────────────┼────────────────────┼──────────┘
           │                  │                    │
           │                  │                    │
┌──────────▼──────────────────▼────────────────────▼──────────┐
│                    Backend API Server                        │
│                                                              │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  DeepSeek     │  │  TinyApp     │  │  Download       │  │
│  │  Integration  │  │  Factory CLI │  │  Manager        │  │
│  └───────────────┘  └──────────────┘  └─────────────────┘  │
│                                                              │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                    TinyApp Factory                           │
│                                                              │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Project      │  │  Fireproof   │  │  Build          │  │
│  │  Templates    │  │  Integration │  │  System         │  │
│  └───────────────┘  └──────────────┘  └─────────────────┘  │
│                                                              │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
                    Compiled Cherry
                    (Portable Binary)
```

## Data Flow

### 1. User Browses Cherries

```
User → Frontend → Display Cherry Grid
                ↓
        Filter/Search Logic
                ↓
        Render Matched Cherries
```

### 2. AI Cherry Generation

```
User Input (Description) 
    ↓
Frontend → POST /api/generate-cherry
    ↓
Backend → DeepSeek API
    ↓
Cherry Specification (JSON)
    ↓
Backend → POST /api/build-cherry
    ↓
TinyApp Factory CLI Execution:
    1. tinyapp new
    2. tinyapp add database
    3. tinyapp add sync
    4. tinyapp build
    ↓
Compiled Binary
    ↓
GET /api/download/:cherryId
    ↓
User Downloads Cherry
```

### 3. Cherry Bowl Management

```
User Actions → localStorage
    ↓
Cherry IDs Stored Locally
    ↓
Frontend Renders Collection
    ↓
User Can Download/Remove
```

## Technology Stack

### Frontend
- **HTML/CSS/JS**: Vanilla JavaScript for simplicity
- **Tailwind CSS**: Utility-first styling
- **LocalStorage**: Cherry Bowl persistence
- **Fetch API**: Backend communication

### Backend
- **Node.js 18+**: Runtime environment
- **Express.js**: Web framework
- **ES Modules**: Modern JavaScript
- **File System**: Cherry storage

### External Services
- **DeepSeek API**: AI code generation
- **Fireproof**: Embedded database in cherries
- **CDN**: Tailwind CSS delivery

### Build Tools
- **TinyApp Factory CLI**: Cherry scaffolding and building
- **Go/Bun/Rust Compilers**: Binary compilation
- **Vite**: Frontend bundling (in cherries)

## API Endpoints

### `POST /api/generate-cherry`

Generate a cherry specification using AI.

**Request Body:**
```json
{
  "description": "A task manager with categories",
  "category": "productivity",
  "stack": "go-gin",
  "includeDatabase": true,
  "includeSync": false,
  "includeAuth": false
}
```

**Response:**
```json
{
  "id": "cherry-1234567890-abc",
  "name": "Task Manager",
  "description": "A task manager with categories",
  "category": "productivity",
  "stack": "go-gin",
  "features": ["Fireproof Database", "Offline-First", "Beautiful UI"],
  "size": "14 MB",
  "commands": [
    "tinyapp new task-manager --stack go-gin",
    "tinyapp add database --type fireproof",
    "tinyapp build"
  ],
  "icon": "✅"
}
```

### `POST /api/build-cherry`

Build a cherry from its specification.

**Request Body:**
```json
{
  "cherryId": "cherry-1234567890-abc"
}
```

**Response:**
```json
{
  "success": true,
  "cherryId": "cherry-1234567890-abc",
  "downloadUrl": "/api/download/cherry-1234567890-abc",
  "buildSteps": [
    {
      "command": "tinyapp new task-manager --stack go-gin",
      "status": "completed",
      "output": "..."
    }
  ]
}
```

### `GET /api/download/:cherryId`

Download a built cherry.

**Response:** Binary file stream

## DeepSeek Integration

### Prompt Engineering

The system uses a carefully crafted system prompt that:

1. **Defines Context**: Explains TinyApp Factory and cherry concept
2. **Lists Tech Stacks**: Describes Go, Bun, Rust, Static options
3. **Specifies Features**: Database, sync, auth capabilities
4. **Enforces Format**: Requires valid JSON output
5. **Emphasizes Quality**: Production-ready, beautiful UI

### Response Processing

```javascript
// Extract JSON from DeepSeek response
const content = data.choices[0].message.content;

// Handle markdown-wrapped JSON
const jsonMatch = content.match(/```json\n([\s\S]+?)\n```/) || 
                 content.match(/\{[\s\S]+\}/);

const cherrySpec = JSON.parse(jsonMatch[1] || jsonMatch[0]);
```

### Fallback Strategy

If DeepSeek API is unavailable:
- Generate mock specification
- Use template-based approach
- Still functional for development

## Build Pipeline

### 1. Project Creation

```bash
cd $WORKSPACE_DIR
tinyapp new $cherry-name --stack $stack
cd projects/drafts/$cherry-name
```

### 2. Feature Addition

```bash
# Conditionally add features
if ($includeDatabase) {
  tinyapp add database --type fireproof
}
if ($includeSync) {
  tinyapp add sync --provider fireproof-cloud
}
if ($includeAuth) {
  tinyapp add auth --provider device
}
```

### 3. Build

```bash
tinyapp build
# Output: ./outputs/$cherry-name-$platform
```

### 4. Distribution

```bash
# Copy to builds directory
cp ./outputs/$binary $BUILDS_DIR/$cherryId-$name.exe
```

## Cherry Specification Schema

```typescript
interface CherrySpec {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  description: string;           // One-line description
  category: Category;            // productivity, creative, civic, business, personal
  stack: Stack;                  // go-gin, bun-hono, rust-axum, static
  features: string[];            // List of features
  size: string;                  // Estimated size (e.g., "14 MB")
  commands: string[];            // TinyApp Factory commands
  icon: string;                  // Single emoji
  technicalDetails?: {
    frontend: string;            // UI description
    backend: string;             // Backend logic
    database?: string;           // Database schema
    apis?: string[];             // External APIs
  };
}
```

## Security Considerations

### API Key Protection

**Problem**: DeepSeek API keys must not be exposed in frontend.

**Solution**: Backend proxy pattern
```
Frontend → Backend → DeepSeek API
          ↑
    API key stays here
```

### Cherry Safety

- Cherries run locally (no remote code execution)
- User downloads and runs explicitly
- No automatic updates (user control)
- Optional sync is E2E encrypted

### Rate Limiting

Implement rate limiting on API endpoints:

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Storage Architecture

### Workspace Directory

```
workspace/
├── cherry-123-abc/
│   ├── main.go
│   ├── go.mod
│   ├── frontend/
│   │   ├── src/
│   │   └── package.json
│   └── outputs/
│       └── cherry-binary
└── cherry-456-def/
    └── ...
```

### Builds Directory

```
builds/
├── cherry-123-abc-Task-Manager.exe
├── cherry-123-abc-spec.json
├── cherry-456-def-Expense-Tracker.exe
└── cherry-456-def-spec.json
```

### Frontend Storage

```javascript
// LocalStorage schema
{
  "cherryBowl": [
    "cherry-123-abc",
    "cherry-456-def"
  ]
}
```

## Scaling Considerations

### Current Limitations

- Sequential builds (one at a time)
- Local file storage
- In-memory cherry catalog

### Scaling Solutions

#### Phase 1: Better Resource Management
- Queue system for builds
- Parallel build execution
- Build result caching

#### Phase 2: Distributed Storage
- S3/R2 for cherry binaries
- Database for cherry metadata
- CDN for static assets

#### Phase 3: Build Infrastructure
- Dedicated build servers
- Docker-based isolation
- CI/CD integration

## Monitoring & Observability

### Metrics to Track

1. **Generation Metrics**
   - DeepSeek API latency
   - Success/failure rates
   - Token usage

2. **Build Metrics**
   - Build time per stack
   - Success/failure rates
   - Binary sizes

3. **User Metrics**
   - Downloads per cherry
   - Popular categories
   - Search queries

### Logging Strategy

```javascript
// Structured logging
console.log({
  timestamp: new Date().toISOString(),
  level: 'info',
  event: 'cherry_generated',
  cherryId: 'cherry-123-abc',
  stack: 'go-gin',
  duration: 2345
});
```

## Error Handling

### Frontend Errors

- Network failures: Retry with exponential backoff
- Invalid input: Client-side validation
- API errors: User-friendly messages

### Backend Errors

- DeepSeek API failures: Fallback to mock generation
- Build failures: Detailed error logs, cleanup workspace
- File system errors: Retry, alert administrators

## Testing Strategy

### Unit Tests

```javascript
// Test cherry generation
describe('Cherry Generation', () => {
  it('should generate valid cherry spec', async () => {
    const spec = await callDeepSeek({
      description: 'Task manager',
      stack: 'go-gin'
    });
    expect(spec).toHaveProperty('name');
    expect(spec).toHaveProperty('commands');
  });
});
```

### Integration Tests

- Test full generation → build → download flow
- Test with mock DeepSeek responses
- Test error scenarios

### E2E Tests

- Test user flows in browser
- Test actual cherry builds
- Test downloads on multiple platforms

## Future Enhancements

### Smart Cherry Recommendations

```javascript
// ML-based recommendations
function recommendCherries(user) {
  const history = getUserDownloadHistory(user);
  const similar = findSimilarCherries(history);
  return similar.slice(0, 5);
}
```

### Cherry Versioning

```javascript
interface CherryVersion {
  version: string;
  changelog: string;
  releaseDate: Date;
  downloadUrl: string;
}
```

### Cherry Marketplace

- User uploads
- Reviews & ratings
- Monetization options
- Quality verification

---

**Last Updated**: October 2025  
**Version**: 1.0.0  
**Maintainers**: FileCherry Team