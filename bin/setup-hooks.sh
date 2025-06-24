#!/bin/bash

# peer-dependency-checker setup script
# This script helps you set up automatic peer dependency checking

echo "🔍 peer-dependency-checker setup"
echo "=================================="
echo ""

# Function to create npm/pnpm aliases
setup_aliases() {
    echo "Setting up command aliases..."
    
    # Detect shell
    if [[ "$SHELL" == *"zsh"* ]]; then
        SHELL_RC="$HOME/.zshrc"
    elif [[ "$SHELL" == *"bash"* ]]; then
        SHELL_RC="$HOME/.bashrc"
    else
        SHELL_RC="$HOME/.profile"
    fi
    
    echo "# peer-dependency-checker aliases" >> "$SHELL_RC"
    echo "alias npm-safe='pdc-install npm'" >> "$SHELL_RC"
    echo "alias pnpm-safe='pdc-install pnpm'" >> "$SHELL_RC"
    echo "alias yarn-safe='pdc-install yarn'" >> "$SHELL_RC"
    echo "" >> "$SHELL_RC"
    
    echo "✅ Aliases added to $SHELL_RC"
    echo "   npm-safe install package   # npm install with peer dependency checking"
    echo "   pnpm-safe add package      # pnpm add with peer dependency checking"
    echo "   yarn-safe add package      # yarn add with peer dependency checking"
    echo ""
    echo "Run 'source $SHELL_RC' or restart your terminal to use these aliases."
}

# Function to set up git hooks
setup_git_hooks() {
    if [ ! -d ".git" ]; then
        echo "❌ Not in a git repository. Skipping git hooks setup."
        return
    fi
    
    echo "Setting up git hooks..."
    
    # Create pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# peer-dependency-checker git hook

echo "🔍 Running peer dependency check..."
if command -v pdc &> /dev/null; then
    pdc scan --quick
else
    echo "⚠️  pdc not found, skipping peer dependency check"
fi
EOF
    
    chmod +x .git/hooks/pre-commit
    echo "✅ Git pre-commit hook installed"
}

# Function to set up package.json hooks
setup_package_hooks() {
    if [ ! -f "package.json" ]; then
        echo "❌ No package.json found. Skipping package hooks setup."
        return
    fi
    
    echo "Setting up package.json hooks..."
    
    # Add npm scripts if they don't exist
    if ! grep -q "preinstall.*pdc" package.json; then
        echo "Adding preinstall hook to package.json..."
        # This would need a proper JSON parser in a real implementation
        echo "⚠️  Please manually add to your package.json scripts:"
        echo '    "preinstall": "pdc scan --quick || true",'
        echo '    "postinstall": "pdc analyze --brief || true"'
    else
        echo "✅ Package hooks already configured"
    fi
}

# Function to create husky hooks (if husky is installed)
setup_husky_hooks() {
    if [ ! -f "package.json" ] || ! grep -q "husky" package.json; then
        echo "❌ Husky not detected. Skipping husky setup."
        return
    fi
    
    echo "Setting up Husky hooks..."
    
    # Create husky pre-commit hook
    if [ -d ".husky" ]; then
        cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running peer dependency check..."
npx pdc scan --quick
EOF
        chmod +x .husky/pre-commit
        echo "✅ Husky pre-commit hook created"
    else
        echo "⚠️  .husky directory not found. Please run 'npx husky install' first."
    fi
}

# Main menu
echo "Choose setup options:"
echo "1) Command aliases (npm-safe, pnpm-safe, yarn-safe)"
echo "2) Git hooks (pre-commit check)"
echo "3) Package.json hooks (preinstall/postinstall)"
echo "4) Husky hooks (if available)"
echo "5) All of the above"
echo "0) Exit"
echo ""
read -p "Enter your choice (0-5): " choice

case $choice in
    1)
        setup_aliases
        ;;
    2)
        setup_git_hooks
        ;;
    3)
        setup_package_hooks
        ;;
    4)
        setup_husky_hooks
        ;;
    5)
        setup_aliases
        setup_git_hooks
        setup_package_hooks
        setup_husky_hooks
        ;;
    0)
        echo "Setup cancelled"
        exit 0
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎯 Setup complete!"
echo ""
echo "Usage examples:"
echo "  npm-safe install react@19     # Safe npm install"
echo "  pdc precheck react@19         # Check before installing"
echo "  pdc scan                      # Analyze current project"
echo "  pdc analyze                   # Deep dependency analysis"
echo ""
echo "For more help: pdc --help" 