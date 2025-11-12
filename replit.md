# Brasileirão Platform

## Overview

A social platform for Brazilian football (Brasileirão) fans to engage with their favorite teams, rate players, read exclusive journalism, and connect with other supporters. The platform combines Instagram-style feed interactions with ESPN's sports authority, creating an engaging community around Brazilian football.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool for fast development and optimized production builds
- Wouter for lightweight client-side routing
- Path aliases configured (`@/`, `@shared/`, `@assets/`) for clean imports

**UI Component Strategy**
- Shadcn/ui component library (New York variant) with Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Design system following hybrid approach: Instagram's feed patterns + ESPN's authority + Linear's typography
- Custom CSS variables for theme-able colors and consistent spacing

**State Management**
- TanStack Query (React Query) for server state management and caching
- React Context API for authentication state via `AuthContext`
- Session-based authentication with HTTP-only cookies
- Query invalidation patterns for real-time data updates

**Typography System**
- Google Fonts: Inter for UI elements, Poppins for headlines
- Hierarchical font sizing from text-xs to text-6xl
- Custom font stack defined in CSS variables

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for API routes
- Session management using `express-session` with PostgreSQL store (`connect-pg-simple`)
- Middleware chain: JSON parsing, request logging, authentication guards

**Authentication & Authorization**
- Bcrypt for password hashing (10 rounds)
- Session-based auth with 30-day cookie lifetime
- Role-based access control: FAN, JOURNALIST, ADMIN user types
- Route guards: `requireAuth` and `requireJournalist` middleware

**API Design Pattern**
- RESTful endpoints organized by resource (`/api/auth`, `/api/news`, `/api/teams`, `/api/players`)
- Consistent error handling with HTTP status codes
- Request/response logging for all API calls
- CRUD operations abstracted into storage layer

### Data Storage

**Database**
- PostgreSQL accessed via Neon serverless driver with WebSocket support
- Drizzle ORM for type-safe database queries and migrations
- Schema-first approach with shared types between client and server

**Schema Design**
- **Users**: Core user table with email, password, userType, and teamId
- **Journalists**: Extended profile for verified journalists with organization and credentials
- **Teams**: 20 Brasileirão teams with branding (colors, logos, stats)
- **Players**: Team rosters with positions, jersey numbers, photos
- **Matches**: Game records with scores, dates, and team references
- **News**: Journalist-authored content with categories (NEWS, ANALYSIS, BACKSTAGE, MARKET)
- **NewsInteractions**: Like/dislike system for news articles
- **PlayerRatings**: Fan ratings (0-10 scale) with comments and match context

**Enums**
- UserType, PlayerPosition, NewsCategory, InteractionType, JournalistStatus
- Enforced at database level for data integrity

### External Dependencies

**Database & Infrastructure**
- **Neon PostgreSQL**: Serverless Postgres database with WebSocket support
- Connection pooling via `@neondatabase/serverless`
- Environment-based configuration via `DATABASE_URL`

**UI Component Libraries**
- **Radix UI**: Accessible primitives for 20+ components (dialog, dropdown, tabs, etc.)
- **Shadcn/ui**: Pre-styled component collection built on Radix
- **Lucide React**: Icon library for consistent iconography

**Developer Tools**
- **Drizzle Kit**: Database migration management
- **TSX**: TypeScript execution for development server
- **ESBuild**: Production bundling for server code
- **Replit Plugins**: Runtime error overlay, cartographer, dev banner

**Third-Party Services**
- Google Fonts CDN for Inter and Poppins typefaces
- Team logos served from external CDN (`logodetimes.com`) or generated assets

**Form Handling**
- React Hook Form with Zod resolvers for type-safe validation
- Drizzle-Zod integration for schema-based form validation

**Date Utilities**
- date-fns for date formatting with Brazilian Portuguese locale (pt-BR)