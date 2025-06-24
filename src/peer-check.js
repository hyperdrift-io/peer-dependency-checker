#!/usr/bin/env node

/**
 * Clean peer dependency compatibility checker
 * Focuses on actionable peer dependency insights
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Environment flags
const BRIEF_MODE = process.env.BRIEF_MODE === 'true';

// Function to run commands silently
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

// Function to get package manager
function getPackageManager() {
  if (fs.existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (fs.existsSync('yarn.lock')) return 'yarn';
  if (fs.existsSync('bun.lockb')) return 'bun';
  return 'npm';
}

// Function to check current peer dependency issues
function getCurrentPeerIssues(packageManager) {
  let command;
  switch (packageManager) {
    case 'pnpm':
      command = 'pnpm ls 2>&1 | grep -E "WARN|ERROR|✕" | head -10';
      break;
    case 'yarn':
      command = 'yarn list --depth=0 2>&1 | grep -E "warning|error" | head -10';
      break;
    default:
      command = 'npm ls 2>&1 | grep -E "WARN|ERROR|missing" | head -10';
  }
  
  const result = runCommandSilent(command);
  return result || 'No peer dependency issues detected';
}

// Function to get peer dependencies for a package
function getPeerDependencies(packageName, version = 'latest') {
  const result = runCommandSilent(`npm info ${packageName}@${version} peerDependencies --json`);
  if (!result) return null;
  
  try {
    return JSON.parse(result);
  } catch {
    return null;
  }
}

// Function to analyze potential conflicts
function analyzePotentialConflicts() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const currentDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // Common packages that often have peer dependency conflicts
  const criticalPackages = [
    'react', 'react-dom', '@types/react', '@types/react-dom',
    'next', 'typescript', '@types/node', 'eslint'
  ];
  
  const conflicts = [];
  
  for (const pkg of criticalPackages) {
    if (currentDeps[pkg]) {
      const currentVersion = currentDeps[pkg].replace(/[\^~]/, '');
      const latestPeerDeps = getPeerDependencies(pkg, 'latest');
      
      if (latestPeerDeps && Object.keys(latestPeerDeps).length > 0) {
        conflicts.push({
          package: pkg,
          current: currentVersion,
          peerDeps: latestPeerDeps
        });
      }
    }
  }
  
  return conflicts;
}

async function main() {
  const packageManager = getPackageManager();
  
  if (BRIEF_MODE) {
    console.log('🔗 Checking peer dependencies...');
    const issues = getCurrentPeerIssues(packageManager);
    if (issues === 'No peer dependency issues detected') {
      console.log('✅ No peer dependency conflicts found');
    } else {
      console.log('⚠️  Peer dependency issues detected');
      console.log('   Run "pdc analyze" for details');
    }
    return;
  }
  
  console.log('🔗 Analyzing peer dependencies...\n');
  
  // 1. Current status
  console.log('📋 CURRENT PEER DEPENDENCY STATUS');
  console.log('─'.repeat(40));
  const currentIssues = getCurrentPeerIssues(packageManager);
  console.log(currentIssues);
  console.log();
  
  // 2. Potential conflicts analysis
  console.log('⚠️  POTENTIAL UPGRADE CONFLICTS');
  console.log('─'.repeat(40));
  
  const conflicts = analyzePotentialConflicts();
  
  if (conflicts.length === 0) {
    console.log('✅ No major peer dependency conflicts detected');
  } else {
    conflicts.forEach(conflict => {
      console.log(`📦 ${conflict.package}@${conflict.current}`);
      console.log(`   Peer dependencies:`);
      Object.entries(conflict.peerDeps).forEach(([dep, version]) => {
        console.log(`   • ${dep}: ${version}`);
      });
      console.log();
    });
  }
  
  // 3. Recommendations
  console.log('💡 RECOMMENDATIONS');
  console.log('─'.repeat(40));
  
  if (currentIssues === 'No peer dependency issues detected') {
    console.log('✅ Your peer dependencies look good!');
    console.log('   • Safe to proceed with minor updates');
    console.log('   • Review major upgrades carefully');
  } else {
    console.log('📝 Action needed:');
    console.log('   • Resolve current peer dependency warnings first');
    console.log('   • Check package documentation for compatibility');
    console.log('   • Test upgrades in a separate branch');
  }
  
  console.log('\n🔍 For specific package analysis:');
  console.log('   pdc check react@19 react-dom@19');
  console.log('   pdc scan  # Full project analysis');
}

// Handle errors gracefully
process.on('uncaughtException', (error) => {
  console.error('❌ An error occurred:', error.message);
  process.exit(1);
});

main().catch(error => {
  console.error('❌ Analysis failed:', error.message);
  process.exit(1);
}); 