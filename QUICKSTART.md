# BumbleKey - Quick Start Guide

## Prerequisites

- PHP >= 8.2
- Composer >= 2.6
- Node.js >= 18
- npm or pnpm

## Installation

### 1. Navigate to Project

```bash
cd /Users/refun/Desktop/bumblekey
```

### 2. Install Backend Dependencies

```bash
cd packages/backend
composer install
```

### 3. Install Frontend Dependencies

```bash
cd ../web
npm install
```

### 4. Start Development Servers

**Terminal 1 - Laravel Backend:**
```bash
cd packages/backend
php artisan serve
```
Backend will run at: http://localhost:8000

**Terminal 2 - React Frontend:**
```bash
cd packages/web
npm run dev
```
Frontend will run at: http://localhost:5173

## Database

Currently using SQLite (located at `packages/backend/database/database.sqlite`).

### View Database

```bash
cd packages/backend
php artisan db:show
```

### Run Migrations

```bash
php artisan migrate:fresh
```

### Seed Sample Data (Optional)

```bash
php artisan db:seed
```

## Next Steps

1. **Create Models**: Generate Eloquent models for all tables
2. **Build API**: Implement controllers and routes
3. **Frontend**: Build React components and pages
4. **Mobile**: Initialize React Native project

## Useful Commands

### Backend

```bash
# Create a model
php artisan make:model Property

# Create a controller
php artisan make:controller Api/PropertyController --api

# Create a seeder
php artisan make:seeder UserSeeder

# Run tests
php artisan test
```

### Frontend

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Run tests
npm test
```

## Troubleshooting

### Port Already in Use

If port 8000 or 5173 is already in use:

**Backend:**
```bash
php artisan serve --port=8001
```

**Frontend:**
Update `vite.config.ts` to change the port.

### Database Issues

Reset database:
```bash
cd packages/backend
rm database/database.sqlite
touch database/database.sqlite
php artisan migrate:fresh
```

## Support

For issues or questions, refer to:
- [Implementation Plan](file:///Users/refun/.gemini/antigravity/brain/ce927f14-dca9-4e2d-a7d1-16132bf2fa41/implementation_plan.md)
- [Walkthrough](file:///Users/refun/.gemini/antigravity/brain/ce927f14-dca9-4e2d-a7d1-16132bf2fa41/walkthrough.md)
