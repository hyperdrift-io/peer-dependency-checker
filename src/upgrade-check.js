#!/usr/bin/env node

/**
 * Comprehensive upgrade compatibility checker
 * This script performs dry-run checks for major upgrades and peer dependency compatibility
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Starting comprehensive upgrade compatibility check...\n');

// Function to run commands safely
function runCommand(command, description) {
  console.log(`\n📋 ${description}`);
  console.log(`Running: ${command}`);
  console.log('─'.repeat(80));
  
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    console.log(output);
    return output;
  } catch (error) {
    console.log(`⚠️  Command failed: ${error.message}`);
    if (error.stdout) console.log('STDOUT:', error.stdout);
    if (error.stderr) console.log('STDERR:', error.stderr);
    return null;
  }
}

// Function to create a backup package.json for testing
function createTestPackageJson() {
  const packagePath = path.join(process.cwd(), 'package.json');
  const backupPath = path.join(process.cwd(), 'package.json.backup');
  
  if (fs.existsSync(packagePath)) {
    fs.copyFileSync(packagePath, backupPath);
    console.log('✅ Created backup of package.json');
    return true;
  }
  return false;
}

// Function to restore package.json
function restorePackageJson() {
  const packagePath = path.join(process.cwd(), 'package.json');
  const backupPath = path.join(process.cwd(), 'package.json.backup');
  
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, packagePath);
    fs.unlinkSync(backupPath);
    console.log('✅ Restored original package.json');
  }
}

// Main execution
async function main() {
  try {
    // 1. Check current outdated packages
    runCommand('pnpm outdated', '1. Current outdated packages');
    
    // 2. Check what major upgrades are available
    runCommand('ncu --target greatest', '2. All available upgrades (including major)');
    
    // 3. Check only major upgrades
    runCommand('ncu --target latest --filter "/.*/"', '3. Latest stable versions');
    
    // 4. Check peer dependency issues in current setup
    runCommand('pnpm ls --depth=0 2>&1 | grep "WARN\\|ERROR" || echo "No peer dependency warnings found"', '4. Current peer dependency warnings');
    
    // 5. Use npm-check for detailed analysis
    runCommand('npx npm-check --skip-unused', '5. Detailed upgrade analysis with npm-check');
    
    // 6. Create test scenario - backup and try major upgrades
    console.log('\n🧪 TESTING MAJOR UPGRADES (DRY RUN)');
    console.log('═'.repeat(80));
    
    const hasBackup = createTestPackageJson();
    
    if (hasBackup) {
      try {
        // Try updating package.json to latest versions
        runCommand('ncu --target greatest -u', '6a. Updating package.json to latest versions');
        
        // Check what peer dependency conflicts would occur
        runCommand('pnpm install --dry-run 2>&1 | head -50', '6b. Dry-run install to check conflicts');
        
        // Check peer dependencies with latest versions
        runCommand('pnpm ls --depth=1 2>&1 | grep "WARN\\|ERROR" | head -20 || echo "No issues found"', '6c. Peer dependency check with updated versions');
        
      } finally {
        // Always restore the original package.json
        restorePackageJson();
      }
    }
    
    // 7. Check specific high-risk upgrades
    console.log('\n🚨 HIGH-RISK UPGRADE ANALYSIS');
    console.log('═'.repeat(80));
    
    const highRiskPackages = ['react', 'react-dom', '@types/node', 'next'];
    
    for (const pkg of highRiskPackages) {
      runCommand(`npm info ${pkg} peerDependencies`, `7. Peer dependencies for ${pkg} (latest version)`);
    }
    
    // 8. Check dependency tree depth for potential conflicts
    runCommand('pnpm ls --depth=2 | grep -E "(├|└)" | wc -l', '8. Dependency tree complexity');
    
    // 9. Security audit
    runCommand('pnpm audit --audit-level moderate', '9. Security audit');
    
    // 10. Bundle size impact estimation
    runCommand('npx bundlephobia list', '10. Bundle size analysis (if bundlephobia is available)');
    
    console.log('\n🎯 RECOMMENDATIONS');
    console.log('═'.repeat(80));
    console.log(`
📝 Based on the analysis above, here are the recommended next steps:

1. 🟢 SAFE UPDATES (patch/minor):
   - These can usually be updated without issues
   - Run: pnpm update

2. 🟡 MEDIUM RISK (major versions):
   - Test in a separate branch first
   - Check breaking changes in changelogs
   - Run comprehensive tests

3. 🔴 HIGH RISK (core dependencies):
   - React 18 → 19: Check React 19 breaking changes
   - @types/node 22 → 24: Verify Node.js compatibility
   - Review peer dependency conflicts carefully

4. 🧪 TESTING STRATEGY:
   - Create feature branch: git checkout -b upgrade-dependencies
   - Update incrementally, not all at once
   - Run full test suite after each major update
   - Test in staging environment before production

5. 🔍 MONITORING:
   - Set up automated dependency checking
   - Use tools like Dependabot or Renovate
   - Regular security audits
`);

  } catch (error) {
    console.error('❌ Error during compatibility check:', error.message);
  }
}

// Handle cleanup on exit
process.on('exit', () => {
  restorePackageJson();
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 Process interrupted, cleaning up...');
  restorePackageJson();
  process.exit(1);
});

main(); 