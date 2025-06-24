#!/usr/bin/env node

/**
 * Fix Nested Emphasis for MDX Compatibility
 * Specifically targets the **text** patterns that cause MDX parsing issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing nested emphasis for MDX compatibility...\n');

function fixNestedEmphasis(content) {
  // Instead of trying to parse complex patterns, let's be more conservative
  // Replace bold text that contains asterisks with a safer format
  
  // Pattern 1: **text with *inner* emphasis** -> **text with inner emphasis**
  content = content.replace(/\*\*([^*]*)\*([^*]*)\*([^*]*)\*\*/g, '**$1$2$3**');
  
  // Pattern 2: Bold headers like "### **Title**" -> "### Title"
  content = content.replace(/^(#{1,6})\s+\*\*([^*]+)\*\*(.*)$/gm, '$1 $2$3');
  
  // Pattern 3: Bold list items "- **item**" -> "- item" (when problematic)
  // We'll be selective here - only if it's causing parsing issues
  
  return content;
}

function fixTableCells(content) {
  // Fix || in non-table contexts
  const lines = content.split('\n');
  const fixedLines = lines.map((line, index) => {
    // Skip code blocks
    const beforeLines = lines.slice(0, index);
    const codeBlocksBefore = beforeLines.filter(l => l.trim().startsWith('```')).length;
    const isInCodeBlock = codeBlocksBefore % 2 !== 0;
    
    if (isInCodeBlock) {
      return line;
    }
    
    // If line contains || but doesn't look like a table, it might be code
    if (line.includes('||') && line.includes('"') && !line.includes('|✅|')) {
      // This is likely JSON or script content with logical OR
      // We should ensure it's in a proper code block or escape it
      return line; // For now, keep as is since it should be in code blocks
    }
    
    return line;
  });
  
  return fixedLines.join('\n');
}

function processFile(filePath) {
  console.log(`📄 Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  content = fixNestedEmphasis(content);
  content = fixTableCells(content);
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log('✅ Fixed and saved\n');
    return true;
  } else {
    console.log('✅ No changes needed\n');
    return false;
  }
}

// Target files that are most likely to be displayed in the portal
const criticalFiles = [
  'README.md',
  'public/journey.md',
  'public/journey-2024-12-24-testing-external-adoption.md',
  'public/integration-guide.md',
  'QUICK_START.md',
  'RELEASE_NOTES.md'
];

let fixedCount = 0;

console.log('Fixing critical markdown files for MDX compatibility...\n');

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    if (processFile(file)) {
      fixedCount++;
    }
  } else {
    console.log(`⚠️  File not found: ${file}\n`);
  }
});

console.log(`📊 Summary: Fixed ${fixedCount} out of ${criticalFiles.length} critical files`);

if (fixedCount > 0) {
  console.log('\n✨ Critical files have been optimized for MDX parsing!');
} else {
  console.log('\n🎉 No critical fixes were needed!');
} 