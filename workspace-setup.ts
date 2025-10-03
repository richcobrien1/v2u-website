// Simple Windows-compatible workspace management
// Run with: npx tsx workspace-setup.ts

import fs from 'fs/promises';
import path from 'path';

async function setupWorkspace() {
  console.log('🚀 Setting up v2u Unified Workspace...');
  
  try {
    // Check if .env.local exists
    try {
      await fs.access('.env.local');
      console.log('✅ .env.local found');
    } catch {
      console.log('📋 Creating .env.local from template...');
      try {
        const template = await fs.readFile('.env.example', 'utf-8');
        await fs.writeFile('.env.local', template);
        console.log('✅ .env.local created from template');
        console.log('⚠️  Please update .env.local with your actual credentials');
      } catch {
        console.log('❌ Could not create .env.local');
      }
    }
    
    // Create workspace directories
    const dirs = [
      'workspace-tools',
      'workspace-tools/config',
      'workspace-tools/scripts',
      'workspace-tools/docs'
    ];
    
    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      } catch {
        console.log(`✅ Directory exists: ${dir}`);
      }
    }
    
    // Create workspace package.json
    const workspacePackage = {
      name: 'v2u-workspace',
      version: '1.0.0',
      description: 'Unified v2u workspace with website and R2 tools',
      private: true,
      workspaces: [
        'website-clean',
        'cloudflare-r2'
      ],
      scripts: {
        'setup': 'npx tsx workspace-setup.ts',
        'dev:website': 'cd website-clean && npm run dev',
        'build:website': 'cd website-clean && npm run build',
        'upload:episode': 'cd website-clean && npm run upload:episode',
        'test:r2': 'cd website-clean && npx tsx -e "console.log(\'🔍 Testing R2 connection...\'); import(\'./shared/asset-manager.js\').then(m => m.DevWorkflow.testR2Connection())"',
        'workspace:status': 'echo "📊 Workspace Status:" && echo "📁 Website: $(if [ -d website-clean ]; then echo ✅; else echo ❌; fi)" && echo "📁 R2 Tools: $(if [ -d cloudflare-r2 ]; then echo ✅; else echo ❌; fi)"'
      }
    };
    
    // Only create if we're in the parent directory
    const currentDir = path.basename(process.cwd());
    if (currentDir !== 'website-clean') {
      await fs.writeFile('../package.json', JSON.stringify(workspacePackage, null, 2));
      console.log('✅ Created workspace package.json');
    }
    
    console.log('\n🎉 Workspace setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Update .env.local with your R2 credentials');
    console.log('2. Test R2 connection: npm run test:r2');
    console.log('3. Upload your episode: npm run upload:episode');
    console.log('4. Start development: npm run dev');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupWorkspace();