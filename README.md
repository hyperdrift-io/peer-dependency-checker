# 🔍 peer-dependency-checker

**by hyperdrift**

*The smart way to check dependency compatibility before you upgrade*

*Stop breaking your builds. Check compatibility first.*

---

## 🚀 **Quick Integration** (1 Command Setup)

Add peer dependency checking to **any existing project** in seconds:

```bash
# One command setup - works with npm, yarn, pnpm, or bun
npx @hyperdrift-io/peer-dependency-checker setup

# Or install globally first
npm install -g @hyperdrift-io/peer-dependency-checker
pdc setup
```

**What this does:**
✅ Detects your package manager (npm/yarn/pnpm/bun)  
✅ Adds pre/post-install hooks to your `package.json`  
✅ Sets up automatic checking on `npm install`, `yarn add`, etc.  
✅ Uses smart defaults (`.pdcrc.json` optional - [customize if needed](./docs/CONFIG.md))  
✅ **Works immediately** - zero configuration required  

**Result:** Every time you or your team installs dependencies, peer dependency conflicts are checked automatically!

---

## 💡 **See It In Action**

```bash
# Before: Risky blind install
npm install react@19 react-dom@19
# ERROR: peer dependency conflicts everywhere 😢

# After: Safe install with pdc
npm install react@19 react-dom@19
# 🔍 Pre-checking compatibility...
# ✅ Compatible! Safe to upgrade
# ⚠️  Conflict detected with @types/react - details below
# Continue? (y/N)
```

---

## 🚀 Why peer-dependency-checker?

Ever had a major upgrade break your entire build because of peer dependency conflicts? **We've all been there.**

```bash
# The old way: 🔥 YOLO and pray
npm install react@19 react-dom@19
# ERROR: peer dependency conflicts everywhere

# The hyperdrift way: ✅ Check first
npx @hyperdrift-io/peer-dependency-checker check react@19 react-dom@19
# ✅ Compatible! Safe to upgrade
# ⚠️  Conflict detected with @types/react - check details below
```

**peer-dependency-checker** analyzes your dependencies and tells you exactly what will break **before** you upgrade.

## ⚡ Installation

```bash
# Global install (recommended)
npm install -g @hyperdrift-io/peer-dependency-checker

# Or use directly with npx
npx @hyperdrift-io/peer-dependency-checker --help
```

## 🎯 Quick Start

```bash
# Check what's outdated and if upgrades are safe
pdc scan

# Check specific packages before upgrading
pdc check react@19 react-dom@19

# Analyze peer dependency conflicts for all outdated packages  
pdc analyze

# Get upgrade recommendations with safety ratings
pdc recommend
```

## ✨ Features

### 🔍 **Smart Compatibility Analysis**
- Detects peer dependency conflicts before installation
- Analyzes version ranges and compatibility matrices
- Shows exactly which packages will conflict

### 🎯 **Upgrade Planning**
- Phase-based upgrade recommendations
- Risk assessment for each package
- Safe upgrade paths with dependency order

### 🚨 **Conflict Prevention** 
- Pre-install compatibility checks
- Real-time peer dependency validation
- Breaking change detection

### 📊 **Beautiful Output**
- Color-coded compatibility reports
- Clear upgrade recommendations
- Detailed conflict explanations

## 📖 Examples

### Check Current Project Health
```bash
$ pdc scan

🔍 Scanning your project...

✅ COMPATIBLE (12 packages)
   • @types/node: 22.15.21 → 24.0.3
   • tailwindcss: 4.1.7 → 4.1.10
   • next: 15.3.2 → 15.3.4

⚠️  CONFLICTS DETECTED (2 packages)
   • react: 18.3.1 → 19.1.0
     └── Conflict: @types/react needs updating to ^19.0.0
   
🔴 BREAKING CHANGES (1 package)  
   • some-package: 2.1.0 → 3.0.0
     └── Breaking: API changes detected
```

### Test Specific Upgrades
```bash
$ pdc check react@19 react-dom@19 @types/react@19

🧪 Testing compatibility for 3 packages...

✅ react@19.1.0
   └── No conflicts detected

✅ react-dom@19.1.0  
   └── Requires: react ^19.1.0 ✅

⚠️  @types/react@19.1.8
   └── May conflict with: @types/react-dom@18.x
   └── Recommendation: Also upgrade @types/react-dom@19.1.6

🎯 UPGRADE PLAN:
   1. npm install react@19 react-dom@19
   2. npm install -D @types/react@19 @types/react-dom@19
```

### Get Smart Recommendations
```bash
$ pdc recommend

🎯 UPGRADE RECOMMENDATIONS

🟢 SAFE TO UPGRADE NOW:
   • tailwindcss, postcss, eslint (patch/minor updates)
   • Command: npm update

🟡 REQUIRES TESTING:
   • react ecosystem (major update)
   • Plan: Create test branch, upgrade together
   
🔴 POSTPONE:
   • node types (may break TypeScript compilation)
   • Action: Check Node.js compatibility first
```

## 🛠️ Commands

| Command | Description |
|---------|-------------|
| `pdc scan` | Analyze current project for upgrade opportunities |
| `pdc check <packages>` | Test specific package upgrades for conflicts |
| `pdc analyze` | Deep analysis of all peer dependencies |
| `pdc recommend` | Get smart upgrade recommendations |
| `pdc outdated` | Enhanced version of `npm outdated` with compatibility |
| `pdc why <package>` | Explain why a package can't be upgraded |

## 🔧 Configuration

peer-dependency-checker works out-of-the-box with **smart defaults**:

```json
{
  "packageManager": "auto-detect",     // npm, yarn, pnpm, bun
  "riskTolerance": "medium",           // low, medium, high  
  "autoCheck": true,                   // Auto-check on installs
  "checkOnInstall": true,              // Pre-install checks
  "excludePackages": [],               // Skip specific packages
  "includeDevDependencies": true,      // Include dev dependencies
  "outputFormat": "colored"            // colored, json, minimal
}
```

**🎛️ Need custom settings?** Create `.pdcrc.json` in your project root:

```json
{
  "riskTolerance": "low",
  "excludePackages": ["legacy-package"],
  "outputFormat": "json"
}
```

📖 **[Full Configuration Guide →](./docs/CONFIG.md)**

## 🤝 Comparison with Other Tools

| Feature | peer-dependency-checker | npm-check-updates | npm outdated |
|---------|------------------------|-------------------|--------------|
| Peer dependency analysis | ✅ **Advanced** | ❌ | ❌ |
| Compatibility checking | ✅ **Pre-install** | ❌ | ❌ |
| Upgrade recommendations | ✅ **Smart phases** | ⚠️ Basic | ❌ |
| Risk assessment | ✅ **Detailed** | ❌ | ❌ |
| Breaking change detection | ✅ | ❌ | ❌ |

## 🎨 The Hyperdrift Approach

At **hyperdrift**, we believe in tools that make developers' lives easier, not harder. **peer-dependency-checker** was born from our frustration with tools that show you what *can* be upgraded, but not what *should* be upgraded safely.

*"It's like having a senior developer review your upgrades before you break production."*

## 📊 Journey

Read about how we built this tool and the problems it solves in our [Journey article](./public/docs/journey.mdx).

## 🚧 Roadmap

- [ ] **v1.1**: GitHub Actions integration
- [ ] **v1.2**: Dependency vulnerability scanning
- [ ] **v1.3**: Automated PR creation for safe upgrades
- [ ] **v1.4**: Team collaboration features
- [ ] **v2.0**: AI-powered upgrade recommendations

## 🤝 Contributing

We love contributions! Check out our [Contributing Guide](CONTRIBUTING.md) to get started.

```bash
# Quick start for contributors
git clone https://github.com/hyperdrift-io/peer-dependency-checker
cd peer-dependency-checker
npm install
npm run dev
```

## 📄 License

MIT © [Hyperdrift](https://hyperdrift.io)

---


**Built with ❤️ by the hyperdrift team**

*Making developer tools that actually work*

[Report Bug](https://github.com/hyperdrift-io/peer-dependency-checker/issues) • [Request Feature](https://github.com/hyperdrift-io/peer-dependency-checker/issues) • [Join Discussion](https://github.com/hyperdrift-io/peer-dependency-checker/discussions)
