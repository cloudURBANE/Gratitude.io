# 🏠 Local Development - Dashboard

Quick start guide for running your dashboard locally.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL (or Docker)

### Option 1: Automated Setup
```bash
# Run the setup script
./setup-local.sh
```

### Option 2: Manual Setup
```bash
# 1. Copy environment file
cp .env.local .env

# 2. Update .env with your database credentials
# DATABASE_URL="postgresql://username:password@localhost:5432/dashboard_db"

# 3. Install and setup
npm run setup:local

# 4. Start development
npm run dev:local
```

## 🐳 Docker Option
```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Then run the setup
npm run setup:local
```

## 🌐 Access Points
- **App**: http://localhost:5000
- **Database Studio**: http://localhost:4983 (`npm run db:studio`)

## 📚 Full Documentation
See [LOCAL_SETUP.md](./LOCAL_SETUP.md) for detailed instructions.

## 🔧 Development Commands
```bash
npm run dev:local          # Start development server
npm run db:studio          # Open database browser
npm run db:generate        # Generate migrations
npm run db:push           # Push schema changes
npm run build             # Build for production
```