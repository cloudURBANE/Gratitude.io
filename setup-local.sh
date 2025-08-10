#!/bin/bash

echo "🚀 Setting up Dashboard for Local Development"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.local .env
    echo "⚠️  Please update .env file with your database credentials and API keys"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if PostgreSQL is running (if using Docker)
if command -v docker &> /dev/null && docker ps | grep -q postgres; then
    echo "✅ PostgreSQL is running in Docker"
elif command -v psql &> /dev/null; then
    echo "✅ PostgreSQL is installed locally"
else
    echo "⚠️  PostgreSQL not detected. Please ensure PostgreSQL is running."
    echo "   You can use Docker: docker-compose up -d postgres"
fi

# Generate database migrations
echo "🗄️  Generating database migrations..."
npm run db:generate

# Push schema to database
echo "📊 Pushing schema to database..."
npm run db:push

# Seed database (optional)
read -p "Do you want to seed the database? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    npm run db:seed
fi

echo ""
echo "🎉 Setup complete!"
echo "=================="
echo "To start the development server:"
echo "  npm run dev:local"
echo ""
echo "To view the database:"
echo "  npm run db:studio"
echo ""
echo "Access your application at: http://localhost:5000"