# Highdeium - AI-Powered Multimedia Book Writing & Publishing Platform

## Overview

Highdeium is a next-generation book writing and publishing platform that allows users to create, share, and monetize multimedia-rich books with text, images, videos, and music. The platform features AI-powered content moderation, dual-channel publishing (SFW and mature content), social discovery feeds, and integrated payment processing. Built as a full-stack TypeScript application with React frontend and Express backend, it provides a comprehensive ecosystem for writers, creators, and readers to collaborate and engage with multimedia storytelling.

## User Preferences

Preferred communication style: Simple, everyday language.
Age consideration: User is under 18, prefers payment options that don't require ID verification (Cash App, debit cards).
Focus: Prioritize reading/buying books over selling (selling requires adult verification for Stripe).

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for development and building
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with CSS variables for theming and dark mode support
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Theme System**: Custom theme provider with light/dark mode toggle

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect and Passport.js
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **API Design**: RESTful endpoints with structured error handling and logging middleware

### Database Design
- **Primary Database**: PostgreSQL using Neon serverless database
- **Schema**: Shared schema definition between client and server using Drizzle
- **Key Tables**: users, books, chapters, media, comments, likes, bookmarks, follows, purchases, sessions
- **Content Types**: Support for multimedia content with genre classification and maturity ratings
- **Relationships**: Complex relational model supporting user interactions, content hierarchy, and social features

### Authentication System
- **Provider**: Replit Auth with OpenID Connect flow
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **User Management**: Automatic user creation/update with profile information
- **Authorization**: Role-based access control for creators, readers, and administrators

### Payment Processing
- **Payment Provider**: Stripe integration for subscription and one-time payments
- **Supported Models**: Book purchases, tips, subscriptions, and premium features
- **Security**: Server-side payment processing with client-side Stripe Elements

### Content Management
- **Media Support**: Images (PNG/JPG/WebP up to 4K), videos (MP4/WebM), audio (MP3/WAV)
- **Content Moderation**: AI-powered NSFW detection with dual-channel publishing
- **Editor**: Rich text editor with multimedia embedding capabilities
- **Storage**: File upload and management system for multimedia content

### Social Features
- **Discovery Engine**: Algorithm-driven content feeds with trending and recommendation systems
- **User Interactions**: Like, comment, bookmark, and follow functionality
- **Content Filtering**: Genre-based filtering with multimedia type selection
- **Community Features**: User profiles, author pages, and social engagement metrics

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit Auth OpenID Connect provider
- **Payment Processing**: Stripe payment platform with React integration
- **Development Environment**: Replit development platform with cartographer integration

### Frontend Libraries
- **UI Framework**: React with TypeScript
- **Component Library**: Radix UI primitives with Shadcn/ui abstractions
- **State Management**: TanStack Query for server state
- **Form Handling**: React Hook Form with Hookform Resolvers
- **Validation**: Zod schema validation library
- **Styling**: Tailwind CSS with class-variance-authority for component variants
- **Icons**: Lucide React icon library
- **Date Handling**: date-fns for date manipulation

### Backend Libraries
- **Web Framework**: Express.js with TypeScript
- **Database**: Drizzle ORM with Neon serverless adapter
- **Authentication**: Passport.js with OpenID Client strategy
- **Session Management**: Express Session with PostgreSQL store
- **Payment Integration**: Stripe Node.js SDK
- **Utilities**: Memoizee for caching, nanoid for ID generation

### Development Tools
- **Build Tool**: Vite for frontend bundling
- **Bundler**: esbuild for server-side bundling
- **Type Checking**: TypeScript compiler
- **Database Migrations**: Drizzle Kit for schema management
- **Error Handling**: Replit runtime error overlay for development

### External Services
- **WebSocket**: Custom WebSocket constructor for Neon database connections
- **Font Loading**: Google Fonts integration for typography
- **Development Banner**: Replit development environment integration