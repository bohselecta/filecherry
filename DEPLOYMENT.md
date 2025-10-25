# 🚀 Vercel Deployment Guide for FileCherry Landing Page

## 📋 Quick Setup Steps

### 1. **Connect to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import from GitHub: `bohselecta/filecherry`

### 2. **Select Branch**
- **IMPORTANT**: Choose `landing-page` branch
- This ensures only the landing page files are deployed
- Keeps deployment simple and fast

### 3. **Configure Project**
- **Framework Preset**: Other
- **Root Directory**: `website/`
- **Build Command**: `npm run build`
- **Output Directory**: `website/`

### 4. **Environment Variables** (Optional)
- `NODE_ENV`: `production`
- `PORT`: `3000`

### 5. **Deploy**
- Click "Deploy"
- Vercel will automatically build and deploy
- Your landing page will be live at `https://your-project.vercel.app`

## 🎯 What Gets Deployed

The `landing-page` branch contains:
- ✅ `website/index.html` - Main landing page
- ✅ `website/app.js` - Frontend JavaScript
- ✅ `website/server.js` - Backend API
- ✅ `website/package.json` - Dependencies
- ✅ `vercel.json` - Vercel configuration

## 🔧 Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate will be auto-generated

## 📱 Features Included

- **Download Page**: Single download for all platforms
- **Responsive Design**: Works on desktop and mobile
- **Fast Loading**: Optimized static assets
- **Cherry Theme**: Dark background with cherry red accents

## 🆘 Troubleshooting

### If deployment fails:
1. Check that you selected `landing-page` branch
2. Verify `website/` is set as root directory
3. Ensure Node.js 18+ is selected

### If site doesn't load:
1. Check Vercel function logs
2. Verify all dependencies are in `package.json`
3. Test locally with `npm run dev`

---

**Your FileCherry landing page is now ready for deployment!** 🍒✨
