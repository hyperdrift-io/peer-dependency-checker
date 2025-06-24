#!/usr/bin/env node

/**
 * Fix MDX Tag Parsing Issues
 * Specifically targets "Unexpected closing slash / in tag" errors
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Searching for MDX tag parsing issues...\n');

function findProblematicTags(content, filePath) {
  const issues = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Look for problematic patterns that cause "unexpected closing slash" errors
    
    // Pattern 1: Self-closing tags that aren't properly formed
    const selfClosingPattern = /<(\w+)([^>]*)\s*\/>/g;
    let match;
    while ((match = selfClosingPattern.exec(line)) !== null) {
      const tagName = match[1];
      const attributes = match[2];
      
      // Check if this is a valid self-closing tag or if it might be causing issues
      if (!['img', 'br', 'hr', 'input', 'meta', 'link'].includes(tagName.toLowerCase())) {
        issues.push({
          type: 'INVALID_SELF_CLOSING',
          line: lineNum,
          content: line.trim(),
          tag: match[0],
          suggestion: `<${tagName}${attributes}></${tagName}>`
        });
      }
    }
    
    // Pattern 2: Malformed closing tags
    const malformedClosingPattern = /<\/([^>]*)\s+\/>/g;
    while ((match = malformedClosingPattern.exec(line)) !== null) {
      issues.push({
        type: 'MALFORMED_CLOSING',
        line: lineNum,
        content: line.trim(),
        tag: match[0],
        suggestion: `</${match[1].trim()}>`
      });
    }
    
    // Pattern 3: Stray forward slashes in tags
    const straySlashPattern = /<([^>]*\/[^>]*(?<!\/))>/g;
    while ((match = straySlashPattern.exec(line)) !== null) {
      // Skip if this is a valid self-closing tag or URL
      if (!match[0].endsWith('/>') && !match[1].includes('http')) {
        issues.push({
          type: 'STRAY_SLASH',
          line: lineNum,
          content: line.trim(),
          tag: match[0],
          suggestion: 'Check for misplaced forward slash'
        });
      }
    }
    
    // Pattern 4: Unclosed angle brackets in code or text
    const unmatched = [];
    let openBrackets = 0;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '<') {
        openBrackets++;
      } else if (line[i] === '>') {
        openBrackets--;
        if (openBrackets < 0) {
          issues.push({
            type: 'UNMATCHED_CLOSING',
            line: lineNum,
            content: line.trim(),
            tag: `Unmatched > at position ${i}`,
            suggestion: 'Escape with &gt; or ensure proper tag structure'
          });
          openBrackets = 0;
        }
      }
    }
    
    // Pattern 5: Arrow functions or comparison operators that might be interpreted as tags
    const arrowPattern = /(?<!`)[^`]*=>\s*[^`]*(?!`)/g;
    if (arrowPattern.test(line) && !line.includes('```') && !line.includes('`')) {
      // This might be an arrow function outside of code blocks
      const codeBlockCount = content.substring(0, content.indexOf(line)).split('```').length - 1;
      const inCodeBlock = codeBlockCount % 2 !== 0;
      
      if (!inCodeBlock) {
        issues.push({
          type: 'ARROW_FUNCTION',
          line: lineNum,
          content: line.trim(),
          tag: 'Arrow function outside code block',
          suggestion: 'Wrap in code blocks or escape'
        });
      }
    }
  });
  
  return issues;
}

function fixContent(content) {
  let fixed = content;
  
  // Fix 1: Convert invalid self-closing tags to proper open/close pairs
  fixed = fixed.replace(/<(\w+)([^>]*)\s*\/>/g, (match, tagName, attributes) => {
    // Keep valid self-closing tags
    if (['img', 'br', 'hr', 'input', 'meta', 'link'].includes(tagName.toLowerCase())) {
      return match;
    }
    // Convert others to open/close pairs
    return `<${tagName}${attributes}></${tagName}>`;
  });
  
  // Fix 2: Remove stray slashes from closing tags
  fixed = fixed.replace(/<\/([^>]*)\s+\/>/g, '</$1>');
  
  // Fix 3: Escape lone angle brackets that aren't part of tags
  // This is tricky - we need to be careful not to break actual HTML/JSX
  
  // Fix 4: Escape arrows in text (but not in code blocks)
  const lines = fixed.split('\n');
  const fixedLines = lines.map((line, index) => {
    // Check if we're in a code block
    const beforeLines = lines.slice(0, index);
    const codeBlockCount = beforeLines.filter(l => l.trim().startsWith('```')).length;
    const inCodeBlock = codeBlockCount % 2 !== 0;
    
    if (inCodeBlock || line.includes('`')) {
      return line; // Don't modify code
    }
    
    // Escape problematic arrow patterns outside code
    return line.replace(/(?<!`[^`]*)->/g, '\\->').replace(/(?<!`[^`]*)<-/g, '\\<-');
  });
  
  return fixedLines.join('\n');
}

function analyzeFile(filePath) {
  console.log(`🔍 Analyzing: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = findProblematicTags(content, filePath);
  
  if (issues.length === 0) {
    console.log('✅ No tag issues found\n');
    return false;
  }
  
  console.log(`❌ Found ${issues.length} potential issues:`);
  issues.forEach(issue => {
    console.log(`   Line ${issue.line}: ${issue.type}`);
    console.log(`   Content: ${issue.content}`);
    console.log(`   Problem: ${issue.tag}`);
    console.log(`   Suggestion: ${issue.suggestion}`);
    console.log('');
  });
  
  // Apply automatic fixes
  const fixedContent = fixContent(content);
  if (fixedContent !== content) {
    fs.writeFileSync(filePath, fixedContent);
    console.log('✅ Applied automatic fixes\n');
    return true;
  }
  
  console.log('⚠️  Manual review required\n');
  return false;
}

// Find all markdown files
function findMarkdownFiles(dir) {
  const files = [];
  
  function traverse(currentPath) {
    const items = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item.name);
      
      if (item.isDirectory()) {
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
const markdownFiles = findMarkdownFiles('.');
let fixedCount = 0;

console.log(`Found ${markdownFiles.length} markdown files to analyze\n`);

markdownFiles.forEach(file => {
  if (analyzeFile(file)) {
    fixedCount++;
  }
});

console.log('📊 Analysis Summary:');
console.log(`   Files analyzed: ${markdownFiles.length}`);
console.log(`   Files with fixes applied: ${fixedCount}`);

if (fixedCount > 0) {
  console.log('\n✨ MDX tag issues have been fixed!');
  console.log('   Try building your MDX again to see if the error is resolved.');
} else {
  console.log('\n🤔 No automatic fixes were applied.');
  console.log('   The issue might require manual investigation.');
} 