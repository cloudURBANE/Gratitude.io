# Overview

TipLink is a comprehensive, production-ready digital tipping platform designed to maximize earnings for service workers through optimized tip collection and analytics. The platform features real payment processing with Stripe, comprehensive analytics dashboards, QR code generation tools, profile management, and advanced optimization features. Built with a premium dark glass aesthetic and mobile-first design, TipLink transforms how workers collect and track tips while providing customers with seamless, multi-channel payment options.

# User Preferences

Preferred communication style: Simple, everyday language.
UI/UX Priority: Professional, performance-focused design over flashy animations. Realistic interactions that feel native and responsive.

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
- **Primary Provider**: Stripe integration for secure card payments with real transaction processing
- **Alternative Methods**: Enhanced deep links for Venmo, CashApp, and Zelle with automatic app launching
- **Payment Flow**: Modal-based payment selection with psychological pricing ($5, $8, $12, $20)
- **Status Tracking**: Real-time payment intent tracking and comprehensive tip status management
- **Optimization**: Analytics-driven recommendations to increase conversion rates and tip amounts
- **Review Integration**: AI-powered Google/Yelp review prompts that appear after successful tips to boost worker ratings
- **Mobile Integration**: Advanced deep linking that forces native app opening with fallback to web versions

## Mobile-First Design
- **Responsive Design**: Mobile-first approach with 390×844 viewport optimization
- **Touch Interactions**: Optimized button sizes and touch targets
- **Performance**: Lighthouse accessibility compliance and fast loading
- **Progressive Enhancement**: Works across different screen sizes and devices

## Component Architecture
- **Design System**: Consistent spacing, typography, and color variables with glassmorphism effects
- **Accessibility**: ARIA labels, keyboard navigation, and focus management
- **Animation**: Subtle transitions and gradient effects using CSS animations
- **Icon Strategy**: Inline SVG icons with lucide-react for consistent iconography
- **Advanced Features**: Analytics dashboard with Recharts, QR code generation, profile management
- **Navigation**: Full dashboard navigation between tip pages, analytics, QR tools, and settings
- **AI Review System**: Smart review prompts with star ratings, platform selection (Google/Yelp), and conversion tracking
- **Review Analytics**: Performance tracking showing review stats, conversion rates, and earning impact analysis

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18 with TypeScript, Vite for bundling and development
- **UI Components**: Radix UI primitives for accessible component foundations
- **Styling**: Tailwind CSS with PostCSS for utility-first styling approach

## Database and Backend Services
- **Database**: Neon PostgreSQL serverless database with comprehensive analytics schema
- **ORM**: Drizzle ORM with type-safe queries and real aggregation functions
- **Analytics**: Real-time tip tracking, QR scan conversion analysis, and earnings optimization
- **Validation**: Zod schemas for form validation and data integrity across profile management

## Payment and Financial Services
- **Payment Processing**: Stripe API for credit card payments and checkout sessions
- **Mobile Payments**: Deep linking integration with Venmo, CashApp, and Zelle apps
- **QR Code Generation**: External QR code API service for generating payment QR codes

## Development and Tooling
- **Development Server**: Vite with hot module replacement and proxy configuration
- **Charts & Analytics**: Recharts integration for beautiful data visualization
- **Forms**: React Hook Form with Zod validation and shadcn/ui components
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