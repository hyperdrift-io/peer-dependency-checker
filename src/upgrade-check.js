#!/usr/bin/env node

/**
 * Clean, user-friendly upgrade compatibility checker
 * Focuses on actionable insights without debug noise
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Environment flags and command line arguments
const QUICK_MODE = process.env.QUICK_MODE === 'true' || process.argv.includes('--quick');
const BRIEF_MODE = process.env.BRIEF_MODE === 'true' || process.argv.includes('--brief');

// Function to run commands silently and return results
function runCommandSilent(command, fallback = null) {
  try {
    return execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      timeout: 10000
    }).trim();
  } catch (error) {
    return fallback;
  }
}

// Function to check if a command exists
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// Function to get package manager
function getPackageManager() {
  if (fs.existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (fs.existsSync('yarn.lock')) return 'yarn';
  if (fs.existsSync('bun.lockb')) return 'bun';
  return 'npm';
}

// Function to get outdated packages cleanly
function getOutdatedPackages(packageManager) {
  let command;
  switch (packageManager) {
    case 'pnpm':
      command = 'pnpm outdated --format table';
      break;
    case 'yarn':
      command = 'yarn outdated';
      break;
    case 'bun':
      command = 'bun outdated';
      break;
    default:
      command = 'npm outdated';
  }
  
  const result = runCommandSilent(command);
  return result || 'No outdated packages found or lockfile missing';
}

// Function to check for major upgrades using ncu
function getMajorUpgrades() {
  if (!commandExists('ncu')) {
    return 'npm-check-updates not available. Install with: npm install -g npm-check-updates';
  }
  
  const result = runCommandSilent('ncu --target major --format group');
  return result || 'No major upgrades available';
}

// Function to check peer dependency issues
function checkPeerDependencies(packageManager) {
  let command;
  switch (packageManager) {
    case 'pnpm':
      command = 'pnpm ls 2>&1 | grep -i "warn\\|error" | head -5';
      break;
    case 'yarn':
      command = 'yarn list --depth=0 2>&1 | grep -i "warn\\|error" | head -5';
      break;
    default:
      command = 'npm ls 2>&1 | grep -i "warn\\|error" | head -5';
  }
  
  const result = runCommandSilent(command);
  return result || 'No peer dependency warnings detected';
}

// Function to get security audit
function getSecurityAudit(packageManager) {
  let command;
  switch (packageManager) {
    case 'pnpm':
      command = 'pnpm audit --audit-level moderate --format json';
      break;
    case 'yarn':
      command = 'yarn audit --level moderate --json';
      break;
    default:
      command = 'npm audit --audit-level moderate --json';
  }
  
  const result = runCommandSilent(command);
  if (!result) return 'No security issues found or audit unavailable';
  
  try {
    const audit = JSON.parse(result);
    if (audit.vulnerabilities && Object.keys(audit.vulnerabilities).length > 0) {
      return `${Object.keys(audit.vulnerabilities).length} vulnerabilities found`;
    }
    return 'No security issues found';
  } catch {
    return 'Security audit completed (details available with full audit)';
  }
}

// Main execution
async function main() {
  const packageManager = getPackageManager();
  
  if (QUICK_MODE) {
    // Ultra-quick scan for pre-install hooks
    console.log('⚡ Quick compatibility check...');
    
    const outdated = getOutdatedPackages(packageManager);
    if (outdated.includes('No outdated') || outdated.includes('not available')) {
      console.log('✅ No immediate compatibility issues detected');
    } else {
      console.log('⚠️  Some packages may need attention');
      if (!BRIEF_MODE) {
        console.log('   Run "pdc scan" for detailed analysis');
      }
    }
    return;
  }
  
  console.log('🔍 Scanning your project...\n');
  
  // 1. Project overview
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`📦 Project: ${packageJson.name || 'unnamed'}`);
  console.log(`🔧 Package Manager: ${packageManager}`);
  console.log(`📋 Dependencies: ${Object.keys(packageJson.dependencies || {}).length} production, ${Object.keys(packageJson.devDependencies || {}).length} development\n`);
  
  // 2. Outdated packages
  console.log('📈 OUTDATED PACKAGES');
  console.log('─'.repeat(40));
  const outdated = getOutdatedPackages(packageManager);
  console.log(outdated);
  console.log();
  
  // 3. Major upgrades available
  if (!BRIEF_MODE) {
    console.log('🚀 MAJOR UPGRADES AVAILABLE');
    console.log('─'.repeat(40));
    const majorUpgrades = getMajorUpgrades();
    console.log(majorUpgrades);
    console.log();
  }
  
  // 4. Peer dependency issues
  console.log('🔗 PEER DEPENDENCY STATUS');
  console.log('─'.repeat(40));
  const peerIssues = checkPeerDependencies(packageManager);
  console.log(peerIssues);
  console.log();
  
  // 5. Security audit
  if (!BRIEF_MODE) {
    console.log('🛡️  SECURITY STATUS');
    console.log('─'.repeat(40));
    const security = getSecurityAudit(packageManager);
    console.log(security);
    console.log();
  }
  
  // 6. Recommendations
  console.log('💡 RECOMMENDATIONS');
  console.log('─'.repeat(40));
  
  if (outdated.includes('No outdated')) {
    console.log('✅ All packages are up to date!');
  } else {
    console.log('📝 Next steps:');
    console.log(`   • Check specific upgrades: pdc check <package>@<version>`);
    console.log(`   • Safe updates: ${packageManager} update`);
    console.log('   • Review major version changes before upgrading');
  }
  
  if (!BRIEF_MODE) {
    console.log('\n🔍 For detailed analysis of specific packages:');
    console.log('   pdc check react@19 react-dom@19');
    console.log('   pdc analyze  # Deep peer dependency analysis');
  }
}

// Handle errors gracefully
process.on('uncaughtException', (error) => {
  console.error('❌ An error occurred:', error.message);
  process.exit(1);
});

main().catch(error => {
  console.error('❌ Scan failed:', error.message);
  process.exit(1);
}); 