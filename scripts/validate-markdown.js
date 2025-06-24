#!/usr/bin/env node

/**
 * Markdown/MDX Validation Script
 * Checks for common issues that cause MDX parsers to fail
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Markdown files for MDX compatibility...\n');

class MarkdownValidator {
  constructor() {
    this.issues = [];
  }

  validateFile(filePath) {
    console.log(`📄 Checking: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    this.checkFile(filePath, content, lines);
    
    if (this.issues.length === 0) {
      console.log('✅ No issues found\n');
    } else {
      console.log(`❌ Found ${this.issues.length} issues:\n`);
      this.issues.forEach(issue => {
        console.log(`   ${issue.type}: ${issue.message}`);
        if (issue.line) {
          console.log(`   Line ${issue.line}: ${issue.context}`);
        }
        console.log('');
      });
    }
    
    const issueCount = this.issues.length;
    this.issues = [];
    return issueCount;
  }

  checkFile(filePath, content, lines) {
    // Check for JSX-like syntax that might confuse MDX
    this.checkJSXSyntax(content, lines);
    
    // Check for problematic HTML entities
    this.checkHTMLEntities(content, lines);
    
    // Check for unescaped characters
    this.checkUnescapedCharacters(content, lines);
    
    // Check for invalid frontmatter
    this.checkFrontmatter(content, lines);
    
    // Check code block issues
    this.checkCodeBlocks(content, lines);
    
    // Check table formatting
    this.checkTables(content, lines);
    
    // Check for nested emphasis
    this.checkNestedEmphasis(content, lines);
  }

  checkJSXSyntax(content, lines) {
    // Look for angle brackets that might be interpreted as JSX
    const jsxPattern = /<(?!\/?(h[1-6]|p|div|span|strong|em|code|pre|ul|ol|li|blockquote|table|thead|tbody|tr|td|th|img|a|br|hr)(\s|>|\/|$))[^>]*>/g;
    let match;
    
    while ((match = jsxPattern.exec(content)) !== null) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      this.issues.push({
        type: 'JSX_SYNTAX',
        message: 'Potential JSX syntax that may confuse MDX parser',
        line: lineNum,
        context: lines[lineNum - 1]?.trim()
      });
    }
  }

  checkHTMLEntities(content, lines) {
    // Check for unescaped HTML entities
    const entityPattern = /&(?!amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);/g;
    let match;
    
    while ((match = entityPattern.exec(content)) !== null) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      this.issues.push({
        type: 'HTML_ENTITY',
        message: `Potentially invalid HTML entity: ${match[0]}`,
        line: lineNum,
        context: lines[lineNum - 1]?.trim()
      });
    }
  }

  checkUnescapedCharacters(content, lines) {
    // Check for unescaped characters that have special meaning in MDX
    const patterns = [
      { char: '{', pattern: /(?<!`){(?![^`]*`)/g, message: 'Unescaped { outside code blocks' },
      { char: '}', pattern: /(?<!`)}(?![^`]*`)/g, message: 'Unescaped } outside code blocks' },
    ];
    
    patterns.forEach(({ char, pattern, message }) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNum = content.substring(0, match.index).split('\n').length;
        const line = lines[lineNum - 1];
        
        // Skip if inside code block
        if (line?.includes('```') || line?.includes('`' + char)) continue;
        
        this.issues.push({
          type: 'UNESCAPED_CHAR',
          message,
          line: lineNum,
          context: line?.trim()
        });
      }
    });
  }

  checkFrontmatter(content, lines) {
    if (content.startsWith('---')) {
      const frontmatterEnd = content.indexOf('---', 3);
      if (frontmatterEnd === -1) {
        this.issues.push({
          type: 'FRONTMATTER',
          message: 'Unclosed frontmatter block',
          line: 1,
          context: lines[0]
        });
      }
    }
  }

  checkCodeBlocks(content, lines) {
    const codeBlockPattern = /```/g;
    const matches = [...content.matchAll(codeBlockPattern)];
    
    if (matches.length % 2 !== 0) {
      this.issues.push({
        type: 'CODE_BLOCK',
        message: 'Unmatched code block delimiters',
        line: null,
        context: 'Check for missing closing ```'
      });
    }

    // Check for language specifiers that might cause issues
    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        const lang = line.substring(3).trim();
        if (lang && !/^[a-zA-Z0-9-_]+$/.test(lang)) {
          this.issues.push({
            type: 'CODE_BLOCK_LANG',
            message: `Invalid language specifier: ${lang}`,
            line: index + 1,
            context: line
          });
        }
      }
    });
  }

  checkTables(content, lines) {
    lines.forEach((line, index) => {
      if (line.includes('|')) {
        // Check for malformed table rows
        const pipes = line.split('|').length - 1;
        if (pipes > 0) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('|') && !trimmed.endsWith('|') && pipes > 1) {
            // This might be a table row - check next few lines
            const nextLine = lines[index + 1];
            const prevLine = lines[index - 1];
            
            if (nextLine?.includes('|') || prevLine?.includes('|')) {
              // Likely a table, check formatting
              if (trimmed.includes('||')) {
                this.issues.push({
                  type: 'TABLE_FORMAT',
                  message: 'Empty table cells (||) may cause parsing issues',
                  line: index + 1,
                  context: line.trim()
                });
              }
            }
          }
        }
      }
    });
  }

  checkNestedEmphasis(content, lines) {
    // Check for potentially problematic nested emphasis
    const nestedPattern = /\*\*[^*]*\*[^*]*\*[^*]*\*\*/g;
    let match;
    
    while ((match = nestedPattern.exec(content)) !== null) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      this.issues.push({
        type: 'NESTED_EMPHASIS',
        message: 'Complex nested emphasis may cause parsing issues',
        line: lineNum,
        context: lines[lineNum - 1]?.trim()
      });
    }
  }
}

// Find and validate all markdown files
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
const validator = new MarkdownValidator();
const markdownFiles = findMarkdownFiles('.');
let totalIssues = 0;

console.log(`Found ${markdownFiles.length} markdown files\n`);

markdownFiles.forEach(file => {
  totalIssues += validator.validateFile(file);
});

console.log('📊 Validation Summary:');
console.log(`   Files checked: ${markdownFiles.length}`);
console.log(`   Total issues: ${totalIssues}`);

if (totalIssues === 0) {
  console.log('\n🎉 All markdown files are MDX-compatible!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some files have potential MDX compatibility issues.');
  console.log('   These should be fixed to ensure proper parsing in the Hyperdrift portal.');
  process.exit(1);
} 