#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix unterminated string constants caused by incorrect replacements
function fixUnterminatedStrings(content, filePath) {
  let modified = content;
  let changesMade = 0;
  
  // Fix patterns where &apos; was incorrectly inserted in JavaScript strings
  const fixes = [
    // Fix JavaScript string literals that got broken
    { pattern: /&apos;/g, replacement: "'" },
    { pattern: /&quot;/g, replacement: '"' },
    
    // Fix specific broken patterns
    { pattern: /'&apos;/g, replacement: "''" },
    { pattern: /"&quot;/g, replacement: '""' },
    { pattern: /&apos;'/g, replacement: "''" },
    { pattern: /&quot;"/g, replacement: '""' },
    
    // Fix broken string assignments
    { pattern: /: '&apos;,/g, replacement: ": ''," },
    { pattern: /: "&quot;,/g, replacement: ': "",' },
    { pattern: /= '&apos;/g, replacement: "= ''" },
    { pattern: /= "&quot;/g, replacement: '= ""' },
    
    // Fix function calls with broken strings
    { pattern: /\('&apos;\)/g, replacement: "('')" },
    { pattern: /\("&quot;\)/g, replacement: '("")' },
    
    // Fix template literals and other patterns
    { pattern: /`&apos;/g, replacement: "`'" },
    { pattern: /`&quot;/g, replacement: '`"' },
    { pattern: /&apos;`/g, replacement: "'`" },
    { pattern: /&quot;`/g, replacement: '"`' }
  ];
  
  fixes.forEach(({ pattern, replacement }) => {
    const matches = modified.match(pattern);
    if (matches) {
      modified = modified.replace(pattern, replacement);
      changesMade += matches.length;
    }
  });
  
  if (changesMade > 0) {
    console.log(`${filePath}: Fixed ${changesMade} unterminated string issues`);
  }
  
  return modified;
}

// Get all TypeScript/JavaScript files
function getAllFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let files = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files = files.concat(getAllFiles(fullPath, extensions));
    } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Apply fixes
    content = fixUnterminatedStrings(content, filePath);
    
    // Write back if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${filePath}`);
    }
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

console.log('🔧 Fixing unterminated string constants...\n');

// Process all source files
const files = getAllFiles('src');
console.log(`Found ${files.length} files to process\n`);

files.forEach(processFile);

console.log('\n✅ String fixes completed!');
console.log('Run "npm run build" to test compilation.');