# 🔍 peer-dependency-checker

*Smart dependency compatibility checking before you upgrade*

Stop breaking your builds. Check compatibility first.

---

## 🚀 Quick Setup

Add peer dependency checking to any project in one command:

```bash
# One command setup - works with npm, yarn, pnpm, or bun
npx peer-dependency-checker setup

# Or install globally first
npm install -g peer-dependency-checker
pdc setup
```

**What this does:**
- ✅ Detects your package manager automatically
- ✅ Adds pre/post-install hooks to your `package.json`  
- ✅ Sets up automatic checking on installs
- ✅ Works immediately with zero configuration

---

## ⚡ Installation

```bash
# Global install (recommended)
npm install -g peer-dependency-checker

# Or use directly with npx
npx peer-dependency-checker scan
```

## 🎯 Usage

```bash
# Analyze your project for upgrade opportunities
pdc scan

# Quick scan with minimal output
pdc scan --quick

# Check specific packages before upgrading
pdc check react@19 react-dom@19

# Deep peer dependency analysis  
pdc analyze

# Pre-installation compatibility check
pdc precheck
```

## 📖 Examples

### Project Health Check
```bash
$ pdc scan

🔍 Scanning your project...

📦 Project: my-app
🔧 Package Manager: npm
📋 Dependencies: 15 production, 8 development

📈 OUTDATED PACKAGES
────────────────────────────────────────
react: 18.3.1 → 19.1.0
@types/node: 22.15.21 → 24.0.3

🔗 PEER DEPENDENCY STATUS
────────────────────────────────────────
No peer dependency warnings detected

💡 RECOMMENDATIONS
────────────────────────────────────────
✅ All packages are up to date!
```

### Test Specific Upgrades
```bash
$ pdc check react@19 react-dom@19

🧪 Testing 2 package(s)...

✅ react@19
   └── No peer dependencies required

✅ react-dom@19
   └── Peer deps: { react: '^19.1.0' }
```

## 🛠️ Commands

| Command | Description |
|---------|-------------|
| `pdc scan` | Analyze current project for upgrade opportunities |
| `pdc scan --quick` | Quick scan with minimal output |
| `pdc check <packages>` | Test specific package upgrades |
| `pdc analyze` | Deep peer dependency analysis |
| `pdc analyze --brief` | Brief analysis with key findings |
| `pdc precheck` | Pre-installation compatibility check |
| `pdc setup` | One-command setup for external projects |

## 🔧 Configuration

Works out-of-the-box with smart defaults. For custom settings, create `.pdcrc.json`:

```json
{
  "packageManager": "npm",
  "riskTolerance": "medium",
  "excludePackages": [],
  "outputFormat": "colored"
}
```

📖 **[Configuration Guide →](./docs/CONFIG.md)**

## 🤝 Contributing

We welcome contributions! 

```bash
git clone https://github.com/hyperdrift-io/peer-dependency-checker
cd peer-dependency-checker
npm install
npm test
```

## 📄 License

MIT © [Hyperdrift](https://hyperdrift.io)

---

**Built with ❤️ by the hyperdrift team**
