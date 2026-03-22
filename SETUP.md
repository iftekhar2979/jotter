# ⚙️ SETUP.md — Local Development Setup Guide

> Step-by-step instructions to get Jotter running on your local machine.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Step 1 — Clone the Repository](#step-1--clone-the-repository)
- [Step 2 — Install Dependencies](#step-2--install-dependencies)
- [Step 3 — Configure Environment Variables](#step-3--configure-environment-variables)
- [Step 4 — Set Up MongoDB](#step-4--set-up-mongodb)
- [Step 5 — Set Up File Storage](#step-5--set-up-file-storage)
- [Step 6 — Run the Application](#step-6--run-the-application)
- [Step 7 — Verify the Setup](#step-7--verify-the-setup)
- [Common Issues & Fixes](#common-issues--fixes)
- [Development Scripts Reference](#development-scripts-reference)

---

## Prerequisites

Before starting, ensure the following tools are installed and configured:

| Tool | Minimum Version | How to Check |
|---|---|---|
| **Node.js** | 18.x (20.x recommended) | `node --version` |
| **npm** | 9.x | `npm --version` |
| **Git** | Any recent version | `git --version` |
| **MongoDB** | 6.x | `mongod --version` |

**Optional tools (for local object storage):**
| Tool | Purpose |
|---|---|
| Docker + Docker Compose | Run MinIO locally |
| MinIO Client (`mc`) | Manage MinIO buckets |
| AWS CLI | Manage AWS S3 buckets |

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/iftekhar2979/jotter.git
cd jotter
```

---

## Step 2 — Install Dependencies

```bash
npm install
```

This installs all runtime and development dependencies listed in `package.json`.

> If you encounter ERESOLVE errors, try:
> ```bash
> npm install --legacy-peer-deps
> ```

---

## Step 3 — Configure Environment Variables

Create a `.env` file in the project root:

```bash
touch .env
```

Paste and fill in the following template:

```env
# ─── Application ────────────────────────────────────────────
PORT=3000
NODE_ENV=development

# ─── Database ───────────────────────────────────────────────
MONGODB_URI=mongodb://localhost:27017/jotter

# ─── JWT Authentication ─────────────────────────────────────
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRATION=7d

# ─── AWS S3 (use this if deploying to cloud) ────────────────
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=jotter-dev

# ─── MinIO (use this for local development) ─────────────────
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=jotter-local
MINIO_USE_SSL=false

# ─── Email ──────────────────────────────────────────────────
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=noreply@jotter.app
```

> **Tip:** Generate a strong `JWT_SECRET` with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

## Step 4 — Set Up MongoDB

### Option A: Local MongoDB

If MongoDB is installed locally:

```bash
# Start MongoDB service
mongod --dbpath /data/db

# Or with systemd (Linux)
sudo systemctl start mongod
```

Your `MONGODB_URI` in `.env` should be:
```
MONGODB_URI=mongodb://localhost:27017/jotter
```

### Option B: MongoDB Atlas (Cloud)

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Go to **Database Access** → Add a user with password
3. Go to **Network Access** → Allow your IP
4. Click **Connect** → Get your connection string
5. Update `.env`:
```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/jotter?retryWrites=true&w=majority
```

### Option C: Docker MongoDB

```bash
docker run -d \
  --name jotter-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=jotter \
  mongo:6
```

---

## Step 5 — Set Up File Storage

### Option A: MinIO (Recommended for Local Dev)

Run MinIO via Docker:

```bash
docker run -d \
  --name jotter-minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  quay.io/minio/minio server /data --console-address ":9001"
```

Then access the MinIO console at `http://localhost:9001` and create a bucket named `jotter-local`.

Update `.env`:
```env
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=jotter-local
MINIO_USE_SSL=false
```

### Option B: AWS S3

1. Create an S3 bucket in your AWS Console
2. Create an IAM user with `AmazonS3FullAccess` (or scoped policy)
3. Copy the access key and secret key
4. Update `.env` with your AWS credentials

---

## Step 6 — Run the Application

```bash
# Development with auto-reload (recommended)
npm run dev

# Or using NestJS watch mode
npm run start

# With debug port open
npm run start:debug
```

The server starts at: **`http://localhost:3000`**

---

## Step 7 — Verify the Setup

Test that the API is running:

```bash
curl http://localhost:3000
```

Expected response:
```json
{
  "message": "Jotter API is running"
}
```

Test user registration:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "Test@1234"}'
```

---

## Common Issues & Fixes

### ❌ `MongoServerError: Connection refused`

**Cause:** MongoDB is not running.

**Fix:**
```bash
# Start MongoDB locally
sudo systemctl start mongod

# Or start Docker container
docker start jotter-mongo
```

---

### ❌ `Error: Cannot find module 'tesseract.js'`

**Cause:** Dependencies not fully installed.

**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### ❌ `JWT must be provided` on protected routes

**Cause:** Missing or malformed `Authorization` header.

**Fix:** Ensure header is exactly:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### ❌ `S3 SignatureDoesNotMatch`

**Cause:** Incorrect AWS credentials or region mismatch.

**Fix:** Double-check `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION` in `.env`.

---

### ❌ `UnhandledPromiseRejectionWarning: Error: ENOENT: no such file or directory, open 'eng.traineddata'`

**Cause:** Tesseract cannot find the language data files.

**Fix:** Ensure all `.traineddata` files are in the **project root** (not inside `src/`). They should already be committed to the repository. If missing:
```bash
# Download from tesseract OCR data repo
curl -O https://github.com/tesseract-ocr/tessdata/raw/main/eng.traineddata
```

---

### ❌ `Port 3000 is already in use`

**Fix:**
```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

---

## Development Scripts Reference

| Script | Command | Description |
|---|---|---|
| Dev server | `npm run dev` | nodemon with ts-node, auto-reloads on changes |
| Start | `npm run start` | NestJS CLI watch mode |
| Debug | `npm run start:debug` | Dev server with Node.js inspector |
| Build | `npm run build` | Compile TypeScript to `dist/` |
| Production | `npm run start:prod` | Run compiled production build |
| Test | `npm run test` | Run all unit tests |
| Test watch | `npm run test:watch` | Unit tests with watch mode |
| Coverage | `npm run test:cov` | Unit tests with coverage report |
| E2E tests | `npm run test:e2e` | Run end-to-end tests |
| Lint | `npm run lint` | ESLint with auto-fix |
| Format | `npm run format` | Prettier formatting |
