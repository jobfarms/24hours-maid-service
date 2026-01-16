#!/bin/bash

# 24Hours Maid Services - Android APK Build Script
# This script builds the hybrid app for Android deployment

set -e

echo "=========================================="
echo "24Hours Maid Services - Android Build"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}[1/6]${NC} Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js not found${NC}"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}Error: pnpm not found${NC}"
    exit 1
fi

# Build web app
echo -e "${BLUE}[2/6]${NC} Building web application..."
pnpm build
echo -e "${GREEN}✓ Web build complete${NC}"

# Install dependencies
echo -e "${BLUE}[3/6]${NC} Installing dependencies..."
pnpm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Add Android platform if not exists
echo -e "${BLUE}[4/6]${NC} Setting up Capacitor Android platform..."
if [ ! -d "android" ]; then
    npx cap add android
    echo -e "${GREEN}✓ Android platform added${NC}"
else
    echo -e "${GREEN}✓ Android platform already exists${NC}"
fi

# Sync Capacitor
echo -e "${BLUE}[5/6]${NC} Syncing Capacitor files..."
npx cap sync android
echo -e "${GREEN}✓ Capacitor sync complete${NC}"

# Build APK
echo -e "${BLUE}[6/6]${NC} Building APK..."
cd android
./gradlew assembleDebug
cd ..

APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    echo -e "${GREEN}✓ APK build successful!${NC}"
    echo -e "${GREEN}APK Location: $APK_PATH${NC}"
    echo ""
    echo "=========================================="
    echo "Build Summary:"
    echo "=========================================="
    echo "App: 24Hours Maid Services"
    echo "Platform: Android"
    echo "Build Type: Debug"
    echo "APK: $APK_PATH"
    echo "Size: $(du -h $APK_PATH | cut -f1)"
    echo "=========================================="
else
    echo -e "${RED}✗ APK build failed${NC}"
    exit 1
fi
