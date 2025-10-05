# v2u Unified Workspace

This workspace combines both the website and R2 upload tools into a single, cohesive development environment.

## 📁 Workspace Structure

```
v2u-workspace/
├── website-clean/           # Next.js website (current repo)
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   ├── shared/            # Shared utilities (cross-repo)
│   └── scripts/           # Upload and deployment scripts
├── cloudflare-r2/         # R2 upload tools (to be added)
│   ├── bulk-upload/       # Bulk upload utilities
│   ├── management/        # R2 management tools
│   └── monitoring/        # Upload monitoring
└── workspace-tools/       # Cross-repo development tools
    ├── config/            # Shared configuration
    ├── scripts/           # Workspace management scripts
    └── docs/              # Documentation
```

## 🚀 Quick Start

### 1. Setup Workspace
```bash
# Clone or move cloudflare-r2 repo here
git clone /path/to/cloudflare-r2 ./cloudflare-r2

# Install dependencies for both
npm install                    # website-clean
cd cloudflare-r2 && npm install && cd ..

# Setup shared configuration
cp .env.example .env.local
```

### 2. Development Commands
```bash
# Start website development
npm run dev

# Upload content to R2
npm run upload:episode

# Test R2 connection
npm run r2:test

# Build and deploy everything
npm run workspace:deploy
```

## 🔧 Integration Points

### Shared Configuration
- **Environment Variables**: `.env.local` shared across both repos
- **R2 Credentials**: Common configuration for all upload tools
- **TypeScript Config**: Shared types and utilities

### Asset Pipeline
- **Automatic Upload**: Website build process uploads assets to R2
- **Cache Busting**: Hash-based versioning for all assets
- **Manifest Generation**: Asset tracking across deployments

### Development Workflow
- **Unified Commands**: Single command set for all operations
- **Cross-repo Scripts**: Tools that work with both repositories
- **Testing Utilities**: Shared testing and validation tools

## 📄 Files Created

### Shared Utilities
- `shared/r2-config.ts` - R2 configuration management
- `shared/asset-manager.ts` - Asset pipeline and manifest handling
- `scripts/r2-upload.ts` - Main upload functions
- `scripts/episode-uploader.ts` - Episode-specific upload logic

### Workspace Tools
- `dev-workflow.sh` - Cross-repo development scripts
- `package.json` - Updated with workspace commands
- `tsconfig.upload.json` - TypeScript configuration for uploads

## 🎬 Episode Upload Workflow

1. **Create Episode**: Edit and render your video
2. **Upload**: `npm run upload:episode` 
3. **Update Metadata**: Automatically updates podcast dashboard
4. **Test**: Verify access at `/r2-test`
5. **Deploy**: `npm run workspace:deploy`

## 🔗 Integration Benefits

- **Single Source of Truth**: All configuration in one place
- **Streamlined Workflow**: Upload and deploy in one command
- **Shared Utilities**: Common code across both repositories
- **Unified Testing**: Test entire pipeline from one location
- **Asset Management**: Automatic asset versioning and deployment