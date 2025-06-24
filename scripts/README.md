# Validation Scripts

This directory contains scripts to ensure markdown files are compatible with MDX parsers, specifically for the Hyperdrift portal.

## Scripts

### `validate-markdown.js`
Comprehensive markdown validation that checks for:
- JSX-like syntax issues
- HTML entity problems  
- Unescaped characters
- Invalid frontmatter
- Code block issues
- Table formatting problems
- Nested emphasis issues

```bash
npm run validate:markdown
```

### `fix-mdx-tags.js`
Specifically targets and fixes MDX parsing errors like:
- "Unexpected closing slash / in tag" errors
- Self-closing tag issues
- Malformed HTML tags
- Unmatched angle brackets
- Shell redirections (`>`, `>>`) in code examples
- Arrow functions (`=>`) outside code blocks

```bash
npm run fix:markdown
```

### `fix-markdown.js`
General markdown fixer for various formatting issues.

### `fix-nested-emphasis.js`
Targeted fixer for nested emphasis patterns that confuse MDX.

## Usage in CI/CD

The validation is automatically run during `prepublishOnly` to ensure all markdown files are portal-ready before publishing.

## Common Issues Fixed

1. **Blockquotes with `>`** - Converted to plain text or properly escaped
2. **Shell redirections** - HTML entity encoded (`&gt;`, `&gt;&gt;`)
3. **Arrow functions** - HTML entity encoded (`=&gt;`)
4. **Stray HTML tags** - Removed or properly formed
5. **Complex emphasis** - Simplified nested bold/italic patterns

All fixes maintain the original content meaning while ensuring MDX compatibility. 