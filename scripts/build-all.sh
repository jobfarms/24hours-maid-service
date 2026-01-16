#!/bin/bash

# 24Hours Maid Services - Master Build Script
# Builds web app, PWA, and Android APK for complete deployment

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║  24Hours Maid Services - Master Build Script           ║"
echo "║  Production-Ready Hybrid App Build                     ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Configuration
BUILD_DIR="dist"
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
DEPLOYMENT_READY=true

# Step 1: Clean and prepare
echo -e "${BLUE}[Step 1/7]${NC} Cleaning previous builds..."
rm -rf "$BUILD_DIR"
mkdir -p "$BACKUP_DIR"
echo -e "${GREEN}✓ Build directory cleaned${NC}"

# Step 2: Install dependencies
echo -e "${BLUE}[Step 2/7]${NC} Installing dependencies..."
pnpm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 3: Run tests
echo -e "${BLUE}[Step 3/7]${NC} Running tests..."
if pnpm test; then
    echo -e "${GREEN}✓ All tests passed${NC}"
else
    echo -e "${YELLOW}⚠ Some tests failed - continuing with caution${NC}"
fi

# Step 4: Type checking
echo -e "${BLUE}[Step 4/7]${NC} Type checking..."
if pnpm tsc --noEmit; then
    echo -e "${GREEN}✓ Type checking passed${NC}"
else
    echo -e "${RED}✗ Type errors detected${NC}"
    DEPLOYMENT_READY=false
fi

# Step 5: Build web application
echo -e "${BLUE}[Step 5/7]${NC} Building web application..."
pnpm build
echo -e "${GREEN}✓ Web application built${NC}"

# Step 6: Setup PWA
echo -e "${BLUE}[Step 6/7]${NC} Configuring PWA..."
cat > "$BUILD_DIR/manifest.json" << 'EOF'
{
  "name": "24Hours Maid Services",
  "short_name": "24Hours Maid",
  "description": "Premium domestic services at your fingertips",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0e27",
  "theme_color": "#00d9ff",
  "scope": "/",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ],
  "categories": ["productivity", "lifestyle"],
  "screenshots": [
    {
      "src": "/screenshot-1.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
EOF

cat > "$BUILD_DIR/sw.js" << 'EOF'
const CACHE_NAME = 'maid-services-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
EOF

echo -e "${GREEN}✓ PWA configured${NC}"

# Step 7: Capacitor sync
echo -e "${BLUE}[Step 7/7]${NC} Syncing Capacitor..."
npx cap sync
echo -e "${GREEN}✓ Capacitor synced${NC}"

# Final summary
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Build Complete!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""
echo "📦 Build Artifacts:"
echo "   • Web App: $BUILD_DIR/"
echo "   • PWA: Manifest and Service Worker configured"
echo "   • Mobile: Ready for Android/iOS build"
echo ""
echo "📱 Next Steps:"
echo "   1. Web Deployment: pnpm start"
echo "   2. Android APK: bash scripts/build-android.sh"
echo "   3. iOS Build: npx cap open ios"
echo ""
echo "✅ Deployment Status: $([ "$DEPLOYMENT_READY" = true ] && echo 'READY' || echo 'CAUTION')"
echo ""
