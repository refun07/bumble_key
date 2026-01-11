# BumbleKey Web Application

React-based web application for the BumbleKey platform.

## Features

- **Admin Portal**: Manage hives, partners, hosts, NFC fobs, and system operations
- **Host Portal**: Property and key management, hive search, booking integration
- **Guest Flow**: Magic link access for key pickup and return

## Tech Stack

- React 19 + TypeScript
- Vite (build tool)
- React Router v7 (routing)
- Zustand (state management)
- Axios (API client)
- Tailwind CSS v4 (styling)
- React Hook Form + Zod (forms & validation)
- Mapbox GL (maps)
- Recharts (analytics charts)

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at http://localhost:5173

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000/api
VITE_MAPBOX_TOKEN=your_mapbox_token
```

## Project Structure

```
src/
├── components/          # Shared UI components
│   ├── layout/         # Layout components (Sidebar, Header)
│   ├── forms/          # Form components (Input, Select, Button)
│   └── common/         # Common components (Modal, Table, Card)
├── features/           # Feature-based modules
│   ├── auth/          # Authentication
│   ├── admin/         # Admin portal
│   ├── host/          # Host portal
│   └── guest/         # Guest flow
├── lib/               # Utilities and configurations
│   ├── api.ts         # Axios instance
│   ├── auth.ts        # Auth utilities
│   └── constants.ts   # Constants
├── store/             # Zustand stores
│   ├── authStore.ts
│   ├── hiveStore.ts
│   └── notificationStore.ts
├── types/             # TypeScript types
│   └── index.ts
├── App.tsx
└── main.tsx
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code
- `npm test` - Run tests

## Design System

The app follows the BumbleKey design system with:
- **Primary Color**: Yellow (#FDD835)
- **Secondary Color**: Black (#000000)
- **Accent**: Dark gray for text and UI elements

## API Integration

The app communicates with the Laravel backend via REST API. All API calls are proxied through Vite dev server to avoid CORS issues during development.

## License

Proprietary - All rights reserved
