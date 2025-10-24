# {{PROJECT_NAME}} - Static HTML Template

A tiny, portable static application with Fireproof database, built with pure HTML, CSS, and JavaScript.

## 🚀 Features

- **Pure HTML/CSS/JS**: No build tools or frameworks required
- **Fireproof Database**: Local-first, encrypted database via CDN
- **Tailwind CSS**: Beautiful styling via CDN
- **Zero Dependencies**: Runs directly in any browser
- **Tiny Size**: < 2 MB total (including database)

## 📦 Size

- **Total Size**: < 2 MB
- **HTML File**: ~50 KB
- **Fireproof**: ~300 KB (loaded on demand)
- **Tailwind**: ~100 KB (loaded on demand)

## 🛠️ Development

### Prerequisites

- Any modern web browser
- Optional: Local web server for testing

### Setup

1. **Open the file**:
   ```bash
   # Option 1: Direct file
   open index.html
   
   # Option 2: Local server (recommended)
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

2. **Customize**:
   - Edit `index.html` directly
   - Modify styles, add features
   - Test in browser

3. **Deploy**:
   - Upload `index.html` to any web server
   - Or share the file directly

## 🔨 Building for Production

### Single File Distribution

The static template is already production-ready:

```bash
# Just copy the HTML file
cp index.html my-cherry.html

# Or rename it
mv index.html {{PROJECT_SLUG}}.html
```

### Optional: Minification

```bash
# Install minifier
npm install -g html-minifier

# Minify the HTML
html-minifier --collapse-whitespace --remove-comments --minify-css --minify-js index.html -o {{PROJECT_SLUG}}.min.html
```

## 🍒 Fireproof Database

This template includes Fireproof - a local-first, encrypted database that works offline.

### Features

- **Truly Portable**: Database loads from CDN (~300KB)
- **Offline-First**: Works immediately with no server needed
- **Zero Config**: No setup, just open the HTML file
- **Encrypted**: Content-addressed encrypted blobs by default
- **Optional Sync**: Add cloud sync later with one line of code

### Usage

```javascript
// Database is already initialized
const db = fireproof('{{PROJECT_SLUG}}')

// Save data
await db.put({
  _id: crypto.randomUUID(),
  type: 'todo',
  text: 'Hello Fireproof!',
  done: false,
  created: Date.now()
})

// Query data
const todos = await db.query('type', { key: 'todo' })
```

### Built-in Features

The template includes:

- **Todo List**: Complete CRUD operations
- **Database Status**: Live document count and size
- **Sample Data**: Add test data with one click
- **Responsive UI**: Works on desktop and mobile

## 🏗️ Architecture

### Frontend (Pure HTML/CSS/JS)

- **HTML**: Semantic structure with Tailwind classes
- **CSS**: Tailwind CSS via CDN + custom styles
- **JavaScript**: Vanilla JS with modern async/await
- **Database**: Fireproof via CDN
- **Icons**: Unicode emojis (no external dependencies)

### File Structure

```
{{PROJECT_SLUG}}/
└── index.html              # Complete application
```

That's it! Everything is in one file.

### Key Components

```html
<!-- Database initialization -->
<script>
const { fireproof } = Fireproof;
const db = fireproof('{{PROJECT_SLUG}}');
</script>

<!-- Todo operations -->
<script>
async function addTodo(event) {
    // Add todo to Fireproof
}

async function loadTodos() {
    // Load todos from Fireproof
}
</script>
```

## 🎯 Performance

### Loading Performance

- **First Load**: ~500ms (HTML + CDN resources)
- **Subsequent Loads**: ~100ms (cached resources)
- **Database Init**: ~200ms (Fireproof setup)
- **Total Time**: < 1 second to fully functional

### Runtime Performance

- **No Framework Overhead**: Pure JavaScript
- **Efficient DOM**: Minimal re-renders
- **Local Storage**: Fireproof handles persistence
- **Memory Usage**: < 50MB typical

## 🔧 Customization

### Adding New Features

```html
<!-- Add new HTML sections -->
<div class="glass rounded-2xl p-8">
    <h2 class="text-2xl font-semibold mb-6">My Feature</h2>
    <!-- Your content -->
</div>

<!-- Add JavaScript functions -->
<script>
async function myNewFeature() {
    // Your logic here
    await db.put({ type: 'my-data', content: 'example' });
}
</script>
```

### Styling

```html
<!-- Custom CSS -->
<style>
.my-custom-class {
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    border-radius: 12px;
}
</style>

<!-- Or use Tailwind classes -->
<div class="bg-gradient-to-r from-red-400 to-blue-400 rounded-xl p-4">
    <!-- Content -->
</div>
```

### Database Schema

```javascript
// Define your data types
const Note = {
    _id: crypto.randomUUID(),
    type: 'note',
    title: 'My Note',
    content: 'Note content...',
    tags: ['important', 'work'],
    created: Date.now()
}

const Task = {
    _id: crypto.randomUUID(),
    type: 'task',
    description: 'Task description',
    priority: 'high',
    due: Date.now() + 86400000, // Tomorrow
    created: Date.now()
}
```

## 🚢 Deployment

### Web Hosting

Upload to any web host:

```bash
# Upload to Netlify
netlify deploy --prod --dir .

# Upload to Vercel
vercel --prod

# Upload to GitHub Pages
git push origin main
```

### File Sharing

Share the HTML file directly:

```bash
# Email attachment
# Cloud storage (Dropbox, Google Drive)
# USB drive
# QR code with file URL
```

### CDN Distribution

```bash
# Upload to CDN
aws s3 cp index.html s3://my-bucket/cherries/{{PROJECT_SLUG}}.html

# Or use any CDN service
```

## 🐛 Troubleshooting

### Common Issues

**"Database not loading"**
- Check internet connection (Fireproof loads from CDN)
- Verify browser supports modern JavaScript
- Check browser console for errors

**"Styling not working"**
- Ensure Tailwind CSS CDN is loading
- Check for CSS conflicts
- Verify HTML structure

**"JavaScript errors"**
- Check browser console
- Ensure modern browser (ES6+ support)
- Verify Fireproof CDN is accessible

### Browser Compatibility

- **Chrome**: 60+ ✅
- **Firefox**: 55+ ✅
- **Safari**: 12+ ✅
- **Edge**: 79+ ✅
- **Mobile**: iOS 12+, Android 7+ ✅

## 📚 Next Steps

1. **Customize the UI**: Modify HTML and CSS
2. **Add features**: Implement your app's functionality
3. **Database operations**: Use Fireproof for data storage
4. **Test thoroughly**: Try on different devices/browsers
5. **Deploy**: Share your static cherry! 🍒

## 🎨 Design System

### Colors

```css
Background: Dark gradient (#1a0a0a → #2d1515 → #1a0a0a)
Primary: Cherry red (#ff1744)
Accent: Pink gradient (#ff1744 → #ff6b9d)
Glass: rgba(255, 255, 255, 0.05)
Text: White with varying opacity
```

### Components

- **Glass Cards**: Backdrop blur with subtle borders
- **Cherry Glow**: Red shadow effects
- **Gradient Buttons**: Animated shine effect
- **Floating Animation**: Subtle bounce
- **Responsive Grid**: Adapts to screen size

---

**Built with 🍒 by TinyApp Factory**

*Portable tools, shareable everywhere.*
