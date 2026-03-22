# 🚀 DEPLOYMENT.md — Jotter Deployment Guide

> Instructions for deploying Jotter to production environments.

---

## Table of Contents

- [Option 1 — Manual VPS / Ubuntu Server](#option-1--manual-vps--ubuntu-server)
- [Option 2 — Docker](#option-2--docker)
- [Option 3 — Docker Compose (Full Stack)](#option-3--docker-compose-full-stack)
- [Option 4 — PM2 Process Manager](#option-4--pm2-process-manager)
- [Nginx Reverse Proxy](#nginx-reverse-proxy)
- [SSL / HTTPS with Certbot](#ssl--https-with-certbot)
- [Environment Configuration for Production](#environment-configuration-for-production)
- [CI/CD with GitHub Actions](#cicd-with-github-actions)
- [Monitoring & Logs](#monitoring--logs)

---

## Option 1 — Manual VPS / Ubuntu Server

### 1. Prepare the Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version

# Install git
sudo apt install -y git
```

### 2. Clone and Build

```bash
# Clone the repo
git clone https://github.com/iftekhar2979/jotter.git /opt/jotter
cd /opt/jotter

# Install production dependencies only
npm ci --omit=dev

# Build the TypeScript project
npm run build
```

### 3. Configure Environment

```bash
# Create .env in production
cp /opt/jotter/.env.example /opt/jotter/.env
nano /opt/jotter/.env
# Fill in all production values
```

### 4. Start the App

```bash
npm run start:prod
```

---

## Option 2 — Docker

### Dockerfile

Create a `Dockerfile` in the project root:

```dockerfile
# ─── Stage 1: Build ───────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─── Stage 2: Production ──────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# Copy Tesseract trained data files
COPY *.traineddata ./

EXPOSE 3000

CMD ["node", "dist/main"]
```

### Build and Run

```bash
# Build Docker image
docker build -t jotter-api .

# Run container
docker run -d \
  --name jotter-api \
  -p 3000:3000 \
  --env-file .env \
  jotter-api
```

---

## Option 3 — Docker Compose (Full Stack)

Create a `docker-compose.yml` in the project root:

```yaml
version: '3.8'

services:
  app:
    build: .
    container_name: jotter-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file: .env
    depends_on:
      - mongo
      - minio
    networks:
      - jotter-network

  mongo:
    image: mongo:6
    container_name: jotter-mongo
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    networks:
      - jotter-network

  minio:
    image: quay.io/minio/minio
    container_name: jotter-minio
    restart: unless-stopped
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    volumes:
      - minio-data:/data
    command: server /data --console-address ":9001"
    networks:
      - jotter-network

networks:
  jotter-network:
    driver: bridge

volumes:
  mongo-data:
  minio-data:
```

**Start all services:**
```bash
docker compose up -d

# View logs
docker compose logs -f

# Stop all
docker compose down
```

---

## Option 4 — PM2 Process Manager

PM2 is recommended for running Node.js apps reliably on a VPS.

### Install PM2

```bash
npm install -g pm2
```

### Start with PM2

```bash
# Build first
npm run build

# Start with PM2
pm2 start dist/main.js --name "jotter-api"

# Auto-restart on server reboot
pm2 startup
pm2 save
```

### PM2 Ecosystem File (Recommended)

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'jotter-api',
      script: 'dist/main.js',
      instances: 'max',          // Use all CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
```

```bash
pm2 start ecosystem.config.js
```

---

## Nginx Reverse Proxy

Configure Nginx to proxy requests to the Node.js app:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File upload size limit
    client_max_body_size 50M;
}
```

```bash
# Install Nginx
sudo apt install nginx

# Save config
sudo nano /etc/nginx/sites-available/jotter
sudo ln -s /etc/nginx/sites-available/jotter /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL / HTTPS with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically. Verify with:
sudo certbot renew --dry-run
```

---

## Environment Configuration for Production

Key differences between development and production `.env`:

```env
# ─── Application ────────────────────────────────────────────
PORT=3000
NODE_ENV=production

# ─── Database (use Atlas or a secured MongoDB) ──────────────
MONGODB_URI=mongodb+srv://user:pass@cluster0.mongodb.net/jotter?retryWrites=true&w=majority

# ─── JWT (use a long, random secret) ────────────────────────
JWT_SECRET=extremely_long_random_production_secret_here
JWT_EXPIRATION=1d

# ─── AWS S3 (preferred over MinIO for production) ───────────
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=jotter-production

# ─── Email ──────────────────────────────────────────────────
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASSWORD=SG.your_sendgrid_api_key
MAIL_FROM=noreply@yourdomain.com
```

> ✅ **Security checklist:**
> - Use a strong, unique `JWT_SECRET` (64+ random characters)
> - Use MongoDB Atlas with IP allowlisting
> - Scope IAM permissions to specific S3 bucket only
> - Use an app-specific email password or API key
> - Never expose `.env` publicly

---

## CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Build project
        run: npm run build

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/jotter
            git pull origin main
            npm ci --omit=dev
            npm run build
            pm2 restart jotter-api
```

**Required GitHub Secrets:**
| Secret | Value |
|---|---|
| `SERVER_HOST` | Your VPS IP address or hostname |
| `SERVER_USER` | SSH username (e.g., `ubuntu`) |
| `SSH_PRIVATE_KEY` | Your private SSH key content |

---

## Monitoring & Logs

### PM2 Monitoring
```bash
pm2 monit           # Real-time CPU/memory dashboard
pm2 logs            # View all logs
pm2 logs jotter-api # View specific app logs
pm2 status          # Check app status
```

### Docker Logs
```bash
docker logs -f jotter-app
docker compose logs -f app
```

### Health Check Endpoint

> It is recommended to add a health check endpoint to the app:
```typescript
@Get('/health')
health() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}
```

Then configure uptime monitoring with services like:
- [UptimeRobot](https://uptimerobot.com/) (free tier)
- [Better Uptime](https://betteruptime.com/)
- Prometheus + Grafana (advanced)
