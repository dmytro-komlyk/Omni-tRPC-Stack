<div align="center">

# 🚀 Fullstack Boilerplate: Next.js + Nest.js + Expo (tRPC Monorepo)

</div>

<div align="center">

[![CI/CD Build Pipeline](https://github.com/dmytro-komlyk/fullstack-boilerplate-next-nest-vps/actions/workflows/ssh-build.yml/badge.svg)](https://github.com/dmytro-komlyk/fullstack-boilerplate-next-nest-vps/actions/workflows/ssh-build.yml)
[![CI/CD Deploy Pipeline](https://github.com/dmytro-komlyk/fullstack-boilerplate-next-nest-vps/actions/workflows/ssh-deploy.yml/badge.svg)](https://github.com/dmytro-komlyk/fullstack-boilerplate-next-nest-vps/actions/workflows/ssh-deploy.yml)

</div>

## 🌟 Overview

This repository is a high-performance **Monorepo** powered by PNPM Workspaces. It bridges a robust Nest.js backend, two Next.js frontend applications (Client & Admin), and a cross-platform Expo mobile app.

The standout feature is **End-to-End Type-Safety** across the entire stack using tRPC—no code generation required, just pure TypeScript.

## 🛠 Tech Stack

### Infrastructure & Monorepo

- **Monorepo Management:** PNPM Workspaces + Turborepo
- **API Layer:** tRPC (E2E Type-Safety)
- **Database:** PostgreSQL + Prisma ORM
- **Containerization:** Docker & Docker Compose

### Frontend & Mobile

- **Web:** Next.js 16 (App Router), TailwindCSS, HeroUI
- **Mobile:** Expo (React Native) + Expo Router, TailwindCSS, React Native Paper
- **State Management:** Zustand + TanStack Query (React Query)
- **Forms:** React Hook Form + Zod Validation

### Backend

- **Framework:** Nest.js (Modular Architecture)
- **Authentication:** NextAuth (Web) + JWT/SecureStore (Mobile)
- **Validation:** Shared Zod schemas across the entire Monorepo

## 📁 Project Structure

```markdown
.
├── apps
│ ├── admin # Admin Dashboard (Next.js)
│ ├── website # Customer Web App (Next.js)
│ ├── mobile # Cross-platform App (Expo / React Native)
│ ├── server # Backend API (Nest.js)
│ └── database # Dockerized PostgreSQL configurations
├── packages
│ ├── api # Shared tRPC router & client logic & shared Zod validation schemas
│ ├── store # Shared state management (Zustand)
│ ├── prisma # Database schema & Prisma Client (Shared ORM)
│ ├── ui # Shared theme provider
│ ├── next-auth # Centralized Auth configurations & providers
│ ├── shared # Common components, hooks, utilities and constants
│ ├── tailwind-config # Base TailwindCSS configurations
│ └── eslint-config # Centralized linting rules
├── docker-compose.local.yml # Local development orchestration
└── docker-compose.prod-ci.yml # Production deploy orchestration
```

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js (v20+)
- PNPM (v9+)
- Docker Desktop

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/dmytro-komlyk/fullstack-boilerplate-next-nest-vps.git
   cd fullstack-boilerplate-next-nest-vps
   ```

   or use the repository button [Use this template](https://github.com/new?template_name=fullstack-boilerplate-next-nest-vps&template_owner=dmytro-komlyk)

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Setup environment variables**

   Copy example env files for all apps and **fill in the required fields** (e.g., Auth secrets, Database credentials):

   ```bash
   pnpm run setup:local:env
   ```

4. **Spin up development environment**

   ```bash
   pnpm dev
   ```

## 📱 Mobile Development (Expo)

### Building for Production

1. **To build the project for production:**

   ```bash
   pnpm build:mobile
   ```

2. **To start the production build:**

   ```bash
   pnpm start:mobile
   ```

## 🐳 Docker Orchestration

💻 Local Development
Run the entire stack (Database + Redis + Services) locally without installing dependencies on your host machine.

1. **Set up environment variables**

   Copy example env files for all apps and **fill in the required fields** (e.g., Auth secrets, Database credentials):

   ```bash
   pnpm run setup:local:env
   ```

2. **Build and run Docker containers**

   ```bash
   docker compose -f docker-compose.local.yml up -d --build
   ```

## 🚢 Deployment & CI/CD

### CI/CD Pipeline

This project uses GitHub Actions for continuous integration and continuous deployment. The configuration files are located in the .github/workflows directory.

1. **Set up your secrets and variables in a GitHub repository**

   Go to your repository Settings > Secrets and variables > Actions and fill in the following:

   #### 🔐 Repository Secrets

   _Sensitive values (masked in logs). Add these in the **Secrets** tab._

   | Secret Name           | Description                    | Example                          |
   | :-------------------- | :----------------------------- | :------------------------------- |
   | `SSH_PASSWORD`        | Password for your VPS user     | `your_secure_password`           |
   | `EXPO_TOKEN`          | Access token for Expo EAS      | `expo_token_abc123...`           |
   | `DOCKER_HUB_USERNAME` | Your Docker Hub username       | `dmytro_komlyk`                  |
   | `DOCKER_HUB_TOKEN`    | Docker Hub token or GitHub PAT | `ghp_your_personal_access_token` |

   #### 📊 Repository Variables

   _Configuration values. Add these in the **Variables** tab._

   | Variable Name         | Description                   | Example                 |
   | :-------------------- | :---------------------------- | :---------------------- |
   | `SSH_HOST`            | IP address of your VPS        | `123.456.78.90`         |
   | `SSH_USERNAME`        | SSH login user                | `root` or `ubuntu`      |
   | `SSH_PORT`            | SSH port (default is 22)      | `22`                    |
   | `SSH_FOLDER`          | Target directory on VPS       | `/home/root/my-project` |
   | `PROD_NAME`           | Project identifier for Docker | `my-boilerplate`        |
   | `DOCKER_HUB_USERNAME` | Your Docker Hub/GHCR username | `dmytro-komlyk`         |
   | `WEBSITE_DOMAIN`      | Main website domain           | `example.com`           |
   | `ADMIN_DOMAIN`        | Admin dashboard domain        | `admin.example.com`     |
   | `SERVER_DOMAIN`       | API server domain             | `api.example.com`       |

2. 🏷️ **Set up Pull Request Labels**

   This project uses a **Smart Build System**. To save CI/CD minutes and speed up deployment, images are only built when specific labels are added to a Pull Request.
   1. Go to your repository **Pull Requests** > **Labels**.
   2. Click **New label** and create these three (names must match exactly):
      - `backend` — triggers Nest.js server build.
      - `website` — triggers Next.js client app build.
      - `admin` — triggers Next.js admin dashboard build.

   #### How to use

   When you create a Pull Request, simply attach the relevant labels. For example, if you only changed the API, add the `backend` label. GitHub Actions will skip building the frontend apps, saving you time.

   > 💡 **Tip:** You can attach multiple labels if your changes affect several applications.

### 🚢 VPS Deployment Guide

1. **Initial Server Preparation**

   Connect to your VPS via SSH and install the necessary engine:

   ```bash
   sudo apt update
   sudo apt install -y docker.io docker-compose
   sudo systemctl enable --now docker
   ```

2. **Project Infrastructure Setup**

   Navigate to your target directory (defined in your SSH_FOLDER variable) and create the following structure.

   > 💡 Note: You only need to manually create the environment files and configuration. Docker images will be pulled automatically by the CI/CD pipeline.

   ```bash
   mkdir -p apps/website apps/admin apps/server nginx
   ```

   ```markdown
   ${SSH_FOLDER}
   ├── .env # Global production variables (DB credentials, etc.)
   ├── apps
   │ ├── website/.env.production # Next.js Client environment
   │ ├── admin/.env.production # Next.js Admin environment
   │ └── server/.env.production # Nest.js API environment
   ├── nginx/ # (Optional) Nginx Proxy Manager data
   └── docker-compose.prod-ci.yml # Copied from the repository
   ```

3. **First Manual Start (Bootstrap)**
   Before the first automated deploy, log in to Docker Hub and start the initial stack:

   ```bash
   # 1. Login to Docker (Use your DOCKER_HUB_TOKEN)
   echo "YOUR_DOCKER_HUB_TOKEN" | docker login -u YOUR_DOCKER_HUB_USERNAME --password-stdin

   # 2. Start the project
   docker compose -f docker-compose.prod-ci.yml -p <PROD_NAME> up -d
   ```

## 📝 Commit Guidelines

We enforce Conventional Commits using Husky and Commitlint:

- feat: A new feature
- fix: A bug fix
- docs: Documentation only changes
- style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- refactor: A code change that neither fixes a bug nor adds a feature
- perf: A code change that improves performance
- test: Adding missing tests or correcting existing tests
- build: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- ci: Changes to CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)

## ⭐ If you find this boilerplate useful, please give it a star
