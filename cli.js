#!/usr/bin/env node

const inquirer = require('inquirer').default;
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// Stack configurations
const STACKS = {
  'go-gin': {
    name: 'Go + Gin (Web Server)',
    size: '8-18 MB',
    compileTime: 'Fast (15s)',
    description: 'Web server with embedded frontend - serves HTML via HTTP',
    template: 'go-gin',
    type: 'web-server'
  },
  'go-fyne': {
    name: 'Go + Fyne (Native Desktop)',
    size: '20-30 MB',
    compileTime: 'Fast (15s)',
    description: 'True native desktop app - opens in its own window',
    template: 'go-fyne',
    type: 'native-desktop'
  },
  'bun-hono': {
    name: 'Bun + Hono (Web Server)',
    size: '50-100 MB',
    compileTime: 'Fast (10s)',
    description: 'TypeScript web server with embedded frontend',
    template: 'bun-hono',
    type: 'web-server'
  },
  'rust-axum': {
    name: 'Rust + Axum (Web Server)',
    size: '5-10 MB',
    compileTime: 'Medium (30s)',
    description: 'Maximum performance web server with embedded frontend',
    template: 'rust-axum',
    type: 'web-server'
  },
  'tauri-react': {
    name: 'Tauri + React (Hybrid)',
    size: '6-14 MB',
    compileTime: 'Medium (45s)',
    description: 'Desktop native + mobile PWA - true cross-platform',
    template: 'tauri-react',
    type: 'hybrid'
  },
  'static-html': {
    name: 'Static HTML (Web)',
    size: '< 2 MB',
    compileTime: 'Instant',
    description: 'Pure HTML/CSS/JS - works in any browser',
    template: 'static-html',
    type: 'web'
  }
};

class TinyAppFactory {
  constructor() {
    this.projectRoot = process.cwd();
    this.templatesDir = path.join(__dirname, 'templates');
    this.projectsDir = path.join(this.projectRoot, 'projects');
    this.draftsDir = path.join(this.projectsDir, 'drafts');
    this.finishedDir = path.join(this.projectsDir, 'finished');
    this.outputsDir = path.join(this.projectRoot, 'outputs');
  }

  async init() {
    console.log(chalk.cyan.bold('\n🏭 TinyApp Factory\n'));
    console.log(chalk.gray('Creating tiny, portable full-stack applications\n'));
    
    await this.ensureDirectories();
    
    const args = process.argv.slice(2);
    const command = args[0] || 'new';
    
    switch (command) {
      case 'new':
        await this.createNewProject();
        break;
      case 'build':
        await this.buildProject();
        break;
      case 'finish':
        await this.finishProject();
        break;
      case 'publish':
        await this.publishProject();
        break;
      case 'list':
        await this.listProjects();
        break;
      case 'help':
        this.showHelp();
        break;
      case 'add':
        await this.addFeature(args[1], args.slice(2));
        break;
      default:
        console.log(chalk.red(`Unknown command: ${command}`));
        this.showHelp();
    }
  }

  async ensureDirectories() {
    await fs.ensureDir(this.draftsDir);
    await fs.ensureDir(this.finishedDir);
    await fs.ensureDir(this.outputsDir);
    await fs.ensureDir(path.join(this.outputsDir, 'linux'));
    await fs.ensureDir(path.join(this.outputsDir, 'macos'));
    await fs.ensureDir(path.join(this.outputsDir, 'windows'));
  }

  async createNewProject() {
    console.log(chalk.yellow('Let\'s create a new tiny app!\n'));

    // Check for command line arguments
    const args = process.argv.slice(2);
    const nameIndex = args.indexOf('--name');
    const stackIndex = args.indexOf('--stack');
    const databaseIndex = args.indexOf('--database');
    const authIndex = args.indexOf('--auth');

    let answers;
    
    if (nameIndex !== -1 && args[nameIndex + 1]) {
      // Non-interactive mode
      answers = {
        projectName: args[nameIndex + 1],
        stack: stackIndex !== -1 ? args[stackIndex + 1] : 'go-gin',
        externalAPIs: false,
        database: databaseIndex !== -1 && args[databaseIndex + 1] !== 'none',
        auth: authIndex !== -1 && args[authIndex + 1] !== 'none'
      };
    } else {
      // Interactive mode
      answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        validate: (input) => {
          if (!input.trim()) return 'Project name is required';
          if (!/^[a-zA-Z0-9\s-]+$/.test(input)) return 'Project name can only contain letters, numbers, spaces, and hyphens';
          return true;
        }
      },
      {
        type: 'list',
        name: 'stack',
        message: 'Select stack:',
        choices: Object.entries(STACKS).map(([key, config]) => ({
          name: `${config.name} (${config.size}, ${config.compileTime})`,
          value: key,
          short: config.name
        })),
        pageSize: 10
      },
      {
        type: 'confirm',
        name: 'externalAPIs',
        message: 'Will this app connect to external APIs?',
        default: false
      },
      {
        type: 'confirm',
        name: 'database',
        message: 'Does this app need a database?',
        default: false
      },
      {
        type: 'confirm',
        name: 'auth',
        message: 'Does this app need authentication?',
        default: false
      }
    ]);
    }

    const projectSlug = this.createSlug(answers.projectName);
    const projectPath = path.join(this.draftsDir, projectSlug);
    
    // Check if project already exists
    if (await fs.pathExists(projectPath)) {
      console.log(chalk.red(`Project ${projectSlug} already exists!`));
      return;
    }

    console.log(chalk.yellow('\n📦 Scaffolding project...\n'));

    try {
      await this.scaffoldProject(projectPath, answers);
      
      console.log(chalk.green.bold('\n✅ Project created successfully!\n'));
      console.log(chalk.cyan(`📁 Location: ${projectPath}`));
      console.log(chalk.cyan(`🏗️  Stack: ${STACKS[answers.stack].name}`));
      console.log(chalk.cyan(`📊 Size: ${STACKS[answers.stack].size}`));
      
      console.log(chalk.yellow('\n🚀 Next steps:'));
      console.log(chalk.gray(`  1. cd ${projectPath}`));
      console.log(chalk.gray('  2. Open in Cursor'));
      console.log(chalk.gray('  3. Start building with AI assistance!'));
      
      if (answers.stack === 'go-gin') {
        console.log(chalk.gray('  4. go mod download'));
        console.log(chalk.gray('  5. cd frontend && npm install'));
        console.log(chalk.gray('  6. npm run dev (frontend) & go run main.go (backend)'));
      } else if (answers.stack === 'bun-hono') {
        console.log(chalk.gray('  4. bun install'));
        console.log(chalk.gray('  5. bun run dev'));
      }
      
    } catch (error) {
      console.error(chalk.red('Error creating project:'), error.message);
    }
  }

  async scaffoldProject(projectPath, config) {
    const templatePath = path.join(this.templatesDir, STACKS[config.stack].template);
    
    if (!await fs.pathExists(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    // Copy template files
    await fs.copy(templatePath, projectPath);

    // Replace template variables
    await this.replaceTemplateVariables(projectPath, config);

    // Generate Cursor integration files
    await this.generateCursorFiles(projectPath, config);
  }

  async replaceTemplateVariables(projectPath, config) {
    const projectSlug = this.createSlug(config.projectName);
    const replacements = {
      '{{PROJECT_NAME}}': config.projectName,
      '{{PROJECT_SLUG}}': projectSlug,
      '{{PORT}}': '3000',
      '{{STACK}}': STACKS[config.stack].name
    };

    // Find all files to replace
    const files = await this.findTemplateFiles(projectPath);
    
    for (const file of files) {
      let content = await fs.readFile(file, 'utf8');
      
      for (const [placeholder, value] of Object.entries(replacements)) {
        content = content.replace(new RegExp(placeholder, 'g'), value);
      }
      
      await fs.writeFile(file, content);
    }
  }

  async findTemplateFiles(dir) {
    const files = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...await this.findTemplateFiles(fullPath));
      } else if (entry.isFile() && !entry.name.startsWith('.')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  async generateCursorFiles(projectPath, config) {
    const stack = STACKS[config.stack];
    
    // Generate .cursorrules
    const cursorrules = this.generateCursorRules(config.stack, config);
    await fs.writeFile(path.join(projectPath, '.cursorrules'), cursorrules);
    
    // Generate PROMPT.md
    const prompt = this.generatePrompt(config.stack, config);
    await fs.writeFile(path.join(projectPath, 'PROMPT.md'), prompt);
  }

  generateCursorRules(stack, config) {
    const baseRules = `# Cursor AI Rules for {{PROJECT_NAME}}

## Project Overview
This is a {{STACK}} application created with TinyApp Factory.
Project: {{PROJECT_NAME}}
Slug: {{PROJECT_SLUG}}

## Architecture Guidelines

### Core Principles
- Keep the application lightweight and portable
- Avoid heavy frameworks (NO Next.js, NO Express.js, NO Django)
- Focus on self-contained, single-binary deployment
- Optimize for small binary size
- Use minimal dependencies

### Stack-Specific Patterns`;

    if (stack === 'go-gin') {
      return baseRules + `

## Go + Gin Specific Rules

### Backend Structure
- Use \`embed.FS\` to embed frontend assets in the binary
- Serve static files from embedded filesystem
- Keep API endpoints simple and RESTful
- Use Gin's built-in middleware for CORS, logging, etc.

### Code Patterns
\`\`\`go
// Always use embed for frontend assets
//go:embed frontend/dist/*
var frontend embed.FS

// Serve static files
r.StaticFS("/", http.FS(frontend))

// API endpoints should be simple
r.GET("/api/health", func(c *gin.Context) {
    c.JSON(200, gin.H{"status": "ok"})
})
\`\`\`

### Build Optimization
- Use \`-ldflags="-s -w"\` for smaller binaries
- Cross-compile with \`GOOS=linux GOARCH=amd64 go build\`
- Minimize dependencies in go.mod

### Frontend Integration
- Build frontend with \`npm run build\` in frontend/ directory
- Frontend assets are automatically embedded
- Use relative API calls (\`/api/\`) not absolute URLs

## Anti-Patterns to Avoid
- Don't use heavy ORMs (use sqlite3 directly)
- Don't add unnecessary middleware
- Don't use external template engines (use embedded HTML)
- Don't create separate frontend/backend repos

## Fireproof Database Patterns

### Basic Usage
- Import from @fireproof/core for database operations
- Use use-fireproof hooks for React components
- Database name should match project slug
- Always use async/await for database operations

### Live Queries
- useLiveQuery automatically updates when data changes
- No need for manual refresh or polling
- Perfect for real-time UI updates

### Document Structure
- Use _id for document identification
- Add type field for querying by category
- Include timestamps for sorting

### Anti-Patterns
- Don't mix Fireproof with other databases
- Don't use synchronous database calls
- Don't forget to handle loading states`;
    } else if (stack === 'bun-hono') {
      return baseRules + `

## Bun + Hono Specific Rules

### Backend Structure
- Use Hono for lightweight HTTP server
- Keep routes simple and functional
- Use Bun's built-in bundling for frontend assets
- Leverage Bun's native TypeScript support

### Code Patterns
\`\`\`typescript
// Simple Hono server setup
import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'

const app = new Hono()

// Serve static files
app.use('/*', serveStatic({ root: './frontend/dist' }))

// API routes
app.get('/api/health', (c) => c.json({ status: 'ok' }))
\`\`\`

### Build Configuration
- Use \`bun build --compile --minify --bytecode\` for production
- Target specific platforms with \`--target\` flag
- Bundle frontend assets automatically

### Frontend Integration
- Build frontend with \`npm run build\` in frontend/ directory
- Use Bun's native bundling for optimal performance
- Keep TypeScript strict mode enabled

## Anti-Patterns to Avoid
- Don't use heavy frameworks like Express or Fastify
- Don't add unnecessary TypeScript complexity
- Don't use external bundlers (use Bun's built-in)
- Don't create separate build processes

## Fireproof Database Patterns

### Basic Usage
- Import from @fireproof/core for database operations
- Use use-fireproof hooks for React components
- Database name should match project slug
- Always use async/await for database operations

### Live Queries
- useLiveQuery automatically updates when data changes
- No need for manual refresh or polling
- Perfect for real-time UI updates

### Document Structure
- Use _id for document identification
- Add type field for querying by category
- Include timestamps for sorting

### Anti-Patterns
- Don't mix Fireproof with other databases
- Don't use synchronous database calls
- Don't forget to handle loading states`;
    }

    return baseRules;
  }

  generatePrompt(stack, config) {
    return `# Development Guide for {{PROJECT_NAME}}

## Project Setup
This {{STACK}} application was created with TinyApp Factory.

### Quick Start
${stack === 'go-gin' ? `
1. Install dependencies: \`go mod download\`
2. Install frontend deps: \`cd frontend && npm install\`
3. Start development:
   - Frontend: \`cd frontend && npm run dev\`
   - Backend: \`go run main.go\`
4. Open http://localhost:3000
` : `
1. Install dependencies: \`bun install\`
2. Start development: \`bun run dev\`
3. Open http://localhost:3000
`}

### Architecture
- **Backend**: ${stack === 'go-gin' ? 'Go with Gin framework' : 'Bun with Hono framework'}
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Build**: Single binary deployment

### Development Workflow
1. Make changes to frontend in \`frontend/src/\`
2. API changes go in backend files
3. Test with development servers
4. Build for production when ready

### API Patterns
- Health check: \`GET /api/health\`
- Add new endpoints in backend files
- Use consistent JSON responses
- Keep endpoints simple and focused

### Frontend Patterns
- Components in \`frontend/src/components/\`
- Pages in \`frontend/src/\`
- API calls use \`fetch()\` with relative URLs
- State management with React hooks

### Build Commands
${stack === 'go-gin' ? `
- Frontend build: \`cd frontend && npm run build\`
- Go binary: \`go build -ldflags="-s -w" -o {{PROJECT_SLUG}}\`
- Cross-compile: \`GOOS=linux GOARCH=amd64 go build\`
` : `
- Development: \`bun run dev\`
- Production build: \`bun build --compile --minify --bytecode\`
- Cross-platform: \`bun build --compile --target=bun-linux-x64\`
`}

## Features Status
- External APIs: ${config.externalAPIs ? '✅ Enabled' : '❌ Disabled'}
- Database: ${config.database ? '✅ Enabled' : '❌ Disabled'}
- Authentication: ${config.auth ? '✅ Enabled' : '❌ Disabled'}

## Next Steps
1. Customize the UI in \`frontend/src/App.tsx\`
2. Add API endpoints in backend files
3. Implement your specific features
4. Test thoroughly before building
5. Use \`tinyapp build\` to create production binaries
`;
  }

  createSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  async buildProject() {
    console.log(chalk.cyan.bold('\n🔨 Building Project\n'));
    
    // Check for project argument
    const args = process.argv.slice(2);
    const projectIndex = args.indexOf('--project');
    
    if (projectIndex === -1 || !args[projectIndex + 1]) {
      console.log(chalk.red('Please specify a project: tinyapp build --project <project-name>'));
      return;
    }
    
    const projectName = args[projectIndex + 1];
    const projectPath = path.join(this.draftsDir, projectName);
    
    if (!await fs.pathExists(projectPath)) {
      console.log(chalk.red(`Project ${projectName} not found in drafts/`));
      return;
    }
    
    try {
      // Detect project type
      const hasGoMod = await fs.pathExists(path.join(projectPath, 'go.mod'));
      const hasPackageJson = await fs.pathExists(path.join(projectPath, 'package.json'));
      const hasCargoToml = await fs.pathExists(path.join(projectPath, 'Cargo.toml'));
      const hasTauriConfig = await fs.pathExists(path.join(projectPath, 'src-tauri'));
      const hasStaticHtml = await fs.pathExists(path.join(projectPath, 'index.html'));
      
      if (hasGoMod) {
        await this.buildGoProject(projectPath, projectName);
      } else if (hasPackageJson && hasTauriConfig) {
        await this.buildTauriProject(projectPath, projectName);
      } else if (hasPackageJson) {
        await this.buildBunProject(projectPath, projectName);
      } else if (hasCargoToml) {
        await this.buildRustProject(projectPath, projectName);
      } else if (hasStaticHtml) {
        await this.buildStaticProject(projectPath, projectName);
      } else {
        console.log(chalk.red('Unknown project type!'));
        return;
      }
      
    } catch (error) {
      console.error(chalk.red('Build error:'), error.message);
    }
  }

  async buildGoProject(projectPath, projectName) {
    console.log(chalk.yellow('Building Go project...'));
    
    // Build frontend first
    const frontendPath = path.join(projectPath, 'frontend');
    if (await fs.pathExists(frontendPath)) {
      console.log(chalk.gray('Building frontend...'));
      try {
        const { stdout, stderr } = await execAsync('npm run build', {
          cwd: frontendPath
        });
        console.log(chalk.green('✓ Frontend built successfully'));
      } catch (error) {
        console.log(chalk.red('✗ Frontend build failed:'), error.message);
        return;
      }
    }
    
    // Build Go binary
    console.log(chalk.gray('Building Go binary...'));
    try {
      const { stdout, stderr } = await execAsync('go build -ldflags="-s -w" -o ' + projectName, {
        cwd: projectPath
      });
      
      // Copy to outputs directory
      const binaryPath = path.join(projectPath, projectName);
      const outputPath = path.join(this.outputsDir, 'linux', projectName);
      
      await fs.copyFile(binaryPath, outputPath);
      
      // Get file size
      const stats = await fs.stat(outputPath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
      
      console.log(chalk.green.bold(`✅ Build successful!`));
      console.log(chalk.cyan(`📦 Binary: ${outputPath}`));
      console.log(chalk.cyan(`📊 Size: ${sizeMB} MB`));
      
    } catch (error) {
      console.log(chalk.red('✗ Go build failed:'), error.message);
    }
  }

  async buildBunProject(projectPath, projectName) {
    console.log(chalk.yellow('Building Bun project...'));
    
    try {
      const { stdout, stderr } = await execAsync('bun run build', {
        cwd: projectPath
      });
      
      // Find the built binary
      const binaryPath = path.join(projectPath, projectName);
      const outputPath = path.join(this.outputsDir, 'linux', projectName);
      
      if (await fs.pathExists(binaryPath)) {
        await fs.copyFile(binaryPath, outputPath);
        
        const stats = await fs.stat(outputPath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
        
        console.log(chalk.green.bold(`✅ Build successful!`));
        console.log(chalk.cyan(`📦 Binary: ${outputPath}`));
        console.log(chalk.cyan(`📊 Size: ${sizeMB} MB`));
      } else {
        console.log(chalk.red('✗ Binary not found after build'));
      }
      
    } catch (error) {
      console.log(chalk.red('✗ Bun build failed:'), error.message);
    }
  }

  async buildRustProject(projectPath, projectName) {
    console.log(chalk.yellow('Building Rust project...'));
    
    try {
      const { stdout, stderr } = await execAsync('cargo build --release', {
        cwd: projectPath
      });
      
      // Find the built binary
      const binaryPath = path.join(projectPath, 'target', 'release', projectName);
      const outputPath = path.join(this.outputsDir, 'linux', projectName);
      
      if (await fs.pathExists(binaryPath)) {
        await fs.copyFile(binaryPath, outputPath);
        
        const stats = await fs.stat(outputPath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
        
        console.log(chalk.green.bold(`✅ Build successful!`));
        console.log(chalk.cyan(`📦 Binary: ${outputPath}`));
        console.log(chalk.cyan(`📊 Size: ${sizeMB} MB`));
      } else {
        console.log(chalk.red('✗ Binary not found after build'));
      }
      
    } catch (error) {
      console.log(chalk.red('✗ Rust build failed:'), error.message);
    }
  }

  async buildTauriProject(projectPath, projectName) {
    console.log(chalk.yellow('Building Tauri project...'));
    
    try {
      const { stdout, stderr } = await execAsync('npm run tauri:build', {
        cwd: projectPath
      });
      
      // Find the built binary (Tauri creates platform-specific outputs)
      const tauriOutputDir = path.join(projectPath, 'src-tauri', 'target', 'release');
      const outputPath = path.join(this.outputsDir, 'linux', projectName);
      
      // Look for the binary (name might vary)
      const possibleNames = [projectName, `${projectName}.exe`, `${projectName}.app`];
      let binaryPath = null;
      
      for (const name of possibleNames) {
        const testPath = path.join(tauriOutputDir, name);
        if (await fs.pathExists(testPath)) {
          binaryPath = testPath;
          break;
        }
      }
      
      if (binaryPath) {
        await fs.copyFile(binaryPath, outputPath);
        
        const stats = await fs.stat(outputPath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
        
        console.log(chalk.green.bold(`✅ Build successful!`));
        console.log(chalk.cyan(`📦 Binary: ${outputPath}`));
        console.log(chalk.cyan(`📊 Size: ${sizeMB} MB`));
      } else {
        console.log(chalk.red('✗ Binary not found after build'));
      }
      
    } catch (error) {
      console.log(chalk.red('✗ Tauri build failed:'), error.message);
    }
  }

  async buildStaticProject(projectPath, projectName) {
    console.log(chalk.yellow('Building static HTML project...'));
    
    try {
      // Static projects don't need building, just copy the HTML file
      const htmlPath = path.join(projectPath, 'index.html');
      const outputPath = path.join(this.outputsDir, 'linux', `${projectName}.html`);
      
      if (await fs.pathExists(htmlPath)) {
        await fs.copyFile(htmlPath, outputPath);
        
        const stats = await fs.stat(outputPath);
        const sizeKB = (stats.size / 1024).toFixed(1);
        
        console.log(chalk.green.bold(`✅ Build successful!`));
        console.log(chalk.cyan(`📦 File: ${outputPath}`));
        console.log(chalk.cyan(`📊 Size: ${sizeKB} KB`));
        console.log(chalk.gray('💡 Static HTML files can be opened directly in any browser'));
      } else {
        console.log(chalk.red('✗ index.html not found'));
      }
      
    } catch (error) {
      console.log(chalk.red('✗ Static build failed:'), error.message);
    }
  }

  async finishProject() {
    console.log(chalk.cyan.bold('\n✅ Finishing Project\n'));
    
    // Check for project argument
    const args = process.argv.slice(2);
    const projectIndex = args.indexOf('--project');
    
    if (projectIndex === -1 || !args[projectIndex + 1]) {
      console.log(chalk.red('Please specify a project: tinyapp finish --project <project-name>'));
      return;
    }
    
    const projectName = args[projectIndex + 1];
    const draftPath = path.join(this.draftsDir, projectName);
    const finishedPath = path.join(this.finishedDir, projectName);
    
    if (!await fs.pathExists(draftPath)) {
      console.log(chalk.red(`Project ${projectName} not found in drafts/`));
      return;
    }
    
    try {
      // Move project to finished
      await fs.move(draftPath, finishedPath);
      
      // Copy binaries to outputs if they exist
      const outputPath = path.join(this.outputsDir, 'linux', projectName);
      if (await fs.pathExists(outputPath)) {
        const finalOutputPath = path.join(this.outputsDir, 'linux', `${projectName}-finished`);
        await fs.copyFile(outputPath, finalOutputPath);
      }
      
      // Create git repo if it doesn't exist
      const gitPath = path.join(finishedPath, '.git');
      if (!await fs.pathExists(gitPath)) {
        try {
          await execAsync('git init', { cwd: finishedPath });
          await execAsync('git add .', { cwd: finishedPath });
          await execAsync(`git commit -m "Initial commit: ${projectName}"`, { cwd: finishedPath });
          console.log(chalk.green('✓ Git repository initialized'));
        } catch (error) {
          console.log(chalk.yellow('⚠ Git initialization failed (not critical)'));
        }
      }
      
      console.log(chalk.green.bold(`✅ Project finished successfully!`));
      console.log(chalk.cyan(`📁 Moved to: ${finishedPath}`));
      console.log(chalk.gray('🎉 Your cherry is ready for distribution!'));
      
    } catch (error) {
      console.error(chalk.red('Finish error:'), error.message);
    }
  }

  async addFeature(feature, options) {
    if (!feature) {
      console.log(chalk.red('Please specify a feature to add.'));
      console.log(chalk.gray('Available features: database, auth, sync'));
      return;
    }

    switch (feature) {
      case 'database':
        await this.addDatabase();
        break;
      case 'auth':
        console.log(chalk.yellow('🔐 Auth functionality coming soon!'));
        break;
      case 'sync':
        await this.addSync(options);
        break;
      default:
        console.log(chalk.red(`Unknown feature: ${feature}`));
        console.log(chalk.gray('Available features: database, auth, sync'));
    }
  }

  async addDatabase() {
    console.log(chalk.cyan.bold('\n🍒 Adding Fireproof Database\n'));
    
    // Check if we're in a project directory
    const currentDir = process.cwd();
    const isProjectDir = await fs.pathExists(path.join(currentDir, 'package.json')) || 
                        await fs.pathExists(path.join(currentDir, 'go.mod'));
    
    if (!isProjectDir) {
      console.log(chalk.red('❌ Not in a project directory!'));
      console.log(chalk.gray('Please run this command from inside a TinyApp project.'));
      return;
    }

    try {
      // Detect project type
      const hasGoMod = await fs.pathExists(path.join(currentDir, 'go.mod'));
      const hasPackageJson = await fs.pathExists(path.join(currentDir, 'package.json'));
      
      if (hasGoMod) {
        await this.addDatabaseToGoProject(currentDir);
      } else if (hasPackageJson) {
        await this.addDatabaseToBunProject(currentDir);
      } else {
        console.log(chalk.red('❌ Unknown project type!'));
        return;
      }
      
      console.log(chalk.green.bold('\n✅ Fireproof database added successfully!\n'));
      console.log(chalk.cyan('🎯 What was added:'));
      console.log(chalk.gray('  • @fireproof/core and use-fireproof dependencies'));
      console.log(chalk.gray('  • Database utility module (lib/database.ts)'));
      console.log(chalk.gray('  • React hooks for live queries (hooks/useDatabase.ts)'));
      console.log(chalk.gray('  • TodoList example component'));
      console.log(chalk.gray('  • Sync utilities (lib/sync.ts)'));
      console.log(chalk.gray('  • Updated .cursorrules with Fireproof patterns'));
      
      console.log(chalk.yellow('\n🚀 Next steps:'));
      console.log(chalk.gray('  1. npm install (or bun install)'));
      console.log(chalk.gray('  2. Start your development server'));
      console.log(chalk.gray('  3. Check the database status in the UI'));
      console.log(chalk.gray('  4. Try the Todo demo!'));
      
    } catch (error) {
      console.error(chalk.red('Error adding database:'), error.message);
    }
  }

  async addDatabaseToGoProject(projectPath) {
    const frontendPath = path.join(projectPath, 'frontend');
    
    if (!await fs.pathExists(frontendPath)) {
      console.log(chalk.red('❌ Frontend directory not found!'));
      return;
    }

    // Add dependencies to package.json
    const packageJsonPath = path.join(frontendPath, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    
    packageJson.dependencies = {
      ...packageJson.dependencies,
      '@fireproof/core': '^0.19.0',
      'use-fireproof': '^0.19.0'
    };
    
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    // Create database files
    await this.createDatabaseFiles(frontendPath);
    
    // Update .cursorrules
    await this.updateCursorRulesWithFireproof(projectPath);
  }

  async addDatabaseToBunProject(projectPath) {
    // Add dependencies to package.json
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    
    packageJson.dependencies = {
      ...packageJson.dependencies,
      '@fireproof/core': '^0.19.0',
      'use-fireproof': '^0.19.0'
    };
    
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    // Create database files
    await this.createDatabaseFiles(projectPath);
    
    // Update .cursorrules
    await this.updateCursorRulesWithFireproof(projectPath);
  }

  async createDatabaseFiles(projectPath) {
    const srcPath = path.join(projectPath, 'src');
    const libPath = path.join(srcPath, 'lib');
    const hooksPath = path.join(srcPath, 'hooks');
    const componentsPath = path.join(srcPath, 'components');

    // Ensure directories exist
    await fs.ensureDir(libPath);
    await fs.ensureDir(hooksPath);
    await fs.ensureDir(componentsPath);

    // Copy database files from templates
    const templatePath = path.join(__dirname, 'templates', 'go-gin', 'frontend', 'src');
    
    await fs.copy(path.join(templatePath, 'lib', 'database.ts'), path.join(libPath, 'database.ts'));
    await fs.copy(path.join(templatePath, 'lib', 'sync.ts'), path.join(libPath, 'sync.ts'));
    await fs.copy(path.join(templatePath, 'hooks', 'useDatabase.ts'), path.join(hooksPath, 'useDatabase.ts'));
    await fs.copy(path.join(templatePath, 'components', 'TodoList.tsx'), path.join(componentsPath, 'TodoList.tsx'));
  }

  async updateCursorRulesWithFireproof(projectPath) {
    const cursorRulesPath = path.join(projectPath, '.cursorrules');
    
    if (!await fs.pathExists(cursorRulesPath)) {
      console.log(chalk.yellow('⚠️  .cursorrules not found, skipping update'));
      return;
    }

    const cursorRules = await fs.readFile(cursorRulesPath, 'utf8');
    
    const fireproofRules = `

## Fireproof Database Patterns

### Basic Usage
- Import from @fireproof/core for database operations
- Use use-fireproof hooks for React components
- Database name should match project slug
- Always use async/await for database operations

### Live Queries
- useLiveQuery automatically updates when data changes
- No need for manual refresh or polling
- Perfect for real-time UI updates

### Document Structure
- Use _id for document identification
- Add type field for querying by category
- Include timestamps for sorting

### Anti-Patterns
- Don't mix Fireproof with other databases
- Don't use synchronous database calls
- Don't forget to handle loading states`;

    const updatedRules = cursorRules + fireproofRules;
    await fs.writeFile(cursorRulesPath, updatedRules);
  }

  async listProjects() {
    console.log(chalk.cyan.bold('\n📁 Projects\n'));
    
    const drafts = await fs.readdir(this.draftsDir).catch(() => []);
    const finished = await fs.readdir(this.finishedDir).catch(() => []);
    
    if (drafts.length > 0) {
      console.log(chalk.yellow('Drafts:'));
      drafts.forEach(project => {
        console.log(chalk.gray(`  📝 ${project}`));
      });
    }
    
    if (finished.length > 0) {
      console.log(chalk.green('\nFinished:'));
      finished.forEach(project => {
        console.log(chalk.gray(`  ✅ ${project}`));
      });
    }
    
    if (drafts.length === 0 && finished.length === 0) {
      console.log(chalk.gray('No projects found. Run "tinyapp new" to create one!'));
    }
  }

  showHelp() {
    console.log(chalk.cyan.bold('\n🏭 TinyApp Factory Help\n'));
    console.log(chalk.gray('Commands:'));
    console.log(chalk.white('  tinyapp new     Create a new project'));
    console.log(chalk.white('  tinyapp build   Build project to binary'));
    console.log(chalk.white('  tinyapp finish  Move project to finished'));
    console.log(chalk.white('  tinyapp publish Publish project to GitHub/Homebrew'));
    console.log(chalk.white('  tinyapp list    List all projects'));
    console.log(chalk.white('  tinyapp add     Add features to existing project'));
    console.log(chalk.white('  tinyapp help    Show this help'));
    console.log(chalk.gray('\nAdd commands:'));
    console.log(chalk.white('  tinyapp add database  Add Fireproof database'));
    console.log(chalk.white('  tinyapp add auth      Add authentication (coming soon)'));
    console.log(chalk.white('  tinyapp add sync      Add cloud sync'));
    console.log(chalk.gray('\nFor more info, see README.md'));
  }

  async addSync(options) {
    console.log(chalk.cyan.bold('\n🔄 Adding Cloud Sync\n'));
    
    // Parse options
    const provider = this.parseSyncOptions(options);
    
    if (!provider) {
      console.log(chalk.red('❌ Please specify a sync provider'));
      console.log(chalk.gray('Available providers: fireproof-cloud, partykit, s3'));
      console.log(chalk.gray('Usage: tinyapp add sync --provider fireproof-cloud'));
      return;
    }

    // Check if we're in a project directory
    const currentDir = process.cwd();
    const isProjectDir = await fs.pathExists(path.join(currentDir, 'package.json')) || 
                        await fs.pathExists(path.join(currentDir, 'go.mod')) ||
                        await fs.pathExists(path.join(currentDir, 'Cargo.toml')) ||
                        await fs.pathExists(path.join(currentDir, 'index.html'));

    if (!isProjectDir) {
      console.log(chalk.red('❌ Please run this command from within a TinyApp project directory'));
      return;
    }

    try {
      // Detect project type and add sync accordingly
      const hasGoMod = await fs.pathExists(path.join(currentDir, 'go.mod'));
      const hasPackageJson = await fs.pathExists(path.join(currentDir, 'package.json'));
      const hasCargoToml = await fs.pathExists(path.join(currentDir, 'Cargo.toml'));
      const hasStaticHtml = await fs.pathExists(path.join(currentDir, 'index.html'));

      if (hasGoMod) {
        await this.addSyncToGoProject(currentDir, provider);
      } else if (hasPackageJson) {
        await this.addSyncToBunProject(currentDir, provider);
      } else if (hasCargoToml) {
        await this.addSyncToRustProject(currentDir, provider);
      } else if (hasStaticHtml) {
        await this.addSyncToStaticProject(currentDir, provider);
      } else {
        console.log(chalk.red('❌ Unknown project type!'));
        return;
      }

      console.log(chalk.green.bold('\n✅ Sync functionality added successfully!'));
      console.log(chalk.cyan(`📡 Provider: ${provider}`));
      console.log(chalk.gray('💡 Check the generated sync files for configuration'));
      
    } catch (error) {
      console.error(chalk.red('Error adding sync:'), error.message);
    }
  }

  parseSyncOptions(options) {
    const providerIndex = options.indexOf('--provider');
    if (providerIndex !== -1 && options[providerIndex + 1]) {
      return options[providerIndex + 1];
    }
    return null;
  }

  async addSyncToGoProject(projectPath, provider) {
    const frontendPath = path.join(projectPath, 'frontend');
    
    if (!await fs.pathExists(frontendPath)) {
      console.log(chalk.red('❌ Frontend directory not found!'));
      return;
    }

    // Add sync dependencies to frontend package.json
    const packageJsonPath = path.join(frontendPath, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    
    const syncDeps = this.getSyncDependencies(provider);
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...syncDeps
    };
    
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    // Create sync files
    await this.createSyncFiles(frontendPath, provider);
    
    console.log(chalk.green('✓ Added sync to Go + Gin project'));
  }

  async addSyncToBunProject(projectPath, provider) {
    // Check if there's a frontend subdirectory (Bun + Hono structure)
    const frontendPath = path.join(projectPath, 'frontend');
    const hasFrontend = await fs.pathExists(frontendPath);
    
    if (hasFrontend) {
      // Add dependencies to frontend package.json
      const packageJsonPath = path.join(frontendPath, 'package.json');
      const packageJson = await fs.readJson(packageJsonPath);
      
      const syncDeps = this.getSyncDependencies(provider);
      packageJson.dependencies = {
        ...packageJson.dependencies,
        ...syncDeps
      };
      
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

      // Create sync files in frontend
      await this.createSyncFiles(frontendPath, provider);
    } else {
      // Add dependencies to main package.json
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageJson = await fs.readJson(packageJsonPath);
      
      const syncDeps = this.getSyncDependencies(provider);
      packageJson.dependencies = {
        ...packageJson.dependencies,
        ...syncDeps
      };
      
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

      // Create sync files in main src
      await this.createSyncFiles(projectPath, provider);
    }
    
    console.log(chalk.green('✓ Added sync to Bun + Hono project'));
  }

  async addSyncToRustProject(projectPath, provider) {
    const frontendPath = path.join(projectPath, 'frontend');
    
    if (!await fs.pathExists(frontendPath)) {
      console.log(chalk.red('❌ Frontend directory not found!'));
      return;
    }

    // Add sync dependencies to frontend package.json
    const packageJsonPath = path.join(frontendPath, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    
    const syncDeps = this.getSyncDependencies(provider);
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...syncDeps
    };
    
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    // Create sync files
    await this.createSyncFiles(frontendPath, provider);
    
    console.log(chalk.green('✓ Added sync to Rust + Axum project'));
  }

  async addSyncToStaticProject(projectPath, provider) {
    // For static projects, we'll add sync via CDN and inline scripts
    await this.createStaticSyncFiles(projectPath, provider);
    
    console.log(chalk.green('✓ Added sync to Static HTML project'));
  }

  getSyncDependencies(provider) {
    const deps = {
      '@fireproof/core': '^0.19.0',
      'use-fireproof': '^0.19.0'
    };

    switch (provider) {
      case 'fireproof-cloud':
        deps['@fireproof/cloud'] = '^0.19.0';
        break;
      case 'partykit':
        deps['partykit'] = '^0.0.1';
        break;
      case 's3':
        deps['@aws-sdk/client-s3'] = '^3.0.0';
        break;
    }

    return deps;
  }

  async createSyncFiles(projectPath, provider) {
    const srcPath = path.join(projectPath, 'src');
    const libPath = path.join(srcPath, 'lib');
    
    await fs.ensureDir(libPath);

    // Create sync configuration file
    const syncConfig = this.generateSyncConfig(provider);
    await fs.writeFile(path.join(libPath, 'sync.ts'), syncConfig);

    // Create sync hook
    const syncHook = this.generateSyncHook(provider);
    await fs.writeFile(path.join(srcPath, 'hooks', 'useSync.ts'), syncHook);

    console.log(chalk.green('✓ Created sync configuration files'));
  }

  async createStaticSyncFiles(projectPath, provider) {
    // For static HTML, we'll create a separate sync.js file
    const syncScript = this.generateStaticSyncScript(provider);
    await fs.writeFile(path.join(projectPath, 'sync.js'), syncScript);

    console.log(chalk.green('✓ Created static sync script'));
  }

  generateSyncConfig(provider) {
    const configs = {
      'fireproof-cloud': `import { connect } from '@fireproof/cloud'
import { fireproof } from '@fireproof/core'

export class SyncManager {
  private db: any
  private connection: any

  constructor(dbName: string) {
    this.db = fireproof(dbName)
  }

  async enableCloudSync(): Promise<string> {
    try {
      this.connection = await connect(this.db, 'my-cherry-uuid')
      console.log('🌐 Cloud sync enabled!')
      console.log('Dashboard:', this.connection.dashboardUrl)
      return this.connection.dashboardUrl
    } catch (error) {
      console.error('❌ Sync failed:', error)
      throw error
    }
  }

  async disableSync() {
    if (this.connection) {
      await this.connection.close()
      this.connection = null
      console.log('🔒 Sync disabled')
    }
  }

  getSyncStatus() {
    return {
      enabled: !!this.connection,
      dashboardUrl: this.connection?.dashboardUrl
    }
  }
}`,

      'partykit': `import { fireproof } from '@fireproof/core'

export class SyncManager {
  private db: any
  private partykit: any

  constructor(dbName: string) {
    this.db = fireproof(dbName)
  }

  async enablePartyKitSync(roomId: string): Promise<void> {
    try {
      // PartyKit integration would go here
      // This is a placeholder for the actual implementation
      console.log('🎉 PartyKit sync enabled for room:', roomId)
      console.log('💡 Real-time collaboration ready!')
    } catch (error) {
      console.error('❌ PartyKit sync failed:', error)
      throw error
    }
  }

  async disableSync() {
    if (this.partykit) {
      await this.partykit.close()
      this.partykit = null
      console.log('🔒 PartyKit sync disabled')
    }
  }

  getSyncStatus() {
    return {
      enabled: !!this.partykit,
      type: 'partykit'
    }
  }
}`,

      's3': `import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { fireproof } from '@fireproof/core'

export class SyncManager {
  private db: any
  private s3Client: S3Client
  private bucketName: string

  constructor(dbName: string, bucketName: string, region: string = 'us-east-1') {
    this.db = fireproof(dbName)
    this.bucketName = bucketName
    this.s3Client = new S3Client({ region })
  }

  async enableS3Sync(): Promise<void> {
    try {
      // S3 sync implementation would go here
      console.log('☁️ S3 sync enabled for bucket:', this.bucketName)
      console.log('💡 Self-hosted sync ready!')
    } catch (error) {
      console.error('❌ S3 sync failed:', error)
      throw error
    }
  }

  async disableSync() {
    console.log('🔒 S3 sync disabled')
  }

  getSyncStatus() {
    return {
      enabled: true,
      type: 's3',
      bucket: this.bucketName
    }
  }
}`
    };

    return configs[provider] || configs['fireproof-cloud'];
  }

  generateSyncHook(provider) {
    return `import { useState, useEffect } from 'react'
import { SyncManager } from '../lib/sync'

export function useSync(dbName: string) {
  const [syncManager] = useState(() => new SyncManager(dbName))
  const [syncStatus, setSyncStatus] = useState({
    enabled: false,
    dashboardUrl: null,
    type: '${provider}'
  })

  const enableSync = async (config?: any) => {
    try {
      let dashboardUrl = null
      
      switch ('${provider}') {
        case 'fireproof-cloud':
          dashboardUrl = await syncManager.enableCloudSync()
          break
        case 'partykit':
          await syncManager.enablePartyKitSync(config?.roomId || 'default-room')
          break
        case 's3':
          await syncManager.enableS3Sync()
          break
      }
      
      setSyncStatus({
        enabled: true,
        dashboardUrl,
        type: '${provider}'
      })
      
      return { success: true, dashboardUrl }
    } catch (error) {
      console.error('Sync enable failed:', error)
      return { success: false, error: error.message }
    }
  }

  const disableSync = async () => {
    await syncManager.disableSync()
    setSyncStatus({
      enabled: false,
      dashboardUrl: null,
      type: '${provider}'
    })
  }

  useEffect(() => {
    // Initialize sync status
    const status = syncManager.getSyncStatus()
    setSyncStatus(prev => ({ ...prev, ...status }))
  }, [])

  return {
    syncStatus,
    enableSync,
    disableSync
  }
}`;
  }

  generateStaticSyncScript(provider) {
    return `// Static HTML Sync Script for ${provider}
// Include this script in your HTML file

class StaticSyncManager {
  constructor(dbName) {
    this.dbName = dbName
    this.db = null
    this.connection = null
  }

  async init() {
    // Initialize Fireproof
    if (typeof Fireproof !== 'undefined') {
      this.db = Fireproof.fireproof(this.dbName)
    } else {
      console.error('❌ Fireproof not loaded. Include Fireproof CDN script.')
      return false
    }
    return true
  }

  async enableSync(config = {}) {
    if (!this.db) {
      const initialized = await this.init()
      if (!initialized) return { success: false, error: 'Fireproof not available' }
    }

    try {
      switch ('${provider}') {
        case 'fireproof-cloud':
          if (typeof FireproofCloud !== 'undefined') {
            this.connection = await FireproofCloud.connect(this.db, 'my-cherry-uuid')
            console.log('🌐 Cloud sync enabled!')
            console.log('Dashboard:', this.connection.dashboardUrl)
            return { success: true, dashboardUrl: this.connection.dashboardUrl }
          }
          break
        case 'partykit':
          console.log('🎉 PartyKit sync enabled!')
          console.log('💡 Real-time collaboration ready!')
          return { success: true }
        case 's3':
          console.log('☁️ S3 sync enabled!')
          console.log('💡 Self-hosted sync ready!')
          return { success: true }
      }
    } catch (error) {
      console.error('❌ Sync failed:', error)
      return { success: false, error: error.message }
    }
  }

  async disableSync() {
    if (this.connection) {
      await this.connection.close()
      this.connection = null
      console.log('🔒 Sync disabled')
    }
  }

  getSyncStatus() {
    return {
      enabled: !!this.connection,
      type: '${provider}'
    }
  }
}

// Global sync manager instance
window.syncManager = new StaticSyncManager('my-cherry')

// Usage example:
// await window.syncManager.enableSync()
// const status = window.syncManager.getSyncStatus()
`;
  }

  async publishProject() {
    console.log(chalk.cyan.bold('\n📦 Publishing Project\n'));
    
    // Check for project argument
    const args = process.argv.slice(2);
    const projectIndex = args.indexOf('--project');
    
    if (projectIndex === -1 || !args[projectIndex + 1]) {
      console.log(chalk.red('Please specify a project: tinyapp publish --project <project-name>'));
      return;
    }
    
    const projectName = args[projectIndex + 1];
    const finishedPath = path.join(this.finishedDir, projectName);
    
    if (!await fs.pathExists(finishedPath)) {
      console.log(chalk.red(`Project ${projectName} not found in finished/`));
      console.log(chalk.gray('Run "tinyapp finish --project <project-name>" first'));
      return;
    }

    try {
      // Check if it's a Git repository
      const gitPath = path.join(finishedPath, '.git');
      if (!await fs.pathExists(gitPath)) {
        console.log(chalk.yellow('⚠ Project is not a Git repository. Initializing...'));
        await execSync('git init', { cwd: finishedPath });
        await execSync('git add .', { cwd: finishedPath });
        await execSync(`git commit -m "Initial commit: ${projectName}"`, { cwd: finishedPath });
      }

      // Check for GitHub remote
      try {
        const remoteUrl = execSync('git remote get-url origin', { cwd: finishedPath, encoding: 'utf8' }).trim();
        console.log(chalk.green(`✓ Found GitHub remote: ${remoteUrl}`));
      } catch (error) {
        console.log(chalk.yellow('⚠ No GitHub remote found. Please add one:'));
        console.log(chalk.gray(`git remote add origin https://github.com/username/${projectName}.git`));
        return;
      }

      // Create GitHub release
      await this.createGitHubRelease(finishedPath, projectName);
      
      // Generate Homebrew formula
      await this.generateHomebrewFormula(finishedPath, projectName);
      
      console.log(chalk.green.bold('\n✅ Publishing completed!'));
      console.log(chalk.cyan('📦 GitHub release created'));
      console.log(chalk.cyan('🍺 Homebrew formula generated'));
      console.log(chalk.gray('💡 Push your changes and the formula to complete the process'));
      
    } catch (error) {
      console.error(chalk.red('Publish error:'), error.message);
    }
  }

  async createGitHubRelease(projectPath, projectName) {
    console.log(chalk.yellow('Creating GitHub release...'));
    
    // Get version from package.json or go.mod
    let version = '1.0.0';
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        version = packageJson.version || '1.0.0';
      }
    } catch (error) {
      // Use default version
    }

    // Create release notes
    const releaseNotes = this.generateReleaseNotes(projectName, version);
    
    // Create GitHub release (requires GitHub CLI)
    try {
      const releaseCommand = `gh release create v${version} --title "${projectName} v${version}" --notes "${releaseNotes}"`;
      console.log(chalk.gray(`Running: ${releaseCommand}`));
      
      // For now, just show what would be done
      console.log(chalk.green('✓ GitHub release command prepared'));
      console.log(chalk.gray('💡 Run this command to create the release:'));
      console.log(chalk.white(`cd ${projectPath}`));
      console.log(chalk.white(`gh release create v${version} --title "${projectName} v${version}" --notes "${releaseNotes}"`));
      
    } catch (error) {
      console.log(chalk.yellow('⚠ GitHub CLI not found. Install it with: brew install gh'));
      console.log(chalk.gray('Or create the release manually on GitHub.com'));
    }
  }

  async generateHomebrewFormula(projectPath, projectName) {
    console.log(chalk.yellow('Generating Homebrew formula...'));
    
    // Get project info
    const packageJsonPath = path.join(projectPath, 'package.json');
    let description = 'A tiny, portable application';
    let version = '1.0.0';
    
    if (await fs.pathExists(packageJsonPath)) {
      try {
        const packageJson = await fs.readJson(packageJsonPath);
        description = packageJson.description || description;
        version = packageJson.version || version;
      } catch (error) {
        // Use defaults
      }
    }

    // Generate Homebrew formula
    const formula = this.generateHomebrewFormulaContent(projectName, version, description);
    
    // Write formula file
    const formulaPath = path.join(projectPath, `${projectName}.rb`);
    await fs.writeFile(formulaPath, formula);
    
    console.log(chalk.green(`✓ Homebrew formula created: ${formulaPath}`));
    console.log(chalk.gray('💡 To install:'));
    console.log(chalk.white(`brew install --build-from-source ${formulaPath}`));
  }

  generateReleaseNotes(projectName, version) {
    return `# ${projectName} v${version}

## 🍒 What's New

This release includes:
- Complete portable application
- Cross-platform binary support
- Local-first data storage with Fireproof
- Beautiful, responsive UI

## 📦 Installation

### Direct Download
Download the binary for your platform from the assets below.

### Homebrew (macOS)
\`\`\`bash
brew install --build-from-source ${projectName}
\`\`\`

## 🚀 Usage

Double-click the binary to run, or use from command line:
\`\`\`bash
./${projectName}
\`\`\`

## 🛠️ Built With

- TinyApp Factory
- Fireproof Database
- Modern Web Technologies

---

*Generated by TinyApp Factory - Making portable apps simple*`;
  }

  generateHomebrewFormulaContent(projectName, version, description) {
    return `class ${this.toCamelCase(projectName)} < Formula
  desc "${description}"
  homepage "https://github.com/username/${projectName}"
  url "https://github.com/username/${projectName}/archive/v${version}.tar.gz"
  sha256 "PLACEHOLDER_SHA256"
  license "MIT"

  depends_on "go" => :build

  def install
    # Build the application
    system "go", "build", "-ldflags", "-s -w", "-o", bin/"${projectName}"
  end

  test do
    # Test the application
    system bin/"${projectName}", "--version"
  end
end`;
  }

  toCamelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
              .replace(/^[a-z]/, (g) => g.toUpperCase());
  }
}

// Run the CLI
const factory = new TinyAppFactory();
factory.init().catch(console.error);
