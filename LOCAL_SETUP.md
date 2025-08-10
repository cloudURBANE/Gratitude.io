# 🏠 Local Development Setup Guide

This guide will help you migrate your dashboard from the cloud (Vercel + Railway) to a local development environment.

## 📋 Prerequisites

### 1. Install Required Software
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download here](https://www.postgresql.org/download/)
- **Git** (for version control)

### 2. Database Setup
```bash
# Install PostgreSQL locally
# On Ubuntu/Debian:
sudo apt update
sudo apt install postgresql postgresql-contrib

# On macOS with Homebrew:
brew install postgresql
brew services start postgresql

# On Windows:
# Download and install from https://www.postgresql.org/download/windows/

# Create database and user
sudo -u postgres psql
CREATE DATABASE dashboard_db;
CREATE USER dashboard_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE dashboard_db TO dashboard_user;
\q
```

### 3. Environment Configuration
1. Copy `.env.local` to `.env`:
   ```bash
   cp .env.local .env
   ```

2. Update the `.env` file with your local database credentials:
   ```bash
   DATABASE_URL="postgresql://dashboard_user:your_password@localhost:5432/dashboard_db"
   ```

3. Set up external services (optional for basic functionality):
   - **Stripe**: Get test keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
   - **PayPal**: Get sandbox credentials from [PayPal Developer](https://developer.paypal.com/)
   - **OpenAI**: Get API key from [OpenAI Platform](https://platform.openai.com/)
   - **Google Cloud**: Set up service account for file storage

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Run the complete setup script
npm run setup:local
```

### Option 2: Manual Setup
```bash
# 1. Install dependencies
npm install

# 2. Generate database migrations
npm run db:generate

# 3. Push schema to database
npm run db:push

# 4. Seed the database (optional)
npm run db:seed

# 5. Start development server
npm run dev:local
```

## 🔧 Development Workflow

### Starting the Application
```bash
npm run dev:local
```
This will start both the backend API and frontend development server on `http://localhost:5000`

### Database Management
```bash
# View database in browser
npm run db:studio

# Generate new migration
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema changes directly
npm run db:push
```

### Building for Production
```bash
npm run build
npm start
```

## 🌐 Access Points

- **Frontend**: http://localhost:5000
- **API**: http://localhost:5000/api/*
- **Database Studio**: http://localhost:4983 (when running `npm run db:studio`)

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in `.env`
   - Verify database and user exist

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill process using the port: `lsof -ti:5000 | xargs kill -9`

3. **Missing Dependencies**
   - Run `npm install` again
   - Clear node_modules: `rm -rf node_modules package-lock.json && npm install`

4. **Environment Variables Not Loading**
   - Ensure `.env` file exists in root directory
   - Restart the development server

### Database Reset
```bash
# Drop and recreate database
sudo -u postgres psql
DROP DATABASE dashboard_db;
CREATE DATABASE dashboard_db;
GRANT ALL PRIVILEGES ON DATABASE dashboard_db TO dashboard_user;
\q

# Re-run setup
npm run setup:local
```

## 📁 Project Structure

```
├── client/           # React frontend
├── server/           # Express.js backend
├── shared/           # Shared types and schema
├── migrations/       # Database migrations
├── dist/            # Build output
├── .env             # Environment variables
└── package.json     # Dependencies and scripts
```

## 🔄 Deployment Workflow

1. **Local Development**: Make changes locally
2. **Testing**: Test functionality locally
3. **Git Push**: Commit and push to Git
4. **Cloud Deployment**: Vercel and Railway auto-deploy from Git

## 🎯 Next Steps

1. Set up your external service credentials
2. Customize the authentication system for local development
3. Configure your IDE for optimal development experience
4. Set up automated testing if needed

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Ensure all prerequisites are properly installed
4. Verify environment variables are correctly set