#!/bin/bash

# Complete setup script for Indeed corporate environment
echo "🚀 Order Management System - Complete Setup"
echo "=============================================="
echo ""

# 1. Set up Java 11 (Indeed approved)
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk11.0.10_9.jdka/Contents/Home
export PATH=/usr/local/opt/node@20/bin:$PATH

echo "✅ Java 11 configured"
java -version

echo ""
echo "✅ Node version:"
node -v

# 2. Configure npm to use public registry
echo ""
echo "🔧 Configuring npm to use public registry..."
npm config set registry https://registry.npmjs.org/

# 3. Clean old installs
echo ""
echo "🧹 Cleaning old dependencies..."
rm -rf node_modules package-lock.json

# 4. Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Update .env file with your configuration"
    echo "2. Run 'npm run dev' to start the development server"
    echo "3. Visit http://localhost:5173 in your browser"
else
    echo ""
    echo "❌ Installation failed. Please check the errors above."
fi

