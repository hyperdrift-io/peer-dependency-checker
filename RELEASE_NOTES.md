# Release Notes

## 🔍 peer-dependency-checker v1.0.0 - Initial Release

*Released: January 2025*

We're excited to introduce **peer-dependency-checker**, a smart CLI tool that prevents peer dependency conflicts before you upgrade your Node.js dependencies!

### 🎯 What is peer-dependency-checker?

Ever had a major upgrade break your entire build because of peer dependency conflicts? This tool analyzes your dependencies and tells you exactly what will break **before** you upgrade, saving you hours of debugging.

### ✨ Features in v1.0.0

#### 🔍 **Smart Compatibility Analysis**
- Pre-install peer dependency conflict detection
- Version range compatibility analysis
- Clear explanations of what will break and why

#### 🧪 **Safe Testing Commands**
- `pdc scan` - Analyze your project for upgrade opportunities
- `pdc check \<packages\>` - Test specific package upgrades for conflicts  
- `pdc analyze` - Deep analysis of all peer dependencies

#### 🎨 **Beautiful Output**
- Color-coded compatibility reports
- Clear upgrade recommendations
- Detailed conflict explanations with solutions

#### ⚡ **Developer Experience**
- Zero configuration required
- Works with npm, pnpm, and yarn
- Fast execution with smart caching

### 🚀 Quick Start

```bash
# Install globally
npm install -g @hyperdrift-io/peer-dependency-checker

# Analyze your project
pdc scan

# Test specific upgrades
pdc check react@19 react-dom@19

# Deep analysis
pdc analyze
```

### 💡 Example Output

```bash
$ pdc scan

🔍 Scanning your project...

✅ COMPATIBLE (12 packages)
   • @types/node: 22.15.21 → 24.0.3
   • tailwindcss: 4.1.7 → 4.1.10

⚠️  CONFLICTS DETECTED (2 packages)
   • react: 18.3.1 → 19.1.0
     └── Conflict: @types/react needs updating to ^19.0.0
```

### 🔧 Technical Details

- **Node.js:** Requires Node 16.0.0 or higher
- **Package Managers:** npm, pnpm, yarn supported
- **Dependencies:** Minimal footprint with only chalk and commander
- **Platform:** Cross-platform (Windows, macOS, Linux)

### 🎨 The Hyperdrift Approach

At **hyperdrift**, we believe in tools that make developers' lives easier, not harder. This tool was born from our frustration with existing dependency tools that show you what *can* be upgraded, but not what *should* be upgraded safely.

*"It's like having a senior developer review your upgrades before you break production."*

### 🤝 Comparison with Existing Tools

| Feature | peer-dependency-checker | npm-check-updates | npm outdated |
|---------|------------------------|-------------------|--------------|
| Peer dependency analysis | ✅ **Advanced** | ❌ | ❌ |
| Pre-install conflict detection | ✅ | ❌ | ❌ |
| Risk assessment | ✅ **Detailed** | ❌ | ❌ |
| Upgrade recommendations | ✅ **Smart phases** | ⚠️ Basic | ❌ |

### 🛠️ Installation Options

```bash
# Global installation (recommended)
npm install -g @hyperdrift-io/peer-dependency-checker

# Use with npx (no installation needed)
npx @hyperdrift-io/peer-dependency-checker scan

# Add to your project's devDependencies
npm install --save-dev @hyperdrift-io/peer-dependency-checker
```

### 📖 Documentation

- **README.md** - Complete usage guide with examples
- **CONTRIBUTING.md** - How to contribute to the project
- **MANUAL_SETUP.md** - Repository setup and optimization guide

### 🚧 Roadmap

Coming in future releases:
- **v1.1**: GitHub Actions integration for automated checks
- **v1.2**: Dependency vulnerability scanning
- **v1.3**: Automated PR creation for safe upgrades
- **v1.4**: Team collaboration features
- **v2.0**: AI-powered upgrade recommendations

### 🐛 Known Issues

- None reported yet! This is the initial release.

### 📝 Breaking Changes

- None (initial release)

### 🙏 Acknowledgments

Special thanks to the Node.js community for inspiration and to all the developers who have struggled with peer dependency conflicts. This tool is for you!

### 📞 Support

- **Issues:** [GitHub Issues](https://github.com/hyperdrift-io/peer-dependency-checker/issues)
- **Discussions:** [GitHub Discussions](https://github.com/hyperdrift-io/peer-dependency-checker/discussions)
- **Email:** team@hyperdrift.io
- **Website:** [hyperdrift.io](https://hyperdrift.io)

---

**Full Changelog**: https://github.com/hyperdrift-io/peer-dependency-checker/commits/v1.0.0

**Download:** [npm package](https://www.npmjs.com/package/@hyperdrift-io/peer-dependency-checker) 