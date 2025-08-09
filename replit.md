# Overview

TipLink is a modern, mobile-first digital tipping platform designed to connect service workers with customers through QR codes. The application enables workers to create personalized tip pages that customers can quickly access and use to send tips through multiple payment methods. Built with a premium dark glass aesthetic, the platform prioritizes speed, accessibility, and user experience while supporting various payment channels including Stripe, Venmo, CashApp, and Zelle.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite for development and building
- **Styling**: Tailwind CSS with a custom dark glass design system featuring glassmorphism effects
- **Component Library**: Radix UI primitives with custom components (GlassCard, GradientButton, TipPreset, PaymentMethod)
- **Routing**: Wouter for client-side routing with routes for tip pages (`/u/:handle`), checkout, success, and style guide
- **State Management**: React Query (TanStack Query) for server state management and data fetching
- **UI Theme**: Dark glass aesthetic with CSS custom properties, gradient accents, and Inter font family

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Structured tables for workers, tips, analytics, and QR scan tracking
- **API Design**: RESTful endpoints for worker management, tip processing, and analytics
- **Development**: Hot module replacement with Vite integration for seamless development experience

## Data Storage Solutions
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle with TypeScript schema definitions
- **Schema Structure**:
  - Workers table with profile information and payment handles
  - Tips table tracking payment amounts, methods, and status
  - Analytics table for performance metrics
  - QR scans table for conversion tracking
- **Migration System**: Drizzle Kit for database schema management

## Authentication and Authorization
- **Current State**: No authentication system implemented (design-first approach)
- **Planned Implementation**: Email magic links or passkeys for worker authentication
- **Session Management**: Express session configuration prepared for future implementation

## Payment Processing
- **Primary Provider**: Stripe integration for card payments and checkout sessions
- **Alternative Methods**: Deep links for Venmo, CashApp, and Zelle
- **Payment Flow**: Modal-based payment selection with QR code generation for mobile payment apps
- **Status Tracking**: Payment intent tracking and tip status management

## Mobile-First Design
- **Responsive Design**: Mobile-first approach with 390×844 viewport optimization
- **Touch Interactions**: Optimized button sizes and touch targets
- **Performance**: Lighthouse accessibility compliance and fast loading
- **Progressive Enhancement**: Works across different screen sizes and devices

## Component Architecture
- **Design System**: Consistent spacing, typography, and color variables
- **Accessibility**: ARIA labels, keyboard navigation, and focus management
- **Animation**: Subtle transitions and gradient effects using CSS animations
- **Icon Strategy**: Inline SVG icons to avoid external dependencies

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18 with TypeScript, Vite for bundling and development
- **UI Components**: Radix UI primitives for accessible component foundations
- **Styling**: Tailwind CSS with PostCSS for utility-first styling approach

## Database and Backend Services
- **Database**: Neon PostgreSQL serverless database with connection pooling
- **ORM**: Drizzle ORM with Drizzle Kit for migrations and schema management
- **Validation**: Zod for runtime type validation and schema parsing

## Payment and Financial Services
- **Payment Processing**: Stripe API for credit card payments and checkout sessions
- **Mobile Payments**: Deep linking integration with Venmo, CashApp, and Zelle apps
- **QR Code Generation**: External QR code API service for generating payment QR codes

## Development and Tooling
- **Development Server**: Vite with hot module replacement and proxy configuration
- **Runtime Error Handling**: Replit runtime error modal for development debugging
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **Build Process**: ESBuild for server bundling and Vite for client optimization

## Third-Party Integrations
- **Analytics Tracking**: QR scan conversion tracking and tip performance metrics
- **Review Platforms**: Google and Yelp review link integration for worker profiles
- **Font Loading**: Google Fonts for Inter typography with display swap optimization

## Optional External Services
- **Image Hosting**: Support for worker avatar uploads (implementation pending)
- **Email Services**: Prepared for transactional email integration
- **SMS Services**: Ready for notification system integration
- **CDN**: Optimized for static asset delivery and global performance