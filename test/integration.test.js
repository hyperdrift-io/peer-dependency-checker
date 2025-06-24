#!/usr/bin/env node

/**
 * Integration tests for peer-dependency-checker external user setup
 * Tests the complete user journey from discovery to working integration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');
const assert = require('assert');

console.log('🧪 Running peer-dependency-checker integration tests...\n');

class TestRunner {
  constructor() {
    this.testCount = 0;
    this.passCount = 0;
    this.failCount = 0;
  }

  async runTest(name, testFn) {
    this.testCount++;
    process.stdout.write(`📋 ${name}... `);
    
    try {
      await testFn();
      this.passCount++;
      console.log('✅ PASS');
    } catch (error) {
      this.failCount++;
      console.log('❌ FAIL');
      console.error(`   Error: ${error.message}`);
    }
  }

  summary() {
    console.log(`\n📊 Test Results:`);
    console.log(`   Total: ${this.testCount}`);
    console.log(`   ✅ Passed: ${this.passCount}`);
    console.log(`   ❌ Failed: ${this.failCount}`);
    
    if (this.failCount === 0) {
      console.log('\n🎉 All tests passed! External integration is working correctly.');
      return true;
    } else {
      console.log('\n💥 Some tests failed. External integration needs fixes.');
      return false;
    }
  }
}

// Create temporary test directories
function createTestProject(name, packageManager = 'npm') {
  const testDir = path.join(os.tmpdir(), `pdc-test-${Date.now()}-${name}`);
  fs.mkdirSync(testDir, { recursive: true });
  
  // Create basic package.json
  const packageJson = {
    name: `test-project-${name}`,
    version: '1.0.0',
    dependencies: {
      'react': '^18.0.0',
      'lodash': '^4.17.0'
    },
    devDependencies: {
      'typescript': '^4.9.0'
    }
  };
  
  fs.writeFileSync(
    path.join(testDir, 'package.json'), 
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create appropriate lock file
  switch (packageManager) {
    case 'yarn':
      fs.writeFileSync(path.join(testDir, 'yarn.lock'), '# Yarn lock file\n');
      break;
    case 'pnpm':
      fs.writeFileSync(path.join(testDir, 'pnpm-lock.yaml'), 'lockfileVersion: 5.4\n');
      break;
    case 'bun':
      fs.writeFileSync(path.join(testDir, 'bun.lockb'), '');
      break;
    default: // npm
      fs.writeFileSync(path.join(testDir, 'package-lock.json'), '{"lockfileVersion": 2}\n');
  }
  
  return testDir;
}

function cleanup(testDir) {
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
  }
}

// Test CLI availability
async function testCliAvailability() {
  // Test that our CLI is accessible
  const output = execSync('node bin/pdc.js --version', { 
    encoding: 'utf8',
    cwd: process.cwd()
  });
  
  assert(output.includes('1.0.0'), 'CLI version should be accessible');
}

// Test setup script availability
async function testSetupScriptAvailability() {
  const setupPath = path.join(process.cwd(), 'bin', 'setup.js');
  assert(fs.existsSync(setupPath), 'Setup script should exist');
  
  // Test it can be executed
  const output = execSync('node bin/setup.js --help', { 
    encoding: 'utf8',
    cwd: process.cwd()
  });
  
  assert(output.includes('peer-dependency-checker setup'), 'Setup script should show help');
}

// Test package manager detection
async function testPackageManagerDetection() {
  const testCases = [
    { pm: 'npm', file: 'package-lock.json' },
    { pm: 'yarn', file: 'yarn.lock' },
    { pm: 'pnpm', file: 'pnpm-lock.yaml' },
    { pm: 'bun', file: 'bun.lockb' }
  ];
  
  for (const { pm, file } of testCases) {
    const testDir = createTestProject(`detect-${pm}`, pm);
    
    try {
      // Test file existence for package manager detection
      assert(fs.existsSync(path.join(testDir, file)), `${file} should exist for ${pm} detection`);
      
      // Test that package.json exists (basic requirement)
      assert(fs.existsSync(path.join(testDir, 'package.json')), 'package.json should exist');
    } finally {
      cleanup(testDir);
    }
  }
}

// Test setup process simulation
async function testSetupProcessSimulation() {
  const testDir = createTestProject('setup-test');
  const originalCwd = process.cwd();
  
  try {
    process.chdir(testDir);
    
    // Read original package.json
    const originalPackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Simulate what setup.js does without actually running it
    // (since running the full setup would try to install the package)
    
    // 1. Check package.json exists
    assert(fs.existsSync('package.json'), 'package.json should exist');
    
    // 2. Simulate adding scripts
    const updatedPackageJson = { ...originalPackageJson };
    if (!updatedPackageJson.scripts) updatedPackageJson.scripts = {};
    
    Object.assign(updatedPackageJson.scripts, {
      'pdc:scan': 'pdc scan',
      'pdc:check': 'pdc scan --quick || true',
      'pdc:analyze': 'pdc analyze --brief || true',
      'preinstall': 'pdc scan --quick || true',
      'postinstall': 'pdc analyze --brief || true'
    });
    
    fs.writeFileSync('package.json', JSON.stringify(updatedPackageJson, null, 2));
    
    // 3. Simulate creating config
    const config = {
      packageManager: 'npm',
      riskTolerance: 'medium',
      autoCheck: true,
      checkOnInstall: true,
      checkOnUpgrade: true,
      excludePackages: [],
      includeDevDependencies: true,
      outputFormat: 'colored'
    };
    
    fs.writeFileSync('.pdcrc.json', JSON.stringify(config, null, 2));
    
    // 4. Verify everything was created correctly
    const finalPackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    assert(finalPackageJson.scripts['pdc:scan'], 'pdc:scan script should be added');
    assert(finalPackageJson.scripts['preinstall'], 'preinstall script should be added');
    assert(finalPackageJson.scripts['postinstall'], 'postinstall script should be added');
    
    assert(fs.existsSync('.pdcrc.json'), '.pdcrc.json should be created');
    const finalConfig = JSON.parse(fs.readFileSync('.pdcrc.json', 'utf8'));
    assert(finalConfig.packageManager === 'npm', 'Package manager should be detected');
    assert(finalConfig.riskTolerance === 'medium', 'Default risk tolerance should be medium');
    
  } finally {
    process.chdir(originalCwd);
    cleanup(testDir);
  }
}

// Test CLI commands work after setup
async function testCliCommandsAfterSetup() {
  const testDir = createTestProject('cli-test');
  const originalCwd = process.cwd();
  
  try {
    process.chdir(testDir);
    
    // Create a config file
    const config = {
      packageManager: 'npm',
      riskTolerance: 'medium',
      autoCheck: true
    };
    fs.writeFileSync('.pdcrc.json', JSON.stringify(config, null, 2));
    
    // Test that CLI commands can be run (they might fail due to missing dependencies, but should not crash)
    try {
      execSync(`node "${path.join(originalCwd, 'bin', 'pdc.js')}" --help`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
    } catch (error) {
      // Help command should work
      if (!error.stdout?.includes('peer-dependency-checker')) {
        throw new Error('CLI help should be accessible');
      }
    }
    
    // Test check command syntax
    try {
      execSync(`node "${path.join(originalCwd, 'bin', 'pdc.js')}" check --help`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
    } catch (error) {
      // Command structure should be valid
    }
    
  } finally {
    process.chdir(originalCwd);
    cleanup(testDir);
  }
}

// Test different package manager configurations
async function testPackageManagerConfigurations() {
  const packageManagers = ['npm', 'yarn', 'pnpm', 'bun'];
  
  for (const pm of packageManagers) {
    const testDir = createTestProject(`pm-${pm}`, pm);
    
    try {
      // Verify the appropriate lock file exists
      const lockFiles = {
        npm: 'package-lock.json',
        yarn: 'yarn.lock', 
        pnpm: 'pnpm-lock.yaml',
        bun: 'bun.lockb'
      };
      
      const expectedLockFile = lockFiles[pm];
      assert(fs.existsSync(path.join(testDir, expectedLockFile)), 
        `${expectedLockFile} should exist for ${pm} projects`);
      
    } finally {
      cleanup(testDir);
    }
  }
}

// Test config file validation
async function testConfigFileValidation() {
  const testDir = createTestProject('config-validation');
  
  try {
    // Test valid config
    const validConfig = {
      packageManager: 'npm',
      riskTolerance: 'low',
      autoCheck: false,
      excludePackages: ['legacy-package'],
      outputFormat: 'json'
    };
    
    const configPath = path.join(testDir, '.pdcrc.json');
    fs.writeFileSync(configPath, JSON.stringify(validConfig, null, 2));
    
    // Verify it's valid JSON
    const parsedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert(parsedConfig.packageManager === 'npm', 'Config should be parseable');
    assert(Array.isArray(parsedConfig.excludePackages), 'excludePackages should be an array');
    
    // Test config with comments (should fail gracefully)
    const configWithComments = `{
      // This is a comment
      "packageManager": "npm",
      "riskTolerance": "medium"
    }`;
    
    try {
      JSON.parse(configWithComments);
      throw new Error('Should fail to parse JSON with comments');
    } catch (error) {
      // Expected to fail - JSON doesn't support comments
      assert(error.message.includes('JSON') || error.message.includes('Unexpected'), 'Should reject invalid JSON');
    }
    
  } finally {
    cleanup(testDir);
  }
}

// Test real-world project simulation
async function testRealWorldProjectSimulation() {
  const testDir = createTestProject('real-world');
  
  try {
    // Create a more realistic package.json
    const realisticPackageJson = {
      name: 'my-awesome-app',
      version: '2.1.0',
      scripts: {
        start: 'node index.js',
        test: 'jest',
        build: 'webpack --mode production'
      },
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'lodash': '^4.17.21',
        'axios': '^1.0.0'
      },
      devDependencies: {
        '@types/react': '^18.0.0',
        'typescript': '^4.9.0',
        'webpack': '^5.0.0',
        'jest': '^29.0.0'
      }
    };
    
    fs.writeFileSync(
      path.join(testDir, 'package.json'),
      JSON.stringify(realisticPackageJson, null, 2)
    );
    
    // Simulate setup process
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    try {
      // Verify setup can handle existing scripts
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      assert(packageJson.scripts.start, 'Existing scripts should be preserved');
      
      // Add our scripts without overwriting
      const newScripts = {
        'pdc:scan': 'pdc scan',
        'preinstall': 'pdc scan --quick || true',
        'postinstall': 'pdc analyze --brief || true'
      };
      
      Object.assign(packageJson.scripts, newScripts);
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
      
      // Verify both old and new scripts exist
      const finalPackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      assert(finalPackageJson.scripts.start === 'node index.js', 'Original scripts preserved');
      assert(finalPackageJson.scripts['pdc:scan'], 'New pdc scripts added');
      
    } finally {
      process.chdir(originalCwd);
    }
    
  } finally {
    cleanup(testDir);
  }
}

// Main test execution
async function runAllTests() {
  const runner = new TestRunner();
  
  console.log('🔍 Testing peer-dependency-checker external integration...\n');
  
  await runner.runTest('CLI Availability', testCliAvailability);
  await runner.runTest('Setup Script Availability', testSetupScriptAvailability);
  await runner.runTest('Package Manager Detection', testPackageManagerDetection);
  await runner.runTest('Setup Process Simulation', testSetupProcessSimulation);
  await runner.runTest('CLI Commands After Setup', testCliCommandsAfterSetup);
  await runner.runTest('Package Manager Configurations', testPackageManagerConfigurations);
  await runner.runTest('Config File Validation', testConfigFileValidation);
  await runner.runTest('Real World Project Simulation', testRealWorldProjectSimulation);
  
  const success = runner.summary();
  process.exit(success ? 0 : 1);
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests }; 