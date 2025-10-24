# FileCherry Deployment Guide

Complete guide for deploying FileCherry to production.

## Prerequisites

- Node.js 18+ installed
- TinyApp Factory CLI installed globally
- Domain name (optional)
- DeepSeek API key (for AI features)

## Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest)

Vercel is the fastest way to deploy FileCherry.

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
cd filecherry-site
vercel
```

4. **Set Environment Variables**
```bash
vercel env add DEEPSEEK_API_KEY
# Paste your API key when prompted
```

5. **Deploy to Production**
```bash
vercel --prod
```

**Your site is live!** Vercel will give you a URL like `filecherry.vercel.app`

#### Custom Domain on Vercel

```bash
vercel domains add filecherry.com
# Follow DNS instructions
```

---

### Option 2: Netlify (Great Alternative)

1. **Install Netlify CLI**
```bash
npm i -g netlify-cli
```

2. **Login**
```bash
netlify login
```

3. **Initialize**
```bash
cd filecherry-site
netlify init
```

4. **Set Environment Variables**
```bash
netlify env:set DEEPSEEK_API_KEY your_key_here
```

5. **Deploy**
```bash
netlify deploy --prod
```

---

### Option 3: Railway (Best for Backend-Heavy Apps)

1. **Install Railway CLI**
```bash
npm i -g @railway/cli
```

2. **Login**
```bash
railway login
```

3. **Initialize Project**
```bash
cd filecherry-site
railway init
```

4. **Add Environment Variables**
```bash
railway variables set DEEPSEEK_API_KEY=your_key_here
```

5. **Deploy**
```bash
railway up
```

---

### Option 4: Docker + Any VPS

Perfect for full control on your own server.

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

2. **Create .dockerignore**
```
node_modules
npm-debug.log
.env
workspace
builds
*.md
```

3. **Build Image**
```bash
docker build -t filecherry .
```

4. **Run Container**
```bash
docker run -d \
  --name filecherry \
  -p 3000:3000 \
  -e DEEPSEEK_API_KEY=your_key \
  -v $(pwd)/workspace:/app/workspace \
  -v $(pwd)/builds:/app/builds \
  --restart unless-stopped \
  filecherry
```

5. **Setup Nginx Reverse Proxy**
```nginx
server {
    listen 80;
    server_name filecherry.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **SSL with Certbot**
```bash
sudo certbot --nginx -d filecherry.com
```

---

### Option 5: Traditional VPS (DigitalOcean, Linode, etc.)

1. **SSH into your server**
```bash
ssh root@your-server-ip
```

2. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
```

3. **Install PM2**
```bash
npm install -g pm2
```

4. **Clone Repository**
```bash
git clone https://github.com/yourusername/filecherry.git
cd filecherry
```

5. **Install Dependencies**
```bash
npm install
```

6. **Create .env File**
```bash
nano .env
# Add your environment variables
```

7. **Start with PM2**
```bash
pm2 start server.js --name filecherry
pm2 save
pm2 startup
```

8. **Setup Nginx** (same as Docker option above)

9. **Enable Firewall**
```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

---

## Environment Variables for Production

Create a `.env` file with these variables:

```bash
# Required
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=production

# Paths (adjust for your setup)
WORKSPACE_DIR=/var/filecherry/workspace
BUILDS_DIR=/var/filecherry/builds

# Security
CORS_ORIGIN=https://filecherry.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

---

## Security Checklist

### Before Going Live

- [ ] Set `NODE_ENV=production`
- [ ] Change default `PORT` if needed
- [ ] Configure `CORS_ORIGIN` to your domain
- [ ] Enable rate limiting
- [ ] Set up SSL/HTTPS
- [ ] Configure firewall rules
- [ ] Set strong file permissions
- [ ] Enable security headers
- [ ] Set up monitoring
- [ ] Configure backups

### Recommended Security Headers

Add to your server or reverse proxy:

```javascript
// In server.js
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});
```

---

## Monitoring & Logging

### Option 1: PM2 Logs

```bash
pm2 logs filecherry
pm2 logs filecherry --lines 100
pm2 logs filecherry --err
```

### Option 2: Application Logs

Set up a logging service:

```javascript
// Install winston
npm install winston

// In server.js
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Option 3: External Monitoring

- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Datadog**: Full observability
- **Better Stack**: Log management

---

## Performance Optimization

### 1. Enable Compression

```javascript
import compression from 'compression';
app.use(compression());
```

### 2. Cache Static Assets

```javascript
app.use(express.static('.', {
  maxAge: '1d',
  etag: true
}));
```

### 3. Add CDN

Use Cloudflare or similar for:
- Static asset caching
- DDoS protection
- Geographic distribution

### 4. Database Optimization

For cherry metadata, consider:
- Redis for caching
- PostgreSQL for persistence
- Elasticsearch for search

---

## Backup Strategy

### What to Backup

1. **Cherry Specifications** (`builds/*.json`)
2. **Built Binaries** (`builds/*.exe`)
3. **Environment Config** (`.env`)
4. **Database** (if using one)

### Backup Script

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/filecherry"

mkdir -p $BACKUP_DIR

# Backup builds
tar -czf $BACKUP_DIR/builds_$DATE.tar.gz builds/

# Backup config
cp .env $BACKUP_DIR/env_$DATE.txt

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Schedule with Cron

```bash
crontab -e

# Add line:
0 2 * * * /path/to/backup.sh
```

---

## Scaling Guide

### Vertical Scaling (Single Server)

1. Upgrade server resources (CPU, RAM)
2. Optimize Node.js:
```bash
NODE_OPTIONS="--max-old-space-size=4096" pm2 start server.js
```

### Horizontal Scaling (Multiple Servers)

1. **Load Balancer** (Nginx, HAProxy)
```nginx
upstream filecherry {
    server server1:3000;
    server server2:3000;
    server server3:3000;
}

server {
    location / {
        proxy_pass http://filecherry;
    }
}
```

2. **Shared Storage**
- Use S3 for builds
- Use Redis for sessions
- Use PostgreSQL for metadata

3. **Message Queue**
- Use RabbitMQ or Redis for build queue
- Workers process builds in parallel

---

## Troubleshooting

### Server Won't Start

```bash
# Check logs
pm2 logs filecherry --err

# Check port availability
lsof -i :3000

# Verify environment
node --version
npm --version
```

### DeepSeek API Errors

```bash
# Test API key
curl https://api.deepseek.com/v1/models \
  -H "Authorization: Bearer $DEEPSEEK_API_KEY"

# Check rate limits
# View logs for 429 status codes
```

### Build Failures

```bash
# Check TinyApp Factory
tinyapp --version

# Check disk space
df -h

# Check build logs
tail -f workspace/*/build.log
```

### High Memory Usage

```bash
# Limit Node.js memory
NODE_OPTIONS="--max-old-space-size=2048" pm2 restart filecherry

# Monitor with PM2
pm2 monit
```

---

## Post-Deployment Checklist

- [ ] Site is accessible via HTTPS
- [ ] Environment variables are set
- [ ] Logs are being captured
- [ ] Backups are scheduled
- [ ] Monitoring is active
- [ ] Error tracking is configured
- [ ] Rate limiting is enabled
- [ ] Firewall rules are applied
- [ ] SSL certificate auto-renewal is set
- [ ] Documentation is updated

---

## Support & Resources

- **GitHub Issues**: Report bugs
- **Discord**: Community support
- **Email**: support@filecherry.com
- **Docs**: https://docs.filecherry.com

---

**Happy Deploying! 🍒**

If you run into issues, check the TROUBLESHOOTING section or reach out to the community.