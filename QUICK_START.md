# 🚀 Quick Start for External Developers

Found this repo and want to **add peer dependency checking to your existing project**? Here's how to do it in 30 seconds:

## ⚡ One-Command Setup

```bash
# Go to your project directory
cd my-awesome-project

# Run the setup (works with any package manager)
npx peer-dependency-checker setup
```

**That's it!** ✨

## 🎯 What Just Happened?

The setup command automatically:

1. **Detected your package manager** (npm, yarn, pnpm, or bun)
2. **Installed peer-dependency-checker** as a devDependency
3. **Added scripts to your package.json**:
   ```json
   {
     "scripts": {
       "preinstall": "pdc scan --quick || true",
       "postinstall": "pdc analyze --brief || true",
       "pdc:scan": "pdc scan",
       "pdc:check": "pdc scan --quick || true"
     }
   }
   ```
4. **Created `.pdcrc.json`** configuration file
5. **Tested everything** works

## 🧪 Try It Now

```bash
# This will now check for peer dependency conflicts first!
npm install react@19 react-dom@19

# Manual scanning
npm run pdc:scan

# Check specific packages
npx pdc check lodash@5
```

## 📦 Works With All Package Managers

| Package Manager | Install Command | Auto-detected |
|----------------|----------------|---------------|
| **npm** | `npm install react@19` | ✅ |
| **yarn** | `yarn add react@19` | ✅ |
| **pnpm** | `pnpm add react@19` | ✅ |
| **bun** | `bun add react@19` | ✅ |

## 🔧 What Gets Added to Your Project

### 📄 package.json additions:
```json
{
  "devDependencies": {
    "peer-dependency-checker": "^1.0.0"
  },
  "scripts": {
    "preinstall": "pdc scan --quick || true",
    "postinstall": "pdc analyze --brief || true",
    "pdc:scan": "pdc scan",
    "pdc:check": "pdc scan --quick || true",
    "pdc:analyze": "pdc analyze --brief || true"
  }
}
```

### ⚙️ .pdcrc.json config:
```json
{
  "packageManager": "npm",
  "riskTolerance": "medium",
  "autoCheck": true,
  "checkOnInstall": true,
  "checkOnUpgrade": true,
  "excludePackages": [],
  "includeDevDependencies": true,
  "outputFormat": "colored"
}
```

## 🎨 Example Output

When you install dependencies after setup:

```bash
$ npm install react@19 react-dom@19

🔍 Running peer dependency check...

✅ COMPATIBLE
   • react@19.1.0 - No conflicts detected
   • react-dom@19.1.0 - Requires react ^19.0.0 ✅

📦 Installing packages...
npm WARN peer dep typescript@5.0.0 requires @types/react@^19.0.0
⚠️  Consider also updating: @types/react@19

🔍 Post-install analysis...
✅ All peer dependencies satisfied
```

## 🛠️ Customization

Edit `.pdcrc.json` to customize behavior:

```json
{
  "riskTolerance": "low",          // "low" | "medium" | "high"
  "excludePackages": ["legacy-pkg"], // Skip certain packages
  "checkOnInstall": true,           // Auto-check on install
  "outputFormat": "json"            // "colored" | "json" | "minimal"
}
```

## 🚫 Removing (if needed)

```bash
# Remove the package
npm uninstall peer-dependency-checker

# Remove scripts from package.json (manual)
# Delete .pdcrc.json file
```

## 🆘 Troubleshooting

**Setup fails?**
```bash
# Try global install first
npm install -g peer-dependency-checker
pdc setup
```

**Scripts not running?**
```bash
# Test manually
npx pdc scan
```

**Need help?**
- [GitHub Issues](https://github.com/hyperdrift-io/peer-dependency-checker/issues)
- [Full Documentation](./README.md)

---

**That's it!** Your project now has intelligent peer dependency checking. Every time you or your team installs dependencies, potential conflicts will be caught before they break your build. 🎉 