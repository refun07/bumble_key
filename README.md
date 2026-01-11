# BumbleKey Monorepo

A comprehensive key-sharing platform with Laravel backend, React web frontend, and React Native mobile applications.

## 🏗️ Project Structure

```
bumblekey/
├── packages/
│   ├── backend/              # Laravel API
│   ├── web/                  # React web application
│   ├── mobile/               # React Native mobile app
│   └── shared/               # Shared packages
│       ├── types/            # TypeScript types
│       ├── utils/            # Shared utilities
│       └── constants/        # Shared constants
├── docs/                     # Documentation
├── scripts/                  # Build/deployment scripts
└── .github/                  # CI/CD workflows
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **PHP** >= 8.2
- **Composer** >= 2.6
- **PostgreSQL** >= 15
- **Redis** >= 7.0

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bumblekey
   ```

2. **Install dependencies**
   ```bash
   # Install Node.js dependencies
   pnpm install
   
   # Install PHP dependencies
   cd packages/backend
   composer install
   ```

3. **Setup environment**
   ```bash
   # Backend
   cd packages/backend
   cp .env.example .env
   php artisan key:generate
   
   # Create database
   createdb bumble_key
   
   # Run migrations
   php artisan migrate
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   pnpm dev:backend
   
   # Terminal 2 - Web
   pnpm dev:web
   
   # Terminal 3 - Mobile
   pnpm dev:mobile
   ```

## 📦 Packages

### Backend (Laravel)
- **Location**: `packages/backend`
- **Tech**: Laravel 11, PostgreSQL, Redis
- **Port**: 8000

### Web (React)
- **Location**: `packages/web`
- **Tech**: React 18, Vite, TypeScript, Tailwind CSS
- **Port**: 5173

### Mobile (React Native)
- **Location**: `packages/mobile`
- **Tech**: React Native 0.73, TypeScript
- **Platforms**: iOS, Android

### Shared Packages
- **@bumblekey/types**: Shared TypeScript types
- **@bumblekey/utils**: Shared utility functions
- **@bumblekey/constants**: Shared constants

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev:web          # Start web dev server
pnpm dev:mobile       # Start mobile dev server
pnpm dev:backend      # Start Laravel server

# Build
pnpm build:web        # Build web for production
pnpm build:mobile     # Build mobile apps

# Testing
pnpm test             # Run all tests
pnpm test:backend     # Run Laravel tests
pnpm test:web         # Run web tests

# Linting & Formatting
pnpm lint             # Lint all packages
pnpm format           # Format code with Prettier

# Cleanup
pnpm clean            # Remove all node_modules
```

## 🗄️ Database

**Database Name**: `bumble_key`

### Migrations

```bash
cd packages/backend
php artisan migrate
php artisan db:seed  # Optional: seed sample data
```

## 🌐 API Documentation

API documentation is available at:
- **Development**: http://localhost:8000/api/documentation
- **Staging**: TBD
- **Production**: TBD

## 📱 Mobile Development

### iOS
```bash
cd packages/mobile
pnpm ios
```

### Android
```bash
cd packages/mobile
pnpm android
```

## 🧪 Testing

### Backend Tests
```bash
cd packages/backend
php artisan test
```

### Frontend Tests
```bash
cd packages/web
pnpm test
```

### Mobile Tests
```bash
cd packages/mobile
pnpm test
```

## 🚢 Deployment

Deployment guides are available in the `docs/` directory:
- [Backend Deployment](docs/deployment/backend.md)
- [Web Deployment](docs/deployment/web.md)
- [Mobile Deployment](docs/deployment/mobile.md)

## 📄 License

Proprietary - All rights reserved

## 👥 Team

- **Product**: BumbleKey Team
- **Development**: [Your Team]

## 📞 Support

For support, email support@bumblekey.com
