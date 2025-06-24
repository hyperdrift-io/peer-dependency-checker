# ⚙️ Configuration Guide - .pdcrc.json

The `.pdcrc.json` file is the configuration file that controls how peer-dependency-checker behaves in your project. It's automatically created when you run `pdc setup`, but you can customize it to fit your needs.

## 📄 Default Configuration

When you run setup, this file is created:

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

## 🔧 Configuration Options

### `packageManager` (string)
**Default:** Auto-detected  
**Options:** `"npm"`, `"yarn"`, `"pnpm"`, `"bun"`

Specifies which package manager you're using. Usually auto-detected based on lock files.

```json
{
  "packageManager": "pnpm"
}
```

### `riskTolerance` (string)
**Default:** `"medium"`  
**Options:** `"low"`, `"medium"`, `"high"`

Controls how strict the compatibility checking is:

- **`"low"`** - Very conservative, warns about any potential issues
- **`"medium"`** - Balanced approach, focuses on likely problems
- **`"high"`** - Only warns about definite conflicts

```json
{
  "riskTolerance": "low"
}
```

### `autoCheck` (boolean)
**Default:** `true`

Whether to automatically run compatibility checks during package installation.

```json
{
  "autoCheck": false  // Disable automatic checking
}
```

### `checkOnInstall` (boolean)
**Default:** `true`

Run pre-install compatibility checks before installing new packages.

```json
{
  "checkOnInstall": true
}
```

### `checkOnUpgrade` (boolean)  
**Default:** `true`

Run checks when upgrading existing packages to new versions.

```json
{
  "checkOnUpgrade": false  // Skip checks for upgrades
}
```

### `excludePackages` (array)
**Default:** `[]`

List of packages to skip during compatibility checking. Useful for legacy packages or known problematic dependencies.

```json
{
  "excludePackages": ["legacy-package", "problematic-dep"]
}
```

### `includeDevDependencies` (boolean)
**Default:** `true`

Whether to include devDependencies in compatibility analysis.

```json
{
  "includeDevDependencies": false  // Only check production deps
}
```

### `outputFormat` (string)
**Default:** `"colored"`  
**Options:** `"colored"`, `"json"`, `"minimal"`

Controls the output format of compatibility reports:

- **`"colored"`** - Rich, colored terminal output with emojis
- **`"json"`** - Machine-readable JSON output
- **`"minimal"`** - Simple text output without colors

```json
{
  "outputFormat": "json"
}
```

## 📋 Example Configurations

### Conservative Team Setup
```json
{
  "packageManager": "npm",
  "riskTolerance": "low",
  "autoCheck": true,
  "checkOnInstall": true,
  "checkOnUpgrade": true,
  "excludePackages": [],
  "includeDevDependencies": true,
  "outputFormat": "colored"
}
```

### CI/CD Pipeline Setup
```json
{
  "packageManager": "npm",
  "riskTolerance": "medium",
  "autoCheck": true,
  "checkOnInstall": true,
  "checkOnUpgrade": true,
  "excludePackages": ["legacy-dep"],
  "includeDevDependencies": false,
  "outputFormat": "json"
}
```

### Fast Development Setup
```json
{
  "packageManager": "bun",
  "riskTolerance": "high", 
  "autoCheck": false,
  "checkOnInstall": false,
  "checkOnUpgrade": true,
  "excludePackages": [],
  "includeDevDependencies": true,
  "outputFormat": "minimal"
}
```

### Monorepo Setup
```json
{
  "packageManager": "pnpm",
  "riskTolerance": "medium",
  "autoCheck": true,
  "checkOnInstall": true,
  "checkOnUpgrade": true,
  "excludePackages": ["workspace-*"],
  "includeDevDependencies": true,
  "outputFormat": "colored"
}
```

## 🛠️ Advanced Options

You can also add these additional options:

### `timeout` (number)
**Default:** `30000` (30 seconds)

Timeout for network requests when checking package information.

```json
{
  "timeout": 60000  // 1 minute timeout
}
```

### `registry` (string)
**Default:** Uses npm default registry

Custom npm registry URL for package information.

```json
{
  "registry": "https://registry.npmjs.org/"
}
```

### `cacheDirectory` (string)
**Default:** `".pdc-cache"`

Directory to store cached package information.

```json
{
  "cacheDirectory": "./node_modules/.cache/pdc"
}
```

### `logLevel` (string)
**Default:** `"info"`  
**Options:** `"silent"`, `"error"`, `"warn"`, `"info"`, `"debug"`

Control logging verbosity.

```json
{
  "logLevel": "debug"  // Verbose logging
}
```

## 📍 File Location

The `.pdcrc.json` file should be placed in your project root directory (same level as `package.json`).

```
my-project/
├── package.json
├── .pdcrc.json     ← Configuration file
├── node_modules/
└── src/
```

## 🔄 Configuration Precedence

peer-dependency-checker looks for configuration in this order:

1. **`.pdcrc.json`** file (highest priority)
2. **`package.json`** `"pdc"` field
3. **Command line flags** (override specific options)
4. **Default values** (lowest priority)

### Example in package.json
```json
{
  "name": "my-project",
  "pdc": {
    "riskTolerance": "low",
    "excludePackages": ["legacy-dep"]
  }
}
```

## 🧪 Testing Configuration

Test your configuration with:

```bash
# Check current config
pdc config

# Test with your settings
pdc scan --config .pdcrc.json

# Override specific settings
pdc scan --risk-tolerance low --output-format json
```

## 🚨 Common Issues

**Config not being used?**
- Make sure `.pdcrc.json` is in project root
- Check JSON syntax with `jsonlint .pdcrc.json`
- Verify file permissions are readable

**Package manager not detected?**
- Explicitly set `"packageManager"` in config
- Make sure lock files exist in project root

**Checks too strict/lenient?**
- Adjust `"riskTolerance"` setting
- Use `"excludePackages"` for problematic dependencies

---

The `.pdcrc.json` file gives you full control over how peer-dependency-checker works in your project, allowing you to balance safety with development speed! 