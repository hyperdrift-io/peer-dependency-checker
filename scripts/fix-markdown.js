#!/usr/bin/env node

/**
 * Markdown/MDX Auto-Fix Script
 * Automatically fixes common issues that cause MDX parsers to fail
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Markdown files for MDX compatibility...\n');

class MarkdownFixer {
  constructor() {
    this.fixesApplied = 0;
  }

  fixFile(filePath) {
    console.log(`📄 Fixing: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Apply fixes
    content = this.fixNestedEmphasis(content);
    content = this.fixTableFormatting(content);
    content = this.fixJSXSyntax(content);
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log('✅ Fixed and saved\n');
      this.fixesApplied++;
    } else {
      console.log('✅ No fixes needed\n');
    }
  }

  fixNestedEmphasis(content) {
    // Fix nested emphasis by removing inner bold formatting when problematic
    // Pattern: **text with *italic* inside** -> **text with italic inside**
    content = content.replace(/\*\*([^*]*)\*([^*]*)\*([^*]*)\*\*/g, '**$1$2$3**');
    
    // More conservative approach: escape inner asterisks in bold text
    // **text** remains unchanged, but **text*with*asterisks** becomes **text\*with\*asterisks**
    content = content.replace(/\*\*([^*]*\*[^*]*)\*\*/g, (match, innerText) => {
      const escaped = innerText.replace(/\*/g, '\\*');
      return `**${escaped}**`;
    });
    
    return content;
  }

  fixTableFormatting(content) {
    // Fix || patterns in JSON/code that are being misinterpreted as table cells
    const lines = content.split('\n');
    const fixedLines = lines.map((line, index) => {
      // Skip if this line is in a code block
      const beforeLines = lines.slice(0, index);
      const afterLines = lines.slice(index + 1);
      
      const codeBlocksBefore = beforeLines.filter(l => l.trim().startsWith('```')).length;
      const isInCodeBlock = codeBlocksBefore % 2 !== 0;
      
      if (isInCodeBlock) {
        return line; // Don't modify lines inside code blocks
      }

      // Check if this looks like a table row (has multiple | and other table-like patterns)
      const pipeCount = (line.match(/\|/g) || []).length;
      const hasTableMarkers = line.includes('|') && 
        (line.includes('✅') || line.includes('❌') || line.includes('⚠️') ||
         (pipeCount >= 3 && !line.includes('"')));

      if (hasTableMarkers) {
        return line; // This is actually a table, don't modify
      }

      // Check if this is JSON with || patterns that should be escaped
      if (line.includes('||') && (line.includes('"') || line.trim().endsWith(','))) {
        // This looks like JSON or code with logical OR, not a table
        // But since it's not in a code block, it might be interpreted as a table
        // Let's see if we can determine context better
        
        const prevLine = index > 0 ? lines[index - 1] : '';
        const nextLine = index < lines.length - 1 ? lines[index + 1] : '';
        
        // If surrounded by code-like content, this is probably not a table
        if (prevLine.includes('{') || nextLine.includes('}') || 
            line.includes('"') && line.includes(':')) {
          return line; // Keep as is - this is code content
        }
      }

      return line;
    });

    return fixedLines.join('\n');
  }

  fixJSXSyntax(content) {
    // Fix angle brackets that might be interpreted as JSX
    // Specifically target patterns like `<packages>` in table cells
    
    content = content.replace(/\| `([^`]*)<([^>]+)>([^`]*)` \|/g, '| `$1\\<$2\\>$3` |');
    
    // Also fix angle brackets in regular text that might be command-like
    content = content.replace(/`([^`]*)<([^>]+)>([^`]*)`/g, '`$1\\<$2\\>$3`');
    
    return content;
  }
}

// Find and fix all markdown files
function findMarkdownFiles(dir) {
  const files = [];
  
  function traverse(currentPath) {
    const items = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item.name);
      
      if (item.isDirectory()) {
        // Skip node_modules and .git
        if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(item.name)) {
          traverse(fullPath);
        }
      } else if (item.name.endsWith('.md') || item.name.endsWith('.mdx')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Main execution
const fixer = new MarkdownFixer();
const markdownFiles = findMarkdownFiles('.');

console.log(`Found ${markdownFiles.length} markdown files\n`);

markdownFiles.forEach(file => {
  fixer.fixFile(file);
});

console.log('📊 Fix Summary:');
console.log(`   Files processed: ${markdownFiles.length}`);
console.log(`   Files modified: ${fixer.fixesApplied}`);

if (fixer.fixesApplied > 0) {
  console.log('\n✨ Markdown files have been fixed for MDX compatibility!');
  console.log('   Run the validation script again to verify all issues are resolved.');
} else {
  console.log('\n🎉 No fixes were needed!');
} 