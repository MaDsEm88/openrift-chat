# Rift Chat - Bridge the gap betwee human and ai intelligence

<div align="center">
  <img src="./apps/web-tanstack/public/logo.png" alt="Milo Mobile" width="100" />
  <h1>Rift - Chat</h1>
  <p>A production-ready universal app monorepo featuring TanStack Start, Expo (coming soon), and Convex</p>
</div>

## 🚀 Overview

Rift Chat provides a robust foundation for building cross-platform applications with a shared codebase.

### Universal Authentication & Database System

A key innovation in is the **universal authentication and database system**:

- **TanStack Start Web App** - High-performance web frontend with superior type safety
- **Convex Database** - Real-time database that serves both web and mobile platforms
- **Better Auth** - Universal authentication system that works across platforms
- **Shared Codebase** - Common authentication logic and database schemas
- Single source of truth for user data and authentication across platforms

## ✨ Features

- **TanStack Start Web App** - High-performance web frontend with superior type safety and smaller bundle size
- **Expo Mobile App** - Cross-platform mobile experiences using React Native
- **Universal Authentication** - Better Auth system that works seamlessly across web and mobile
- **Real-time Database** - Convex database with real-time updates and type safety
- **Role-Based Access Control** - Admin dashboard with authorization via Better-Auth admin plugin
- **Biometric Authentication** - Mobile app includes passkey/biometric auth via [expo-passkey](https://www.npmjs.com/package/expo-passkey)
- **Type-Safe Database Access** - End-to-end type safety with Convex
- **Monorepo Structure** - Organized codebase with shared packages
- **Flexible Deployment** - Deploy to any Node.js-compatible hosting service

## 🛠️ Tech Stack

- **Frontend (Web)**: TanStack Start, TanStack Router, React, TailwindCSS v4, shadcn/ui
- **Frontend (Mobile)**: Expo, React Native, NativeWind
- **Authentication**: Better-Auth with Convex adapter
- **Database**: Convex (real-time, type-safe)
- **Styling**: TailwindCSS, NativeWind
- **Package Management**: Bun

## 📂 Project Structure

```
rift-chat/
├── apps/
│   ├── mobile/           # Expo mobile application
│   ├── web/     # TanStack Start web application      
├── packages/
│   ├── database/         # Shared Convex database and      auth adapter
│   ├── google-polyauth/  # Google OAuth plugin with multiple client IDs support
│   └── rift-cache/ # Custom caching solution
├── convex/               # Convex database functions and schema
└── convex/_generated/    # Auto-generated Convex types and API
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and Bun
- For mobile development: iOS Simulator/Android Emulator or physical devices
- Convex account (free tier available at [convex.dev](https://convex.dev))

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/rift-chat.git my-app

# Navigate to the project directory
cd rift-chat

# Install dependencies
bun install

# Set up environment variables
cp apps/web/.env.example apps/web-tanstack/.env.local
coming soon  -  cp apps/mobile/.env.sample apps/mobile/.env

# Configure Convex database
npx convex dev  # Follow the setup prompts

# Start development servers
bun dev
```

## 🌐 Running the Web App

```bash
# From the root directory
cd apps/web
bun run dev

# The app will be available at http://localhost:3000
```

## 📱 Running the Mobile App

```bash
# From the root directory
cd apps/mobile
bun expo start

# IMPORTANT: This requires running a development build on your own
# device or simulator and may not work reliably with Expo Go.

# For iOS simulator
bun ios

# For Android simulator
bun android

# For development build on physical device
bun run:ios    # For iOS devices
bun run:android  # For Android devices
```

## 🗄️ Database Setup

The starter kit uses Convex as the database, which provides real-time updates and type safety:

1. **Create a Convex account** at [convex.dev](https://convex.dev)
2. **Initialize Convex** in your project:
   ```bash
   npx convex dev
   ```
3. **Configure environment variables** in `apps/web/.env.local`:
   ```bash
   CONVEX_URL=https://your-deployment.convex.cloud
   ```
4. **Database functions** are located in the `convex/` directory
5. **Types are auto-generated** in `convex/_generated/`

## 🔒 Authentication

The starter kit implements a universal authentication system with Better Auth and Convex:

- **TanStack Start Web App**: Handles authentication with Better Auth and Convex adapter
- **Cross-Platform Authentication**: Consistent auth experience across web and mobile
- **Convex Integration**: User data stored in Convex database with real-time sync
- **Multiple Auth Methods**:
  - Email/Password authentication
  - Google OAuth for web and mobile
  - Apple Sign-In (iOS only)
  - Passkey Authentication via expo-passkey (mobile)

Configuration variables can be found in `apps/web-chat/.env.local` and `apps/mobile/.env`.

## 🏗️ How the Project Works

### Architecture Overview

This monorepo consists of three main components that work together:

#### 1. **TanStack Start Web App** (`apps/web/`)
- **Framework**: TanStack Start with TanStack Router
- **Purpose**: High-performance web frontend with superior type safety
- **Key Features**:
  - Server-side rendering (SSR)
  - File-based routing with type safety
  - Better Auth integration
  - Convex database connection
  - Environment variables loaded via dotenv-cli

#### 2. **Expo Mobile App** (`apps/mobile/`) - coming soon
- **Framework**: Expo with React Native
- **Purpose**: Cross-platform mobile application
- **Key Features**:
  - Native mobile UI components
  - Biometric authentication
  - Shared authentication with web app
  - Real-time data sync via Convex

#### 3. **Convex Database** (`convex/` & `packages/database/`)
- **Database**: Convex real-time database
- **Purpose**: Centralized data storage and real-time sync
- **Key Features**:
  - Real-time updates across all platforms
  - Type-safe database operations
  - Built-in authentication adapter for Better Auth
  - Auto-generated TypeScript types

### Data Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web App       │    │   Mobile App    │    │   Convex DB     │
│ (TanStack Start)│    │    (Expo)       │    │  (Real-time)    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Better Auth   │◄──►│ • Better Auth   │◄──►│ • User Data     │
│ • TanStack      │    │ • React Native  │    │ • Sessions      │
│   Router        │    │ • Expo SDK      │    │ • Real-time     │
│ • Convex Client │    │ • Convex Client │    │   Updates       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Shared Packages

- **`packages/database/`**: Convex client and Better Auth adapter
- **`packages/google-polyauth/`**: Google OAuth with multiple client IDs
- **`packages/rift-cache/`**: Custom caching solution

## 🚢 Deployment

The web app can be deployed to any platform that runs Node.js:

- Vercel
- Netlify
- AWS
- Cloudflare Pages
- Self-hosted infrastructure

For mobile app deployment, follow standard Expo build and submission processes for App Store and Google Play.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
