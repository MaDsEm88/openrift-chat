# 🚀 Complete Setup Guide for Milo Mobile

This guide will walk you through setting up the entire Milo Mobile project from scratch, including the TanStack Start web app, Expo mobile app, and Convex database.

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** and **Bun** installed
- **Git** for version control
- **iOS Simulator** (Mac only) or **Android Emulator** for mobile development
- A **Convex account** (free at [convex.dev](https://convex.dev))
- **Google OAuth credentials** (optional, for social login)

## 🏗️ Step-by-Step Setup

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/milo-mobile.git
cd milo-mobile

# Install all dependencies
bun install
```

### Step 2: Set Up Convex Database

```bash
# Initialize Convex (this will prompt you to create/select a project)
npx convex dev

# This will:
# 1. Create a new Convex project or connect to existing one
# 2. Generate convex/_generated/ folder with types
# 3. Deploy your database functions
# 4. Give you a CONVEX_URL
```

**Important**: Copy the `CONVEX_URL` from the output - you'll need it for environment variables.

### Step 3: Configure Environment Variables

#### For Web App (`apps/web-tanstack/.env.local`):
```bash
# Copy the example file
cp apps/web-tanstack/.env.example apps/web-tanstack/.env.local

# Edit the file with your values:
# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Convex Database Configuration
CONVEX_URL=https://your-deployment.convex.cloud

# Google OAuth Configuration (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### For Mobile App (`apps/mobile/.env`):
```bash
# Copy the example file
cp apps/mobile/.env.sample apps/mobile/.env

# Edit with your configuration
```

### Step 4: Start Development Servers

#### Option A: Start All Services
```bash
# From the root directory
bun dev
```

#### Option B: Start Services Individually

**Web App:**
```bash
cd apps/web
bun run dev
# Available at http://localhost:3000
```

**Mobile App:**
```bash
cd apps/mobile
bun dev
# Follow Expo CLI prompts
```

**Convex Database:**
```bash
# In a separate terminal
npx convex dev
# Keeps database functions in sync
```

## 🔧 How Each Component Works

### TanStack Start Web App

**Location**: `apps/web-tanstack/`

**Key Files**:
- `src/routes/` - File-based routing with type safety
- `src/lib/auth.ts` - Better Auth configuration with Convex
- `src/lib/auth-client.ts` - Client-side auth functions
- `src/lib/auth-server.ts` - Server-side auth functions
- `app.config.ts` - Vinxi configuration with environment variables

**How it works**:
1. **Environment Loading**: Uses `dotenv-cli` to load `.env.local`
2. **Database Connection**: Connects to Convex via the `database` package
3. **Authentication**: Better Auth with Convex adapter stores users in Convex
4. **Routing**: TanStack Router provides type-safe, file-based routing
5. **Server Functions**: Server-side functions for auth checks

### Expo Mobile App

**Location**: `apps/mobile/`

**Key Features**:
- React Native components with NativeWind styling
- Biometric authentication via expo-passkey
- Real-time data sync with Convex
- Shared authentication state with web app

### Convex Database

**Location**: `convex/` and `packages/database/`

**Key Files**:
- `convex/users.ts` - User management functions
- `convex/sessions.ts` - Session management
- `convex/accounts.ts` - OAuth account linking
- `packages/database/convex/auth_adapter.ts` - Better Auth adapter

**How it works**:
1. **Real-time Database**: Convex provides real-time updates
2. **Type Safety**: Auto-generates TypeScript types
3. **Auth Integration**: Custom adapter connects Better Auth to Convex
4. **Cross-Platform**: Same database serves web and mobile

## 🔐 Authentication Flow

### Web App Authentication:
1. User visits web app
2. TanStack Router checks authentication via server function
3. If not authenticated, redirects to `/login`
4. Better Auth handles login/signup
5. User data stored in Convex database
6. Session managed by Better Auth

### Mobile App Authentication:
1. Mobile app connects to same Convex database
2. Uses Better Auth endpoints for consistency
3. Biometric auth available via expo-passkey
4. Real-time sync with web app sessions

## 🚀 Development Workflow

### Daily Development:
```bash
# Start everything
bun dev

# Or start individually:
cd apps/web-tanstack && bun run dev    # Web app
cd apps/mobile && bun dev              # Mobile app
npx convex dev                         # Database sync
```

### Making Database Changes:
1. Edit functions in `convex/`
2. Convex automatically redeploys
3. Types regenerated in `convex/_generated/`
4. Both web and mobile get updates

### Adding New Features:
1. Add database functions in `convex/`
2. Update web routes in `apps/web-tanstack/src/routes/`
3. Update mobile screens in `apps/mobile/`
4. Shared logic goes in `packages/`

## 🔧 Troubleshooting

### Environment Variables Not Loading:
- Make sure to use `bun run dev` (not `npx vinxi dev`)
- Check `.env.local` file exists and has correct values
- Verify `dotenv-cli` is installed

### Convex Connection Issues:
- Run `npx convex dev` to ensure database is running
- Check `CONVEX_URL` in environment variables
- Verify Convex project is deployed

### Authentication Not Working:
- Check `BETTER_AUTH_SECRET` is set
- Verify Convex adapter is properly configured
- Ensure database functions are deployed

## 📱 Mobile Development

### iOS Development:
```bash
cd apps/mobile
bun ios  # Requires Xcode and iOS Simulator
```

### Android Development:
```bash
cd apps/mobile
bun android  # Requires Android Studio and Emulator
```

### Physical Device Testing:
```bash
cd apps/mobile
bun run:ios     # For iOS devices
bun run:android # For Android devices
```

This setup provides a complete, production-ready foundation for building cross-platform applications with shared authentication and real-time data sync!
