#!/bin/bash

# Initialize development environment
# - Switches Docker context to orbstack
# - Ensures Appwrite containers are running
# - Sets up initial admin user

set -e

echo "🚀 Initializing development environment..."

# Check and switch Docker context
CURRENT_CONTEXT=$(docker context show)
if [ "$CURRENT_CONTEXT" != "orbstack" ]; then
  echo "📦 Switching to orbstack Docker context..."
  docker context use orbstack
else
  echo "✓ Using orbstack context"
fi

# Check and start Appwrite
if docker ps --filter 'name=appwrite' --filter 'status=running' | grep -q appwrite; then
  echo "✓ Appwrite is running"
else
  echo "📦 Starting Appwrite containers..."
  docker-compose up -d appwrite
  echo "⏳ Waiting for Appwrite to be ready..."
  sleep 8
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Set up Appwrite admin user
echo ""
echo "👤 Setting up Appwrite admin user..."
npm run init:appwrite

echo ""
echo "✓ Development environment ready!"
echo ""
echo "Next steps:"
echo "  1. View Appwrite console at http://localhost:8080"
echo "  2. Run: npm run dev"
echo ""
