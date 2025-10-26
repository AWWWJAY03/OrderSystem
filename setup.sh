#!/bin/bash

# Order Management System - Quick Setup Script
# This script helps you set up the development environment

echo "🚀 Order Management System - Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. You have version $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Frontend dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please update it with your configuration."
else
    echo "✅ .env file already exists"
fi

# Setup automation directory
if [ -d "automation" ]; then
    echo ""
    echo "📦 Setting up automation environment..."
    cd automation
    
    if [ ! -f "package.json" ]; then
        npm init -y
    fi
    
    npm install playwright axios dotenv
    
    echo "✅ Automation dependencies installed"
    
    # Install Playwright browsers
    echo "Installing Playwright browsers..."
    npx playwright install chromium
    
    cd ..
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Set up Google Sheets (see SETUP.md)"
echo "3. Deploy Google Apps Script backend (see SETUP.md)"
echo "4. Run 'npm run dev' to start development server"
echo ""
echo "For detailed setup instructions, see SETUP.md"
echo ""
