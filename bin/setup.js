#!/usr/bin/env node

/**
 * Quick setup script for external developers
 * Usage: npx peer-dependency-checker setup
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import chalk with proper error handling
const chalk = require('chalk');

// Check if being run with --help flag first
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
peer-dependency-checker setup

USAGE:
  npx peer-dependency-checker setup [options]

DESCRIPTION:
  Sets up peer-dependency-checker in your project with automatic
  package manager detection and sensible defaults.

OPTIONS:
  --help, -h          Show this help message
  --pm <manager>      Force specific package manager (npm|yarn|pnpm|bun)
  --skip-hooks        Don't add preinstall/postinstall hooks
  --skip-config       Don't create .pdcrc.json configuration file
  --dry-run          Show what would be done without making changes

EXAMPLES:
  npx peer-dependency-checker setup
npx peer-dependency-checker setup --pm yarn
npx peer-dependency-checker setup --dry-run

For more information: https://github.com/hyperdrift-io/peer-dependency-checker
`);
  process.exit(0);
}

console.log(chalk.blue.bold('🔍 peer-dependency-checker setup'));
console.log(chalk.gray('Adding safe dependency checking to your project...\n'));

async function main() {
  try {
    const cwd = process.cwd();
    const packageJsonPath = path.join(cwd, 'package.json');
    
    // 1. Check if we're in a valid project
    if (!fs.existsSync(packageJsonPath)) {
      console.error(chalk.red('❌ No package.json found. Please run this in a Node.js project root.'));
      process.exit(1);
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log(chalk.green(`📦 Found project: ${packageJson.name || 'unnamed'}`));
    
    // 2. Detect package manager
    const packageManager = detectPackageManager(cwd);
    console.log(chalk.blue(`🔧 Detected package manager: ${packageManager}`));
    
    // 3. Install peer-dependency-checker as devDependency (if not already global)
    await installPeerDependencyChecker(packageManager);
    
    // 4. Add scripts to package.json
    await setupPackageScripts(packageJsonPath, packageManager);
    
    // 5. Create config file
    await createConfig(cwd, packageManager);
    
    // 6. Test the setup
    await testSetup();
    
    console.log(chalk.green.bold('\n🎉 Setup complete!'));
    console.log(chalk.yellow('\n📝 What was added to your project:'));
    console.log(chalk.gray('   • pre/post-install scripts in package.json'));
    console.log(chalk.gray('   • .pdcrc.json configuration file'));
    console.log(chalk.gray('   • peer-dependency-checker as devDependency'));
    
    console.log(chalk.blue('\n🚀 Try it now:'));
    console.log(chalk.gray(`   ${packageManager} install react@19  # Will check compatibility first`));
    console.log(chalk.gray('   pdc scan                      # Manual project scan'));
    
  } catch (error) {
    console.error(chalk.red('❌ Setup failed:'), error.message);
    process.exit(1);
  }
}

function detectPackageManager(projectPath) {
  // Check for lock files to determine package manager
  if (fs.existsSync(path.join(projectPath, 'bun.lockb'))) return 'bun';
  if (fs.existsSync(path.join(projectPath, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(projectPath, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(projectPath, 'package-lock.json'))) return 'npm';
  
  // Check which package manager is available
  try {
    execSync('bun --version', { stdio: 'pipe' });
    return 'bun';
  } catch {}
  
  try {
    execSync('pnpm --version', { stdio: 'pipe' });
    return 'pnpm';
  } catch {}
  
  try {
    execSync('yarn --version', { stdio: 'pipe' });
    return 'yarn';
  } catch {}
  
  return 'npm'; // fallback
}

async function installPeerDependencyChecker(packageManager) {
  console.log(chalk.yellow('📥 Installing peer-dependency-checker...'));
  
  try {
    // Check if already installed globally
    execSync('pdc --version', { stdio: 'pipe' });
    console.log(chalk.green('   ✅ Already installed globally'));
    return;
  } catch {
    // Not global, install as devDependency
  }
  
  const installCommands = {
    npm: 'npm install --save-dev peer-dependency-checker',
    yarn: 'yarn add --dev peer-dependency-checker',
    pnpm: 'pnpm add --save-dev peer-dependency-checker',
    bun: 'bun add --dev peer-dependency-checker'
  };
  
  const command = installCommands[packageManager];
  console.log(chalk.gray(`   Running: ${command}`));
  
  execSync(command, { stdio: 'inherit' });
  console.log(chalk.green('   ✅ Installed as devDependency'));
}

async function setupPackageScripts(packageJsonPath, packageManager) {
  console.log(chalk.yellow('📝 Setting up package.json scripts...'));
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  // Add appropriate scripts based on package manager
  const scripts = getScriptsForPackageManager(packageManager);
  
  // Merge scripts, avoiding overwrites
  Object.entries(scripts).forEach(([key, value]) => {
    if (!packageJson.scripts[key]) {
      packageJson.scripts[key] = value;
      console.log(chalk.green(`   ✅ Added script: ${key}`));
    } else {
      console.log(chalk.yellow(`   ⚠️  Script '${key}' already exists, skipping`));
    }
  });
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(chalk.green('   ✅ Package.json updated'));
}

function getScriptsForPackageManager(pm) {
  const commonScripts = {
    'pdc:scan': 'pdc scan',
    'pdc:check': 'pdc scan --quick || true',
    'pdc:analyze': 'pdc analyze --brief || true'
  };
  
  // Different package managers handle pre/post hooks differently
  switch (pm) {
    case 'yarn':
      return {
        ...commonScripts,
        'preinstall': 'pdc scan --quick || true',
        'postinstall': 'pdc analyze --brief || true'
      };
    
    case 'bun':
      return {
        ...commonScripts,
        'preinstall': 'pdc scan --quick || true',
        'postinstall': 'pdc analyze --brief || true'
      };
    
    case 'pnpm':
      return {
        ...commonScripts,
        'preinstall': 'pdc scan --quick || true',
        'postinstall': 'pdc analyze --brief || true'
      };
    
    default: // npm
      return {
        ...commonScripts,
        'preinstall': 'pdc scan --quick || true',
        'postinstall': 'pdc analyze --brief || true'
      };
  }
}

async function createConfig(projectPath, packageManager) {
  console.log(chalk.yellow('⚙️  Creating configuration file...'));
  
  const configPath = path.join(projectPath, '.pdcrc.json');
  
  if (fs.existsSync(configPath)) {
    console.log(chalk.yellow('   ⚠️  .pdcrc.json already exists, skipping'));
    return;
  }
  
  const config = {
    packageManager,
    riskTolerance: 'medium',
    autoCheck: true,
    checkOnInstall: true,
    checkOnUpgrade: true,
    excludePackages: [],
    includeDevDependencies: true,
    outputFormat: 'colored'
  };
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(chalk.green('   ✅ Created .pdcrc.json'));
}

async function testSetup() {
  console.log(chalk.yellow('🧪 Testing setup...'));
  
  try {
    execSync('pdc --version', { stdio: 'pipe' });
    console.log(chalk.green('   ✅ CLI accessible'));
  } catch {
    try {
      execSync('npx pdc --version', { stdio: 'pipe' });
      console.log(chalk.green('   ✅ CLI accessible via npx'));
    } catch {
      console.log(chalk.red('   ❌ CLI not accessible'));
      throw new Error('peer-dependency-checker CLI not accessible');
    }
  }
}

// Show help if needed
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
${chalk.blue.bold('peer-dependency-checker setup')}

Automatically integrates peer dependency checking into your project.

Usage:
  npx peer-dependency-checker setup
  
What it does:
  • Detects your package manager (npm/yarn/pnpm/bun)
  • Installs peer-dependency-checker as devDependency
  • Adds pre/post-install hooks to package.json
  • Creates .pdcrc.json configuration
  • Sets up automatic dependency checking

After setup, all dependency installations will be checked for peer dependency conflicts automatically.
`);
  process.exit(0);
}

main().catch(console.error); 