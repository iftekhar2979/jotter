<div align="center">

# 📝 Jotter 

### A powerful, feature-rich REST API backend built with NestJS

> A scalable and secure server-side application offering user authentication, cloud file storage, OCR text extraction, email notifications, and more — engineered for modern web and mobile applications.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![AWS S3](https://img.shields.io/badge/AWS-S3%20%2F%20MinIO-FF9900?style=for-the-badge&logo=amazons3&logoColor=white)](https://aws.amazon.com/s3/)
[![License](https://img.shields.io/badge/License-UNLICENSED-red?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

</div>

---

## 📚 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Environment Variables](#-environment-variables)
- [Running the App](#-running-the-app)
- [API Overview](#-api-overview)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Author](#-author)
- [License](#-license)

---

## 🔍 About the Project

**Jotter** (internally named *Vibely*) is a production-grade RESTful backend API built on the [NestJS](https://nestjs.com/) framework with TypeScript. It provides a robust foundation for building feature-rich applications requiring:

- Secure user authentication and authorization via JWT
- Cloud-based file and media storage (AWS S3 / MinIO)
- Automated email communication via Nodemailer
- Optical Character Recognition (OCR) for multilingual text extraction from images
- Modular and scalable architecture following NestJS best practices

Whether you are building a social platform, a document management system, or a content-heavy web application — Jotter provides a battle-tested backend foundation.

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login/register flows with `@nestjs/jwt` and Passport
- 🔑 **Password Hashing** — Dual-layer support with `argon2` and `bcryptjs`
- ☁️ **Cloud File Storage** — Seamless integration with AWS S3 via `multer-s3`, with MinIO support for self-hosted setups
- 📁 **File Uploads** — Robust multipart/form-data handling via `multer`
- 📧 **Email Notifications** — Transactional email delivery with `nodemailer`
- 🔍 **OCR Text Extraction** — Extract text from images using `tesseract.js` with support for **5 languages**: English, German, French, Italian, and Spanish
- ✅ **Input Validation** — Request DTOs validated with `class-validator` and `class-transformer`
- 🗄️ **MongoDB Integration** — Schema-driven data modeling with `mongoose`
- 🧪 **Testing Suite** — Unit and E2E tests powered by Jest and Supertest
- 🧹 **Code Quality** — ESLint + Prettier enforced via pre-configured rules
- ⚙️ **Configuration Management** — Environment-based config via `@nestjs/config` and `dotenv`

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| **Framework** | NestJS 10.x |
| **Language** | TypeScript 5.x |
| **Runtime** | Node.js 20.x |
| **Database** | MongoDB (via Mongoose 8.x) |
| **Authentication** | Passport.js + JWT |
| **Password Hashing** | Argon2, Bcryptjs |
| **File Storage** | AWS S3 (multer-s3), MinIO |
| **File Upload** | Multer |
| **Email** | Nodemailer |
| **OCR** | Tesseract.js 6.x |
| **Validation** | class-validator, class-transformer |
| **HTTP** | RxJS |
| **Testing** | Jest, Supertest |
| **Linting** | ESLint, Prettier |

---

## 🗂 Project Structure

```
jotter/
├── src/                          # Application source code
│   ├── app.module.ts             # Root application module
│   ├── main.ts                   # Application entry point
│   ├── auth/                     # Authentication module (JWT, Passport)
│   ├── user/                     # User management module
│   ├── file/                     # File upload & storage module
│   ├── mail/                     # Email notification module
│   ├── ocr/                      # OCR text extraction module
│   └── common/                   # Shared utilities, guards, decorators
├── test/                         # End-to-end test files
│   └── jest-e2e.json             # Jest E2E config
├── eng.traineddata               # Tesseract OCR data — English
├── deu.traineddata               # Tesseract OCR data — German
├── fra.traineddata               # Tesseract OCR data — French
├── ita.traineddata               # Tesseract OCR data — Italian
├── spa.traineddata               # Tesseract OCR data — Spanish
├── nest-cli.json                 # NestJS CLI configuration
├── tsconfig.json                 # TypeScript configuration
├── tsconfig.build.json           # TypeScript build configuration
├── .eslintrc.js                  # ESLint rules
├── .prettierrc                   # Prettier formatting rules
├── .gitignore                    # Git ignored files
└── package.json                  # Dependencies and scripts
```

> **Note:** The exact module filenames inside `src/` are inferred from the dependencies and NestJS conventions. Refer to source code for the definitive structure.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

| Tool | Version |
|---|---|
| Node.js | >= 18.x (20.x recommended) |
| npm | >= 9.x |
| MongoDB | >= 6.x (local or Atlas) |
| AWS Account | For S3 file storage (or MinIO for self-hosted) |

---

### Installation

**1. Clone the repository:**
```bash
git clone https://github.com/iftekhar2979/jotter.git
cd jotter
```

**2. Install dependencies:**
```bash
npm install
```

**3. Create your environment file:**
```bash
cp .env.example .env
# Then edit .env with your actual credentials
```

**4. (Optional) Verify Tesseract trained data files exist:**

The following OCR language files should be present in the root directory:
- `eng.traineddata`
- `deu.traineddata`
- `fra.traineddata`
- `ita.traineddata`
- `spa.traineddata`

These are committed to the repository, so no extra download is required.

---

## 🔐 Environment Variables

Create a `.env` file in the root directory. Below is a complete reference:

```env
# ─── Application ────────────────────────────────────────────
PORT=3000
NODE_ENV=development

# ─── Database ───────────────────────────────────────────────
MONGODB_URI=mongodb://localhost:27017/jotter

# ─── JWT Authentication ─────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRATION=7d

# ─── AWS S3 File Storage ────────────────────────────────────
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name

# ─── MinIO (Self-hosted S3-compatible) ──────────────────────
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=jotter-bucket
MINIO_USE_SSL=false

# ─── Email (SMTP via Nodemailer) ────────────────────────────
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_email_app_password
MAIL_FROM=noreply@jotter.app
```

> ⚠️ **Never commit your `.env` file to version control.** It is already included in `.gitignore`.

---

## ▶️ Running the App

```bash
# Development (with file watching via nodemon)
npm run dev

# Development (NestJS CLI watch mode)
npm run start

# Debug mode
npm run start:debug

# Production build
npm run build
npm run start:prod
```

---

## 📡 API Overview

The API is organized around the following resource domains. Full endpoint details are documented in [`API.md`](./API.md).

| Module | Base Route | Description |
|---|---|---|
| Auth | `/auth` | Register, login, token refresh |
| Users | `/users` | User profile management |
| Files | `/files` | Upload and retrieve files from S3/MinIO |
| OCR | `/ocr` | Extract text from uploaded images |
| Mail | `/mail` | Trigger email notifications |

All protected routes require a `Bearer` token in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token>
```

---

## 🧪 Testing

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```

---

## 🚢 Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for full deployment guides covering:
- Manual VPS/Ubuntu deployment
- Docker containerization
- PM2 process management
- Nginx reverse proxy setup
- CI/CD with GitHub Actions

**Quick production start:**
```bash
npm run build
npm run start:prod
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please ensure your code passes linting before submitting:
```bash
npm run lint
npm run format
```

---

## 👤 Author

**Iftekhar**
- GitHub: [@iftekhar2979](https://github.com/iftekhar2979)

---

## 📄 License

This project is currently **UNLICENSED** — all rights reserved by the author.

---

## 💡 Suggested Badges

Add these to the top of your README for maximum visibility:

```markdown
![GitHub last commit](https://img.shields.io/github/last-commit/iftekhar2979/jotter)
![GitHub repo size](https://img.shields.io/github/repo-size/iftekhar2979/jotter)
![GitHub issues](https://img.shields.io/github/issues/iftekhar2979/jotter)
```

---

<div align="center">
  <sub>Built with ❤️ using NestJS and TypeScript</sub>
</div>
