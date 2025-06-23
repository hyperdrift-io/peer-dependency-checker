#!/usr/bin/env node

/**
 * Quick peer dependency compatibility checker
 * Focuses specifically on checking peer dep conflicts for potential upgrades
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Quick Peer Dependency Compatibility Check\n');

function runCmd(cmd, description) {
  console.log(`\n📋 ${description}`);
  console.log('─'.repeat(60));
  
  try {
    const output = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    console.log(output);
    return output;
  } catch (error) {
    console.log(`⚠️  ${error.message}`);
    if (error.stdout) console.log(error.stdout);
    return null;
  }
}

async function main() {
  // 1. Check current peer dependency warnings
  console.log('🔍 CURRENT PEER DEPENDENCY STATUS');
  runCmd('pnpm ls 2>&1 | grep -E "WARN|ERROR|✕" || echo "✅ No current peer dependency issues"', 'Current peer dependency warnings');
  
  // 2. Check what packages want to be upgraded
  console.log('\n📦 AVAILABLE UPGRADES');
  const outdated = runCmd('pnpm outdated --format=table', 'Outdated packages');
  
  // 3. Show peer dependencies for packages that have major upgrades available
  console.log('\n🚨 PEER DEPENDENCIES FOR MAJOR UPGRADES');
  
  const majorUpgrades = ['react@19', 'react-dom@19', '@types/node@24', 'next@15'];
  
  for (const pkg of majorUpgrades) {
    const packageName = pkg.split('@')[0];
    const version = pkg.split('@')[1];
    
    console.log(`\n🔍 Checking ${pkg}:`);
    runCmd(`npm info ${packageName}@${version} peerDependencies`, `Peer deps for ${pkg}`);
  }
  
  // 4. Simulate what would happen with a dry run
  console.log('\n🧪 DRY RUN TEST');
  console.log('Creating temporary package.json with major upgrades...');
  
  const packagePath = './package.json';
  const backupPath = './package.json.dry-test-backup';
  
  try {
    // Backup current package.json
    fs.copyFileSync(packagePath, backupPath);
    
    // Update to major versions temporarily
    runCmd('ncu --target greatest -u --filter "react,react-dom,@types/node"', 'Updating major packages');
    
    // Check what conflicts would occur
    runCmd('pnpm install --dry-run 2>&1 | head -30', 'Dry-run install results');
    
  } finally {
    // Restore original package.json
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, packagePath);
      fs.unlinkSync(backupPath);
      console.log('✅ Restored original package.json');
    }
  }
  
  console.log('\n🎯 SUMMARY');
  console.log('═'.repeat(60));
  console.log(`
✅ Use this workflow for safe major upgrades:

1. Check peer deps first:
   npm info react@19 peerDependencies
   npm info react-dom@19 peerDependencies

2. Test in isolation:
   git checkout -b test-react-19
   pnpm add react@19 react-dom@19
   pnpm install --dry-run

3. Look for these warning patterns:
   - "WARN Issues with peer dependencies found"
   - "✕ unmet peer dependency"
   - Version ranges that don't overlap

4. Update dependencies in order:
   - Core libs first (react, react-dom)
   - Type definitions (@types/*)
   - Framework-specific (next, etc.)
   - Other packages last

5. Test thoroughly:
   - pnpm test
   - pnpm test:e2e
   - Manual testing in dev
`);
}

main().catch(console.error); 