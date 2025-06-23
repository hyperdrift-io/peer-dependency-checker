#!/usr/bin/env node

/**
 * peer-dependency-checker CLI
 * by hyperdrift
 */

const { Command } = require('commander');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 peer-dependency-checker by hyperdrift\n');

const program = new Command();

program
  .name('pdc')
  .description('Smart dependency compatibility checker')
  .version('1.0.0');

program
  .command('scan')
  .description('Analyze current project for upgrade opportunities')
  .action(() => {
    console.log('🔍 Scanning your project...\n');
    
    try {
      const scriptPath = path.join(__dirname, '..', 'src', 'upgrade-check.js');
      execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Error running scan:', error.message);
    }
  });

program
  .command('analyze')
  .description('Deep peer dependency analysis')
  .action(() => {
    console.log('🔬 Running deep analysis...\n');
    
    try {
      const scriptPath = path.join(__dirname, '..', 'src', 'peer-check.js');
      execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Error running analysis:', error.message);
    }
  });

program
  .command('check')
  .argument('[packages...]', 'Packages to check')
  .description('Test specific package upgrades')
  .action((packages) => {
    if (!packages || packages.length === 0) {
      console.log('⚠️  Please specify packages to check. Example:');
      console.log('  pdc check react@19 react-dom@19');
      return;
    }

    console.log(`🧪 Testing ${packages.length} package(s)...\n`);
    
    packages.forEach(pkg => {
      console.log(`✅ ${pkg}`);
      try {
        const [name, version] = pkg.includes('@') ? pkg.split('@') : [pkg, 'latest'];
        const result = execSync(`npm info ${name}@${version || 'latest'} peerDependencies`, { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        
        if (result.trim()) {
          console.log(`   └── Peer deps: ${result.trim()}`);
        } else {
          console.log('   └── No peer dependencies required');
        }
      } catch (error) {
        console.log(`   └── Error: Could not fetch info for ${pkg}`);
      }
    });
  });

if (process.argv.length <= 2) {
  console.log('Quick commands:');
  console.log('  pdc scan          Analyze your project');
  console.log('  pdc check react@19    Test specific upgrade');
  console.log('  pdc analyze       Deep analysis\n');
  console.log('Run "pdc --help" for all commands');
  process.exit(0);
}

program.parse();
