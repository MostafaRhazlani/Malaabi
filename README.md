# Malaabi

Malaabi is a multi-platform football ecosystem for stadium discovery, booking management, team collaboration, wallet operations, and match-day access control.

The project is built as a monorepo with:

- A NestJS backend API
- A Next.js web dashboard
- An Expo React Native mobile app

## Product Overview

Malaabi supports different user roles with dedicated workflows:

- Player:
	- Browse stadiums and search globally
	- Create and manage bookings
	- Manage team membership, invitations, and requests
	- Use wallet and transactions
	- Save favorites
- Manager:
	- Manage stadiums (info, photos, prices)
	- Manage guards
	- Monitor bookings and operational stats
- Guard:
	- Scan and verify booking QR/tokens at stadium entry
- Admin:
	- Manage users, statuses, and access at platform level

## Monorepo Structure

```text
Malaabi/
	backend/           # NestJS + Prisma API
	web-frontend/      # Next.js dashboard
	mobile-frontend/   # Expo React Native app
	docker-compose.yml
```

## Tech Stack

- Backend: NestJS, Prisma, PostgreSQL, JWT, Swagger
- Web: Next.js, React, Redux Toolkit, Tailwind
- Mobile: Expo, React Native, Expo Router, Redux Toolkit
- DevOps: Docker, Docker Compose, GitHub Actions, Docker Hub

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Docker + Docker Compose (recommended)

### 1) Clone

```bash
git clone https://github.com/MostafaRhazlani/Malaabi.git
cd Malaabi
```

### 2) Environment

Create or update your root .env file with your own values.

Required values (minimum):

- DB_PASSWORD
- DB_NAME
- JWT_SECRET
- RESEND_API_KEY
- NGROK_URL

Do not commit real secrets.

### 3) Run with Docker (recommended)

```bash
docker compose up --build
```

Services:

- Backend: http://localhost:4000
- Web: http://localhost:3001
- Mobile Metro: http://localhost:8081
- Postgres: localhost:5432

## Local Development (without Docker)

### Backend

```bash
cd backend
npm ci
npx prisma generate
npm run start:dev
```

### Web Frontend

```bash
cd web-frontend
npm ci
npm run dev
```

### Mobile Frontend

```bash
cd mobile-frontend
npm ci
npm run start
```

## Database and Prisma

Useful backend commands:

```bash
cd backend
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
```

## Quality and CI

Workflow file: .github/workflows/ci.yml

Current CI coverage:

- Backend: lint, build, unit tests
- Web: lint, build
- Mobile: lint

Triggers:

- Pull requests to main
- Pushes to main

## CD and Container Registry

Workflow file: .github/workflows/cd.yml

CD builds and publishes images to Docker Hub:

- docker.io/<dockerhub-username>/malaabi-backend
- docker.io/<dockerhub-username>/malaabi-web
- docker.io/<dockerhub-username>/malaabi-mobile

Required GitHub configuration:

- Repository variable: DOCKERHUB_USERNAME
- Repository secret: DOCKERHUB_TOKEN

## Notes

- Keep secrets in environment variables only.
- Prefer pinned image tags in production for reproducible releases.
- Mobile image is published by CD; include it in your infra only if needed for your deployment model.