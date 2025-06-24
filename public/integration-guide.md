# Integration Guide: Hooking into Package Managers

This guide explains various ways to integrate peer-dependency-checker with your package manager workflow to automatically check for peer dependency conflicts before installations.

## 🚀 Quick Setup

Run the interactive setup script:

```bash
npm run setup-hooks
```

This will guide you through setting up different types of hooks based on your preferences.

## 🎯 Integration Methods

### 1. **Wrapper Commands** (Recommended)

Use `pdc-install` as a wrapper around your package manager:

```bash
# Instead of: npm install react@19
pdc-install npm install react@19

# Instead of: pnpm add lodash@5
pdc-install pnpm add lodash@5

# Instead of: yarn add typescript@5 --dev
pdc-install yarn add typescript@5 --dev
```

**Benefits:**
- ✅ Pre-installation peer dependency checking
- ✅ User confirmation before proceeding
- ✅ Post-installation validation
- ✅ Works with any package manager

### 2. **Shell Aliases** (Most Convenient)

Set up aliases for safe package installation:

```bash
# Add to your ~/.zshrc or ~/.bashrc
alias npm-safe='pdc-install npm'
alias pnpm-safe='pdc-install pnpm'
alias yarn-safe='pdc-install yarn'
```

Then use them like normal package managers:

```bash
npm-safe install react@19 react-dom@19
pnpm-safe add lodash@5
yarn-safe add typescript@5 --dev
```

### 3. **npm/pnpm Lifecycle Hooks**

Add hooks directly to your `package.json`:

```json
{
  "scripts": {
    "preinstall": "pdc scan --quick || true",
    "postinstall": "pdc analyze --brief || true"
  }
}
```

**When they run:**
- `preinstall`: Before any package installation
- `postinstall`: After any package installation

### 4. **Git Hooks**

Automatically check dependencies before commits:

```bash
# .git/hooks/pre-commit
#!/bin/bash
echo "🔍 Running peer dependency check..."
if command -v pdc &amp;&gt; /dev/null; then
    pdc scan --quick
else
    echo "⚠️  pdc not found, skipping check"
fi
```

### 5. **Husky Integration**

If you're using Husky for git hooks:

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running peer dependency check..."
npx pdc scan --quick
```

## 🛠️ Advanced Configuration

### Custom Pre-check Command

Create your own pre-installation check:

```bash
# Check specific packages before installing
pdc precheck react@19 react-dom@19

# Check current project health
pdc precheck
```

### Environment Variables

Control behavior through environment variables:

```bash
# Quick mode (minimal output)
QUICK_MODE=true pdc scan

# Brief mode (key findings only)
BRIEF_MODE=true pdc analyze
```

### CI/CD Integration

Add to your CI pipeline:

```yaml
# GitHub Actions example
- name: Check peer dependencies
  run: |
    npm install -g @hyperdrift-io/peer-dependency-checker
    pdc scan --quick
```

## 📋 Hook Comparison

| Method | When Runs | Pros | Cons |
|--------|-----------|------|------|
| Wrapper Commands | On-demand | Full control, interactive | Manual usage |
| Shell Aliases | On-demand | Convenient, transparent | Requires setup |
| npm Scripts | Every install | Automatic | Can slow down workflow |
| Git Hooks | Before commits | Catches issues early | Not install-specific |
| Husky | Before commits | Team-wide consistency | Requires Husky |

## 🎛️ Configuration Options

### Command Line Flags

```bash
pdc scan --quick          # Minimal output
pdc analyze --brief       # Key findings only
pdc precheck package@ver  # Specific package check
```

### Package Manager Specific

#### npm
```json
{
  "scripts": {
    "preinstall": "pdc scan --quick || true"
  }
}
```

#### pnpm
```json
{
  "pnpm": {
    "onlyBuiltDependencies": ["peer-dependency-checker"]
  }
}
```

#### Yarn
```json
{
  "scripts": {
    "preinstall": "command -v pdc && pdc scan --quick || true"
  }
}
```

## 🔧 Troubleshooting

### Common Issues

**Issue:** "pdc: command not found"
```bash
# Solution: Install globally
npm install -g @hyperdrift-io/peer-dependency-checker
```

**Issue:** Hook slows down workflow
```bash
# Solution: Use quick mode
"preinstall": "pdc scan --quick || true"
```

**Issue:** False positives in CI
```bash
# Solution: Skip in CI environment
"preinstall": "[ \"$CI\" != \"true\" ] && pdc scan --quick || true"
```

## 🎯 Best Practices

1. **Start with aliases** - least intrusive, easy to adopt
2. **Use quick mode** for automated hooks to avoid slowdowns
3. **Combine methods** - aliases for daily use, git hooks for safety
4. **Team adoption** - use Husky hooks for consistent team behavior
5. **CI integration** - add checks to your pipeline for safety

## 🚨 Safety Features

- All hooks use `|| true` to prevent blocking on errors
- Quick mode provides fast feedback
- Interactive prompts for wrapper commands
- Graceful fallbacks when tool is not available

## 📚 Examples

### Full Team Setup

```bash
# 1. Install globally for the team
npm install -g @hyperdrift-io/peer-dependency-checker

# 2. Set up Husky hooks
npx husky install
echo "npx pdc scan --quick" &gt; .husky/pre-commit
chmod +x .husky/pre-commit

# 3. Add aliases to team's shell configs
echo "alias npm-safe='pdc-install npm'" &gt;&gt; ~/.zshrc
echo "alias pnpm-safe='pdc-install pnpm'" &gt;&gt; ~/.zshrc

# 4. Add to package.json for CI
{
  "scripts": {
    "check-deps": "pdc scan",
    "preinstall": "[ \"$CI\" != \"true\" ] && pdc scan --quick || true"
  }
}
```

### Gradual Adoption

```bash
# Week 1: Individual usage
npm install -g @hyperdrift-io/peer-dependency-checker
alias npm-safe='pdc-install npm'

# Week 2: Project-specific
echo '"preinstall": "pdc scan --quick || true"' # Add to package.json

# Week 3: Team-wide
# Set up Husky hooks for the whole team
```

## 🔮 Coming Soon

- IDE extensions for real-time checking
- GitHub App for automated PR checks
- Integration with Dependabot
- Custom rule configurations

---

*Need help? [Open an issue](https://github.com/hyperdrift-io/peer-dependency-checker/issues) or check our [documentation](https://github.com/hyperdrift-io/peer-dependency-checker).* 