// FileCherry.com - Main Application Logic

// Sample cherry data (in production, this would come from an API)
const CHERRIES = [
    {
        id: 'task-cherry-desktop',
        name: 'Task Cherry Desktop',
        description: 'Native desktop task manager - true desktop app, no browser required',
        category: 'productivity',
        stack: 'go-fyne',
        size: '23 MB',
        downloads: 3421,
        features: ['Native desktop', 'No browser', 'Cross-platform', 'Offline-first'],
        icon: '🍒',
        author: 'FileCherry Team',
        version: '1.0.0',
        demoUrl: 'https://filecherry.com/demo/task-cherry-desktop',
        tryNow: true
    },
    {
        id: 'expense-tracker',
        name: 'Expense Tracker',
        description: 'Track spending with charts, budgets, and export to CSV',
        category: 'personal',
        stack: 'bun-hono',
        size: '18 MB',
        downloads: 892,
        features: ['Budget tracking', 'Charts', 'CSV export', 'Multi-currency'],
        icon: '💰',
        author: 'FinanceTools',
        version: '2.0.1'
    },
    {
        id: 'need-food',
        name: 'Need Food',
        description: 'Connect people in need with food donors via Bluetooth and GPS',
        category: 'civic',
        stack: 'go-gin',
        size: '15 MB',
        downloads: 2341,
        features: ['Bluetooth', 'GPS', 'Public feed', 'Privacy-first'],
        icon: '🍲',
        author: 'CivicTech',
        version: '1.0.0'
    },
    {
        id: 'pomodoro-timer',
        name: 'Pomodoro Focus',
        description: 'Focus timer with stats tracking and ambient sounds',
        category: 'productivity',
        stack: 'static',
        size: '800 KB',
        downloads: 3421,
        features: ['25-min timer', 'Stats', 'Sounds', 'Minimal'],
        icon: '⏱️',
        author: 'FocusTools',
        version: '1.5.2'
    },
    {
        id: 'markdown-notes',
        name: 'Markdown Notes',
        description: 'Fast markdown editor with live preview and tagging',
        category: 'productivity',
        stack: 'rust-axum',
        size: '8 MB',
        downloads: 1876,
        features: ['Markdown', 'Live preview', 'Tags', 'Fast'],
        icon: '📝',
        author: 'NoteApps',
        version: '1.1.0'
    },
    {
        id: 'color-palette',
        name: 'Color Palette Generator',
        description: 'Generate beautiful color schemes with AI assistance',
        category: 'creative',
        stack: 'static',
        size: '600 KB',
        downloads: 4521,
        features: ['AI colors', 'Export', 'Accessibility', 'Gradients'],
        icon: '🎨',
        author: 'DesignTools',
        version: '2.1.0'
    },
    {
        id: 'invoice-maker',
        name: 'Invoice Generator',
        description: 'Professional invoices with PDF export and client management',
        category: 'business',
        stack: 'go-gin',
        size: '14 MB',
        downloads: 1123,
        features: ['PDF export', 'Templates', 'Client DB', 'Calculations'],
        icon: '🧾',
        author: 'BizTools',
        version: '1.3.0'
    },
    {
        id: 'habit-tracker',
        name: 'Habit Tracker',
        description: 'Build better habits with streaks and motivational insights',
        category: 'personal',
        stack: 'bun-hono',
        size: '16 MB',
        downloads: 2187,
        features: ['Streaks', 'Charts', 'Reminders', 'Insights'],
        icon: '🎯',
        author: 'LifeTools',
        version: '1.0.5'
    },
    {
        id: 'wifi-analyzer',
        name: 'WiFi Analyzer',
        description: 'Analyze network strength and find optimal channels',
        category: 'productivity',
        stack: 'rust-axum',
        size: '7 MB',
        downloads: 987,
        features: ['Network scan', 'Channel analysis', 'Signal strength', 'Fast'],
        icon: '📡',
        author: 'NetTools',
        version: '1.2.1'
    },
    {
        id: 'api-tester',
        name: 'API Tester Pro',
        description: 'Beautiful REST API testing tool with history, collections, and environment variables',
        category: 'productivity',
        stack: 'rust-axum',
        size: '9 MB',
        downloads: 3847,
        features: ['Request history', 'Collections', 'Env variables', 'Syntax highlighting'],
        icon: '🔌',
        author: 'DevTools',
        version: '2.1.0'
    },
    {
        id: 'pixel-art',
        name: 'Pixel Studio',
        description: 'Create retro pixel art with layers, animation, and export to sprite sheets',
        category: 'creative',
        stack: 'static',
        size: '1.2 MB',
        downloads: 5623,
        features: ['Layers', 'Animation', 'Sprite sheets', 'Color palettes'],
        icon: '🎮',
        author: 'PixelCraft',
        version: '1.4.2'
    },
    {
        id: 'breathe-easy',
        name: 'Breathe Easy',
        description: 'Guided breathing exercises with haptic feedback, ambient sounds, and progress tracking',
        category: 'personal',
        stack: 'bun-hono',
        size: '22 MB',
        downloads: 4189,
        features: ['Guided breathing', 'Ambient sounds', 'Progress stats', 'Haptic feedback'],
        icon: '🫁',
        author: 'WellnessApps',
        version: '1.0.3'
    },
    {
        id: 'neighborhood-watch',
        name: 'Neighborhood Connect',
        description: 'Hyper-local community board for events, alerts, and resource sharing via P2P mesh',
        category: 'civic',
        stack: 'go-gin',
        size: '16 MB',
        downloads: 2934,
        features: ['P2P mesh', 'Event calendar', 'Emergency alerts', 'Resource sharing'],
        icon: '🏘️',
        author: 'CivicTech',
        version: '1.1.0'
    },
    {
        id: 'meeting-recorder',
        name: 'Meeting Scribe',
        description: 'Record meetings with AI transcription, speaker detection, and action item extraction',
        category: 'business',
        stack: 'bun-hono',
        size: '45 MB',
        downloads: 1876,
        features: ['AI transcription', 'Speaker ID', 'Action items', 'Searchable history'],
        icon: '🎙️',
        author: 'BizTools',
        version: '1.0.0'
    },
    {
        id: 'plant-buddy',
        name: 'Plant Buddy',
        description: 'Track your plants with photos, watering schedules, growth logs, and community tips',
        category: 'personal',
        stack: 'go-gin',
        size: '13 MB',
        downloads: 6721,
        features: ['Photo timeline', 'Water reminders', 'Growth logs', 'Plant ID'],
        icon: '🪴',
        author: 'GreenThumb',
        version: '2.0.1'
    }
];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    renderCherries();
    loadCherryBowl();
    setupEventListeners();
});

// Render cherry grid
function renderCherries(filtered = CHERRIES) {
    const grid = document.getElementById('cherryGrid');
    
    if (!grid) {
        console.error('cherryGrid element not found!');
        return;
    }
    
    grid.innerHTML = filtered.map(cherry => `
        <div class="glass-card p-6 rounded-2xl cherry-card">
            <div class="flex items-start justify-between mb-4">
                <div class="text-5xl">${cherry.icon}</div>
                <div class="flex gap-1">
                    ${cherry.features.slice(0, 2).map(f => `<span class="tag">${f}</span>`).join('')}
                </div>
            </div>
            <h3 class="text-xl font-bold mb-2">${cherry.name}</h3>
            <p class="text-white/60 text-sm mb-4">${cherry.description}</p>
            <div class="flex items-center gap-2 text-xs text-white/40 mb-4">
                <span>v${cherry.version}</span>
                <span>•</span>
                <span>${cherry.size}</span>
                <span>•</span>
                <span>${cherry.downloads.toLocaleString()} downloads</span>
            </div>
            <div class="flex gap-2">
                <button onclick="downloadCherry('${cherry.id}')" class="flex-1 cherry-gradient py-2 rounded-full text-sm font-semibold hover:opacity-90">
                    Download
                </button>
                <button onclick="addCherryToBowl('${cherry.id}')" class="glass-card px-4 py-2 rounded-full text-sm font-semibold hover:bg-white/10">
                    🍒 Add
                </button>
            </div>
        </div>
    `).join('');
}

// Filter cherries
function filterCherries() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const stack = document.getElementById('stackFilter').value;
    
    const filtered = CHERRIES.filter(cherry => {
        const matchesSearch = cherry.name.toLowerCase().includes(search) || 
                             cherry.description.toLowerCase().includes(search);
        const matchesCategory = category === 'all' || cherry.category === category;
        const matchesStack = stack === 'all' || cherry.stack === stack;
        
        return matchesSearch && matchesCategory && matchesStack;
    });
    
    renderCherries(filtered);
}

// Generate cherry with DeepSeek
async function generateCherry() {
    const description = document.getElementById('cherryDescription').value;
    const category = document.getElementById('aiCategory').value;
    const stack = document.getElementById('aiStack').value;
    const includeDatabase = document.getElementById('includeDatabase').checked;
    const includeSync = document.getElementById('includeSync').checked;
    const includeAuth = document.getElementById('includeAuth').checked;
    
    if (!description.trim()) {
        alert('Please describe what your cherry should do!');
        return;
    }
    
    // Show generation status
    document.getElementById('generationStatus').classList.remove('hidden');
    document.getElementById('generatedCherry').classList.add('hidden');
    
    const logElement = document.getElementById('generationLog');
    const log = (message) => {
        logElement.innerHTML += `<div>✓ ${message}</div>`;
        logElement.scrollTop = logElement.scrollHeight;
    };
    
    try {
        // Step 1: Generate TinyApp Factory command
        log('Analyzing requirements...');
        await sleep(500);
        
        log('Selecting optimal tech stack...');
        await sleep(500);
        
        // Step 2: Call DeepSeek API
        log('Calling DeepSeek AI to generate code...');
        const cherryCode = await callDeepSeekAPI({
            description,
            category,
            stack,
            includeDatabase,
            includeSync,
            includeAuth
        });
        
        log('Code generation complete!');
        await sleep(500);
        
        // Step 3: Build cherry
        log('Building cherry with TinyApp Factory...');
        await sleep(1000);
        
        log('Optimizing bundle size...');
        await sleep(800);
        
        log('Adding Fireproof database...');
        if (includeSync) {
            await sleep(500);
            log('Configuring cloud sync...');
        }
        if (includeAuth) {
            await sleep(500);
            log('Setting up authentication...');
        }
        
        await sleep(500);
        log('Cherry ready! 🎉');
        
        // Hide status, show result
        setTimeout(() => {
            document.getElementById('generationStatus').classList.add('hidden');
            displayGeneratedCherry(cherryCode);
        }, 1000);
        
    } catch (error) {
        log(`❌ Error: ${error.message}`);
        console.error('Generation error:', error);
    }
}

// Call DeepSeek API
async function callDeepSeekAPI(params) {
    // IMPORTANT: In production, this should go through your backend to protect API keys
    // Never expose API keys in frontend code!
    
    const DEEPSEEK_API_KEY = 'YOUR_DEEPSEEK_API_KEY_HERE'; // Replace in production
    const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
    
    const systemPrompt = `You are an expert at creating portable desktop applications using TinyApp Factory.
Generate a complete, production-ready cherry (portable app) based on the user's requirements.

Stack Details:
- go-gin: Go backend with embedded React frontend (8-18 MB)
- bun-hono: Bun runtime with Hono framework (50-100 MB)
- rust-axum: Rust backend with React frontend (5-15 MB)
- static: Pure HTML/CSS/JS (< 1 MB)

${params.includeDatabase ? 'Include Fireproof database with CRUD operations.' : ''}
${params.includeSync ? 'Add cloud sync capabilities with Fireproof Cloud connector.' : ''}
${params.includeAuth ? 'Include device-based authentication with Fireproof keypairs.' : ''}

Return a JSON object with:
{
  "name": "Cherry Name",
  "description": "Brief description",
  "features": ["feature1", "feature2", ...],
  "size": "estimated size",
  "commands": ["tinyapp command to create this"],
  "icon": "emoji"
}`;

    const userPrompt = `Create a ${params.category} cherry that does: ${params.description}

Preferred stack: ${params.stack}
${params.includeDatabase ? '✓' : '✗'} Database
${params.includeSync ? '✓' : '✗'} Cloud Sync
${params.includeAuth ? '✓' : '✗'} Authentication`;

    // Simulated response for demo purposes
    // In production, uncomment the actual API call below
    await sleep(2000);
    return {
        name: generateCherryName(params.description),
        description: params.description,
        category: params.category,
        stack: params.stack,
        features: [
            params.includeDatabase && 'Fireproof DB',
            params.includeSync && 'Cloud Sync',
            params.includeAuth && 'Authentication',
            'Offline-first',
            'Beautiful UI'
        ].filter(Boolean),
        size: estimateSize(params.stack, params.includeDatabase),
        commands: [
            `tinyapp new my-cherry --stack ${params.stack}`,
            params.includeDatabase && 'tinyapp add database',
            params.includeSync && 'tinyapp add sync --provider fireproof-cloud',
            params.includeAuth && 'tinyapp add auth --provider device',
            'tinyapp build'
        ].filter(Boolean),
        icon: selectIcon(params.category)
    };
    
    /* PRODUCTION CODE - Uncomment when deploying with backend proxy:
    
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
        throw new Error(`DeepSeek API error: ${response.status}`);
    }
    
    const data = await response.json();
    const cherrySpec = JSON.parse(data.choices[0].message.content);
    return cherrySpec;
    */
}

// Display generated cherry
function displayGeneratedCherry(cherry) {
    const details = document.getElementById('cherryDetails');
    details.innerHTML = `
        <div class="flex items-start gap-4">
            <div class="text-5xl">${cherry.icon}</div>
            <div class="flex-1">
                <h4 class="text-xl font-bold mb-2">${cherry.name}</h4>
                <p class="text-white/70 mb-3">${cherry.description}</p>
                <div class="flex gap-2 flex-wrap mb-3">
                    ${cherry.features.map(f => `<span class="tag">${f}</span>`).join('')}
                </div>
                <div class="text-sm text-white/60">
                    <div>Stack: ${cherry.stack}</div>
                    <div>Estimated size: ${cherry.size}</div>
                </div>
            </div>
        </div>
        <div class="mt-4 p-4 bg-black/30 rounded-xl">
            <div class="text-xs font-mono text-white/80">
                ${cherry.commands.map(cmd => `<div class="mb-1">$ ${cmd}</div>`).join('')}
            </div>
        </div>
    `;
    
    document.getElementById('generatedCherry').classList.remove('hidden');
    
    // Store for download
    window.currentCherry = cherry;
}

// Helper functions
function generateCherryName(description) {
    const words = description.split(' ').slice(0, 3);
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Cherry Bowl Management
function loadCherryBowl() {
    const bowl = JSON.parse(localStorage.getItem('cherryBowl') || '[]');
    renderCherryBowl(bowl);
}

function renderCherryBowl(cherries) {
    const bowl = document.getElementById('cherryBowl');
    
    if (cherries.length === 0) {
        bowl.innerHTML = `
            <div class="glass-card p-8 rounded-2xl text-center">
                <div class="text-5xl mb-4">➕</div>
                <p class="text-white/60">Add your first cherry to get started</p>
                <button onclick="scrollToBrowse()" class="mt-4 cherry-gradient px-4 py-2 rounded-full text-sm font-semibold">
                    Browse Cherries
                </button>
            </div>
        `;
        return;
    }
    
    bowl.innerHTML = cherries.map(id => {
        const cherry = CHERRIES.find(c => c.id === id);
        if (!cherry) return '';
        
        return `
            <div class="glass-card p-6 rounded-2xl cherry-card">
                <div class="flex items-start justify-between mb-4">
                    <div class="text-4xl">${cherry.icon}</div>
                    <button onclick="removeCherryFromBowl('${cherry.id}')" class="text-white/40 hover:text-red-400">
                        ✕
                    </button>
                </div>
                <h3 class="font-bold mb-2">${cherry.name}</h3>
                <div class="text-xs text-white/60 mb-4">${cherry.size}</div>
                <button onclick="downloadCherry('${cherry.id}')" class="w-full cherry-gradient py-2 rounded-full text-sm font-semibold">
                    Download
                </button>
            </div>
        `;
    }).join('');
}

function addCherryToBowl(cherryId) {
    const bowl = JSON.parse(localStorage.getItem('cherryBowl') || '[]');
    if (!bowl.includes(cherryId)) {
        bowl.push(cherryId);
        localStorage.setItem('cherryBowl', JSON.stringify(bowl));
        loadCherryBowl();
        
        // Show feedback
        showNotification('Cherry added to your bowl! 🍒');
    } else {
        showNotification('This cherry is already in your bowl');
    }
}

function removeCherryFromBowl(cherryId) {
    const bowl = JSON.parse(localStorage.getItem('cherryBowl') || '[]');
    const filtered = bowl.filter(id => id !== cherryId);
    localStorage.setItem('cherryBowl', JSON.stringify(filtered));
    loadCherryBowl();
}

function addToBowl() {
    if (window.currentCherry) {
        // For AI-generated cherries, create a temporary ID
        const tempId = 'generated-' + Date.now();
        addCherryToBowl(tempId);
        
        // In production, this would save the generated cherry spec
        showNotification('AI-generated cherry added to your bowl! 🍒');
    }
}

// Download functionality
function downloadCherry(cherryId) {
    const cherry = CHERRIES.find(c => c.id === cherryId) || window.currentCherry;
    if (!cherry) return;
    
    // In production, this would trigger actual download
    showNotification(`Downloading ${cherry.name}... (Demo mode)`);
    
    // Simulate download
    setTimeout(() => {
        showNotification(`${cherry.name} ready to use! 🎉`);
    }, 2000);
    
    /* PRODUCTION CODE:
    window.location.href = `/api/download/${cherryId}`;
    */
}

function exportBowl() {
    const bowl = JSON.parse(localStorage.getItem('cherryBowl') || '[]');
    const data = JSON.stringify({ cherries: bowl }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-cherry-bowl.json';
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Cherry bowl exported! 📦');
}

// Navigation
function scrollToBrowse() {
    document.getElementById('browse').scrollIntoView({ behavior: 'smooth' });
}

function scrollToCreate() {
    document.getElementById('create').scrollIntoView({ behavior: 'smooth' });
}

function openBowl() {
    document.getElementById('bowl').scrollIntoView({ behavior: 'smooth' });
}

// Notifications
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-8 right-8 glass-card px-6 py-4 rounded-full font-semibold cherry-glow z-50 animate-fade-in';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Event listeners
function setupEventListeners() {
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && e.ctrlKey) {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
    });
}