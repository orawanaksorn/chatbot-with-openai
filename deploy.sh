#!/bin/bash
# deploy.sh - Script สำหรับ deploy ไป production

echo "🚀 Starting deployment process..."

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Git working directory is not clean. Please commit your changes first."
    exit 1
fi

# Run tests (if any)
echo "🧪 Running tests..."
npm test

# Build and check
echo "📦 Installing dependencies..."
npm install

# Check for security vulnerabilities
echo "🔒 Checking for security vulnerabilities..."
npm audit --audit-level high

# Git operations
echo "📝 Preparing Git..."
git add .
git status

# Prompt for commit message
echo "💭 Enter commit message (or press Enter for default):"
read commit_message

if [ -z "$commit_message" ]; then
    commit_message="Deploy: Update chatbot $(date +'%Y-%m-%d %H:%M')"
fi

git commit -m "$commit_message"

# Push to main branch (will trigger Render auto-deploy)
echo "🚢 Pushing to GitHub..."
git push origin main

echo "✅ Deployment initiated! Check Render dashboard for progress."
echo "🔗 Your app will be available at: https://your-app-name.onrender.com"