// FileCherry Backend API Server
// Handles DeepSeek integration, cherry generation, and downloads

import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve frontend files

// Configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const WORKSPACE_DIR = path.join(__dirname, '../projects/drafts');
const BUILDS_DIR = path.join(__dirname, '../outputs');
const TINYAPP_CLI = path.join(__dirname, '../cli.js');

// Ensure directories exist
await fs.mkdir(WORKSPACE_DIR, { recursive: true });
await fs.mkdir(BUILDS_DIR, { recursive: true });

// ============================================================================
// DeepSeek Integration
// ============================================================================

/**
 * Generate cherry specification using DeepSeek
 */
app.post('/api/generate-cherry', async (req, res) => {
    try {
        const { description, category, stack, includeDatabase, includeSync, includeAuth } = req.body;
        
        if (!description) {
            return res.status(400).json({ error: 'Description is required' });
        }
        
        console.log('Generating cherry with DeepSeek...', { description, stack });
        
        // Call DeepSeek API
        const cherrySpec = await callDeepSeek({
            description,
            category,
            stack,
            includeDatabase,
            includeSync,
            includeAuth
        });
        
        // Generate unique cherry ID
        const cherryId = `cherry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        cherrySpec.id = cherryId;
        
        // Save spec to database (for now, just a JSON file)
        await fs.writeFile(
            path.join(BUILDS_DIR, `${cherryId}-spec.json`),
            JSON.stringify(cherrySpec, null, 2)
        );
        
        res.json(cherrySpec);
        
    } catch (error) {
        console.error('Cherry generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate cherry',
            message: error.message 
        });
    }
});

/**
 * Build cherry using TinyApp Factory
 */
app.post('/api/build-cherry', async (req, res) => {
    const { cherryId } = req.body;
    
    if (!cherryId) {
        return res.status(400).json({ error: 'Cherry ID is required' });
    }
    
    try {
        console.log('Building cherry:', cherryId);
        
        // Load cherry spec
        const specPath = path.join(BUILDS_DIR, `${cherryId}-spec.json`);
        const spec = JSON.parse(await fs.readFile(specPath, 'utf-8'));
        
        // Create project using TinyApp Factory CLI
        const projectDir = path.join(WORKSPACE_DIR, cherryId);
        const buildSteps = [];
        
        // Step 1: Create new project
        const createCommand = `node ${TINYAPP_CLI} new --name "${spec.name}" --stack ${spec.stack} --database ${spec.includeDatabase ? 'fireproof' : 'none'} --auth ${spec.includeAuth ? 'jwt' : 'none'}`;
        buildSteps.push({ command: createCommand, status: 'running' });
        
        try {
            const { stdout, stderr } = await execAsync(createCommand, {
                cwd: path.dirname(WORKSPACE_DIR),
                env: { ...process.env, PATH: process.env.PATH }
            });
            
            buildSteps[0].status = 'completed';
            buildSteps[0].output = stdout;
            
            if (stderr) {
                buildSteps[0].warnings = stderr;
            }
            
        } catch (error) {
            buildSteps[0].status = 'failed';
            buildSteps[0].error = error.message;
            throw new Error(`Project creation failed: ${error.message}`);
        }
        
        // Step 2: Build the project
        const buildCommand = `node ${TINYAPP_CLI} build --project ${cherryId}`;
        buildSteps.push({ command: buildCommand, status: 'running' });
        
        try {
            const { stdout, stderr } = await execAsync(buildCommand, {
                cwd: path.dirname(WORKSPACE_DIR),
                env: { ...process.env, PATH: process.env.PATH }
            });
            
            buildSteps[1].status = 'completed';
            buildSteps[1].output = stdout;
            
            if (stderr) {
                buildSteps[1].warnings = stderr;
            }
            
        } catch (error) {
            buildSteps[1].status = 'failed';
            buildSteps[1].error = error.message;
            throw new Error(`Build failed: ${error.message}`);
        }
        
        // Find the built binary
        const binaryPath = await findBinary(projectDir, spec.stack);
        
        // Move binary to builds directory
        const finalPath = path.join(BUILDS_DIR, `${cherryId}-${spec.name}.exe`);
        await fs.copyFile(binaryPath, finalPath);
        
        res.json({
            success: true,
            cherryId,
            downloadUrl: `/api/download/${cherryId}`,
            buildSteps
        });
        
    } catch (error) {
        console.error('Build error:', error);
        res.status(500).json({
            error: 'Build failed',
            message: error.message
        });
    }
});

/**
 * Download built cherry
 */
app.get('/api/download/:cherryId', async (req, res) => {
    const { cherryId } = req.params;
    
    try {
        // Find the cherry file
        const files = await fs.readdir(BUILDS_DIR);
        const cherryFile = files.find(f => f.startsWith(cherryId));
        
        if (!cherryFile) {
            return res.status(404).json({ error: 'Cherry not found' });
        }
        
        const filePath = path.join(BUILDS_DIR, cherryFile);
        
        // Stream the file for download
        res.download(filePath);
        
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Download failed' });
    }
});

/**
 * Download latest desktop app (dynamic)
 */
app.get('/api/download-desktop', async (req, res) => {
    try {
        const latestApp = await getLatestDesktopApp();
        
        if (!latestApp) {
            res.status(404).json({ error: 'No desktop app found' });
            return;
        }
        
        // Set appropriate headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="${latestApp.name}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        
        // Stream the file
        const fileStream = await fs.createReadStream(latestApp.path);
        fileStream.pipe(res);
        
        console.log(`Serving latest desktop app: ${latestApp.name}`);
        
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Failed to serve download' });
    }
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Call DeepSeek API to generate cherry specification
 */
async function callDeepSeek(params) {
    if (!DEEPSEEK_API_KEY) {
        // Development mode - return mock data
        console.warn('No DEEPSEEK_API_KEY found, using mock data');
        return generateMockCherry(params);
    }
    
    const systemPrompt = `You are an expert at creating portable desktop applications using TinyApp Factory.
Generate a complete, production-ready cherry (portable app) specification based on the user's requirements.

Tech Stack Options:
1. go-gin: Go backend with embedded React frontend (8-18 MB)
   - Fast compilation, small binaries
   - Single executable with embedded assets
   - Good for: APIs, data processing, system tools

2. bun-hono: Bun runtime with Hono framework (50-100 MB)
   - Native TypeScript support
   - Fast runtime, modern APIs
   - Good for: Full-stack apps, real-time features

3. rust-axum: Rust backend with React frontend (5-15 MB)
   - Smallest binaries, fastest runtime
   - Memory-safe, high performance
   - Good for: Performance-critical apps, system tools

4. static: Pure HTML/CSS/JS (< 1 MB)
   - No backend, runs entirely in browser
   - Minimal size, instant load
   - Good for: Tools, calculators, simple apps

Features to include:
${params.includeDatabase ? '- Fireproof database with CRUD operations and live queries' : ''}
${params.includeSync ? '- Cloud sync with Fireproof Cloud or PartyKit for real-time collaboration' : ''}
${params.includeAuth ? '- Device-based authentication using Fireproof keypairs (TouchID/FaceID style)' : ''}

Return ONLY a valid JSON object with this structure:
{
  "name": "Cherry Name",
  "description": "One-line description",
  "category": "${params.category}",
  "stack": "${params.stack}",
  "features": ["feature1", "feature2", "feature3"],
  "size": "estimated size with unit",
  "commands": [
    "tinyapp new cherry-name --stack ${params.stack}",
    "cd projects/drafts/cherry-name",
    "additional commands..."
  ],
  "icon": "single emoji that represents the app",
  "technicalDetails": {
    "frontend": "description of UI components",
    "backend": "description of backend logic",
    "database": "database schema if applicable",
    "apis": ["list of any APIs used"]
  }
}`;

    const userPrompt = `Create a ${params.category} cherry that does: ${params.description}

Requirements:
- Stack: ${params.stack}
- Database: ${params.includeDatabase ? 'Yes (Fireproof)' : 'No'}
- Cloud Sync: ${params.includeSync ? 'Yes' : 'No'}
- Authentication: ${params.includeAuth ? 'Yes' : 'No'}

Make it beautiful, functional, and production-ready. Focus on the user experience.`;

    try {
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });
        
        if (!response.ok) {
            throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Extract JSON from response (in case it's wrapped in markdown)
        const jsonMatch = content.match(/```json\n([\s\S]+?)\n```/) || 
                         content.match(/\{[\s\S]+\}/);
        
        if (!jsonMatch) {
            throw new Error('Failed to parse DeepSeek response');
        }
        
        const cherrySpec = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        return cherrySpec;
        
    } catch (error) {
        console.error('DeepSeek API call failed:', error);
        // Fall back to mock data
        return generateMockCherry(params);
    }
}

/**
 * Generate mock cherry specification (for development)
 */
function generateMockCherry(params) {
    const name = generateCherryName(params.description);
    
    const commands = [
        `tinyapp new ${slugify(name)} --stack ${params.stack}`
    ];
    
    if (params.includeDatabase) {
        commands.push('tinyapp add database --type fireproof');
    }
    if (params.includeSync) {
        commands.push('tinyapp add sync --provider fireproof-cloud');
    }
    if (params.includeAuth) {
        commands.push('tinyapp add auth --provider device');
    }
    
    commands.push('tinyapp build');
    
    return {
        name,
        description: params.description,
        category: params.category,
        stack: params.stack,
        features: [
            params.includeDatabase && 'Fireproof Database',
            params.includeSync && 'Cloud Sync',
            params.includeAuth && 'Authentication',
            'Offline-First',
            'Beautiful UI',
            'Cross-Platform'
        ].filter(Boolean),
        size: estimateSize(params.stack, params.includeDatabase),
        commands,
        icon: selectIcon(params.category),
        technicalDetails: {
            frontend: 'React with Tailwind CSS, responsive design',
            backend: `${params.stack} server with REST API`,
            database: params.includeDatabase ? 'Fireproof embedded database with live queries' : 'None',
            apis: []
        }
    };
}

/**
 * Find the built binary in project directory
 */
async function findBinary(projectDir, stack) {
    const outputsDir = path.join(projectDir, 'outputs');
    
    try {
        const files = await fs.readdir(outputsDir);
        const binary = files.find(f => 
            f.endsWith('.exe') || 
            f.endsWith('.app') || 
            (!f.includes('.') && !f.endsWith('.json'))
        );
        
        if (binary) {
            return path.join(outputsDir, binary);
        }
    } catch (error) {
        console.error('Failed to find binary:', error);
    }
    
    throw new Error('Built binary not found');
}

/**
 * Get the latest desktop app file
 */
async function getLatestDesktopApp() {
    const outputsDir = path.join(__dirname, '..', 'outputs');
    const goDesktopDir = path.join(__dirname, '..', 'projects', 'finished', 'go-desktop-demo');
    
    try {
        // Check for latest build in outputs directory first
        const outputsFiles = (await fs.readdir(outputsDir)).filter(file => 
            file.includes('task-cherry-desktop') || file.includes('filecherry-desktop')
        );
        
        if (outputsFiles.length > 0) {
            // Sort by modification time to get the latest
            const fileStats = await Promise.all(
                outputsFiles.map(async (file) => {
                    const filePath = path.join(outputsDir, file);
                    const stats = await fs.stat(filePath);
                    return {
                        name: file,
                        path: filePath,
                        mtime: stats.mtime
                    };
                })
            );
            
            const latestFile = fileStats.sort((a, b) => b.mtime - a.mtime)[0];
            return latestFile;
        }
        
        // Fallback to go-desktop-demo directory
        const desktopFiles = (await fs.readdir(goDesktopDir)).filter(file => 
            file.includes('task-cherry-desktop') || file.includes('filecherry-desktop')
        );
        
        if (desktopFiles.length > 0) {
            const fileStats = await Promise.all(
                desktopFiles.map(async (file) => {
                    const filePath = path.join(goDesktopDir, file);
                    const stats = await fs.stat(filePath);
                    return {
                        name: file,
                        path: filePath,
                        mtime: stats.mtime
                    };
                })
            );
            
            const latestFile = fileStats.sort((a, b) => b.mtime - a.mtime)[0];
            return latestFile;
        }
        
        return null;
        
    } catch (error) {
        console.error('Error finding latest desktop app:', error);
        return null;
    }
}

// Utility functions
function generateCherryName(description) {
    const words = description.split(' ')
        .filter(w => w.length > 3)
        .slice(0, 3)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    
    return words.join(' ') || 'My Cherry';
}

function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function estimateSize(stack, hasDatabase) {
    const baseSizes = {
        'go-gin': 12,
        'bun-hono': 70,
        'rust-axum': 8,
        'static': 0.6
    };
    
    const dbOverhead = hasDatabase ? 2 : 0;
    const total = baseSizes[stack] + dbOverhead;
    
    return total < 1 ? `${Math.round(total * 1000)} KB` : `${Math.round(total)} MB`;
}

function selectIcon(category) {
    const icons = {
        productivity: '✅',
        creative: '🎨',
        civic: '🏛️',
        business: '💼',
        personal: '🧑'
    };
    return icons[category] || '🍒';
}

// ============================================================================
// Start Server
// ============================================================================

app.listen(PORT, () => {
    console.log(`
🍒 FileCherry Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Server:  http://localhost:${PORT}
Status:  ${DEEPSEEK_API_KEY ? '✓ DeepSeek API configured' : '⚠ Using mock data (no API key)'}
Build:   ${WORKSPACE_DIR}
Output:  ${BUILDS_DIR}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
});

export default app;