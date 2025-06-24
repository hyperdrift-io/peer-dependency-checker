# Test Suite Documentation

This directory contains comprehensive tests for the peer-dependency-checker tool, specifically focused on ensuring a smooth external developer experience.

## Test Coverage

### 🧪 Integration Tests (`integration.test.js`)

Tests the technical integration points that external developers rely on:

1. **CLI Availability** - Verifies the CLI tool is accessible and shows version
2. **Setup Script Availability** - Ensures the setup script exists and shows help
3. **Package Manager Detection** - Tests detection of npm, yarn, pnpm, and bun
4. **Setup Process Simulation** - Simulates the complete setup process
5. **CLI Commands After Setup** - Verifies CLI works after configuration
6. **Package Manager Configurations** - Tests compatibility with all package managers
7. **Config File Validation** - Tests JSON configuration parsing and validation
8. **Real World Project Simulation** - Tests integration with realistic projects

### 👤 User Journey Tests (`user-journey.test.js`)

Tests the complete end-to-end experience from an external developer's perspective:

1. **Discovery** - Developer finds the tool and can access basic information
2. **One-Command Setup** - The `npx` setup command works correctly
3. **Immediate Functionality** - Tool works immediately after setup
4. **Daily Usage** - Testing workflow integration and package checking
5. **Team Collaboration** - Config files are shareable across team members
6. **Edge Cases** - Graceful handling of existing scripts and invalid configs
7. **Upgrade Scenarios** - Tool handles upgrades without breaking existing setups

## Test Execution

### Run Individual Test Suites

```bash
# Integration tests only
npm run test:integration

# User journey tests only  
npm run test:journey

# All tests
npm run test:all
```

### Continuous Integration

Tests are automatically run in GitHub Actions across:
- Node.js versions: 16.x, 18.x, 20.x
- Package managers: npm, yarn, pnpm
- Real-world project scenarios

## What Makes These Tests Special

### 🎯 External Developer Focus

Unlike typical unit tests, these tests simulate the **real external developer experience**:

- Tests start from a fresh project (not our own codebase)
- Simulates package manager detection in real projects
- Tests the actual commands external developers will run
- Verifies the tool works without any internal knowledge

### 🔄 Realistic Scenarios

Tests use realistic project structures:
- Typical React/TypeScript projects
- Real package.json files with existing scripts
- Multiple package manager lock files
- Common dependency patterns

### 🧹 Self-Contained

Each test:
- Creates temporary isolated projects
- Cleans up after itself
- Doesn't interfere with the actual codebase
- Can run in parallel safely

### 🚀 Quick Feedback

Tests run fast (< 30 seconds total) so developers get immediate feedback on:
- Whether external integration is working
- If setup changes break the user experience
- Package manager compatibility issues

## Test Failures

If tests fail, it indicates:

1. **Setup Process Issues** - External developers can't install/configure the tool
2. **Package Manager Problems** - Tool doesn't work with certain package managers  
3. **CLI Accessibility** - Command-line interface has breaking changes
4. **Config Validation** - Configuration files aren't working properly
5. **Integration Breakage** - Tool doesn't work in real projects

## Adding New Tests

When adding features that affect external developers:

1. Add integration tests for technical functionality
2. Add user journey tests for workflow impact
3. Test across different package managers
4. Verify backwards compatibility
5. Test both clean installs and upgrades

## Success Criteria

Tests pass when:
- ✅ External developers can install with one command
- ✅ Tool works immediately without configuration
- ✅ All package managers are supported
- ✅ Team collaboration works smoothly
- ✅ Upgrades don't break existing setups
- ✅ Edge cases are handled gracefully

These tests ensure that when developers discover our tool, they have a **friction-free experience** that "just works" regardless of their project setup or package manager choice. 