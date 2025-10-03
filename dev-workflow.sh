#!/bin/bash
# Cross-repo Development Scripts for v2u Workspace
# Works with both website and cloudflare-r2 repositories

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
WORKSPACE_ROOT="$(pwd)"
WEBSITE_DIR="$WORKSPACE_ROOT"
R2_TOOLS_DIR="$WORKSPACE_ROOT/r2-tools"

echo -e "${BLUE}🚀 v2u Workspace Development Tools${NC}"
echo "================================="

# Function to check if directory exists
check_directory() {
    if [ ! -d "$1" ]; then
        echo -e "${RED}❌ Directory not found: $1${NC}"
        return 1
    fi
    return 0
}

# Function to setup shared configuration
setup_shared_config() {
    echo -e "${YELLOW}📋 Setting up shared configuration...${NC}"
    
    # Create shared directories
    mkdir -p shared
    mkdir -p r2-tools
    
    # Copy environment template if it doesn't exist
    if [ ! -f .env.local ]; then
        cat > .env.local << EOF
# Shared R2 Configuration for v2u Workspace
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY=your-access-key
R2_SECRET_KEY=your-secret-key
R2_BUCKET=v2u-private
R2_PUBLIC_URL=https://your-custom-domain.com

# Next.js Configuration
NEXTAUTH_SECRET=your-nextauth-secret
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
JWT_SECRET=your-jwt-secret
EOF
        echo -e "${GREEN}✅ Created .env.local template${NC}"
        echo -e "${YELLOW}⚠️  Please update .env.local with your actual credentials${NC}"
    fi
    
    echo -e "${GREEN}✅ Shared configuration setup complete${NC}"
}

# Function to test R2 connection
test_r2_connection() {
    echo -e "${YELLOW}🔍 Testing R2 connection...${NC}"
    npx tsx -e "
    import { DevWorkflow } from './shared/asset-manager.js';
    
    if (!DevWorkflow.checkR2Setup()) {
        console.log('❌ R2 not configured');
        DevWorkflow.printSetupInstructions();
        process.exit(1);
    }
    
    DevWorkflow.testR2Connection().then(success => {
        process.exit(success ? 0 : 1);
    });
    "
}

# Function to sync assets between repos
sync_assets() {
    echo -e "${YELLOW}🔄 Syncing assets across repositories...${NC}"
    
    # Create asset manifest
    npx tsx -e "
    import V2UAssetManager from './shared/asset-manager.js';
    
    const manager = new V2UAssetManager();
    manager.loadManifest().then(manifest => {
        console.log('📄 Asset manifest loaded:', Object.keys(manifest.assets).length, 'assets');
    });
    "
    
    echo -e "${GREEN}✅ Asset sync complete${NC}"
}

# Function to build and deploy
build_and_deploy() {
    echo -e "${YELLOW}🏗️  Building and deploying...${NC}"
    
    # Build Next.js app
    echo -e "${BLUE}Building Next.js application...${NC}"
    npm run build
    
    # Upload new assets to R2
    echo -e "${BLUE}Uploading assets to R2...${NC}"
    npm run upload:assets || echo -e "${YELLOW}⚠️  Asset upload skipped (run separately if needed)${NC}"
    
    echo -e "${GREEN}✅ Build and deploy complete${NC}"
}

# Function to start development environment
dev_start() {
    echo -e "${YELLOW}🛠️  Starting development environment...${NC}"
    
    # Test R2 connection first
    if test_r2_connection; then
        echo -e "${GREEN}✅ R2 connection verified${NC}"
    else
        echo -e "${YELLOW}⚠️  R2 connection failed, but continuing...${NC}"
    fi
    
    # Start Next.js development server
    echo -e "${BLUE}Starting Next.js development server...${NC}"
    npm run dev
}

# Function to upload specific episode
upload_episode() {
    local episode_path="$1"
    local episode_type="$2"
    
    if [ -z "$episode_path" ]; then
        echo -e "${RED}❌ Please provide episode path${NC}"
        echo "Usage: $0 upload-episode [path] [type]"
        echo "Types: landscape, portrait, premium"
        exit 1
    fi
    
    echo -e "${YELLOW}📹 Uploading episode: $episode_path${NC}"
    
    npx tsx scripts/episode-uploader.ts "$episode_path" "$episode_type"
}

# Main command handling
case "${1:-help}" in
    "setup")
        setup_shared_config
        ;;
    "test-r2")
        test_r2_connection
        ;;
    "sync")
        sync_assets
        ;;
    "build")
        build_and_deploy
        ;;
    "dev")
        dev_start
        ;;
    "upload-episode")
        upload_episode "$2" "$3"
        ;;
    "help"|*)
        echo -e "${BLUE}Available commands:${NC}"
        echo "  setup           - Setup shared configuration"
        echo "  test-r2         - Test R2 connection"
        echo "  sync            - Sync assets between repos"
        echo "  build           - Build and deploy"
        echo "  dev             - Start development environment"
        echo "  upload-episode  - Upload specific episode"
        echo ""
        echo -e "${BLUE}Examples:${NC}"
        echo "  $0 setup"
        echo "  $0 dev"
        echo '  $0 upload-episode "/path/to/video.mp4" landscape'
        ;;
esac