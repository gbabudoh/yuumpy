#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix malformed JSX syntax caused by incorrect alt attribute additions
function fixJSXSyntax(content, filePath) {
  let modified = content;
  let changesMade = 0;
  
  // Fix patterns where alt="" was incorrectly inserted
  const fixes = [
    // Fix broken img tags with malformed alt attributes
    { pattern: /onError=\{[^}]*\} alt=""> \{/g, replacement: 'onError={(e) => {' },
    { pattern: /\/ alt="">/g, replacement: '/>' },
    { pattern: /alt=\{[^}]*\}\s*\/ alt="">/g, replacement: (match) => match.replace(' / alt="">', '/>') },
    
    // Fix specific broken patterns
    { pattern: /loading="lazy"\s*\/ alt="">/g, replacement: 'loading="lazy" alt="" />' },
    { pattern: /decoding="async"\s*\/ alt="">/g, replacement: 'decoding="async" alt="" />' },
    { pattern: /className="[^"]*"\s*\/ alt="">/g, replacement: (match) => match.replace(' / alt="">', ' alt="" />') },
    
    // Fix onError handlers that got broken
    { pattern: /onError=\{[^}]*alt=""> \{([^}]*)\}\}/g, replacement: 'onError={(e) => { $1 }}' }
  ];
  
  fixes.forEach(({ pattern, replacement }) => {
    const matches = modified.match(pattern);
    if (matches) {
      modified = modified.replace(pattern, replacement);
      changesMade += matches.length;
    }
  });
  
  if (changesMade > 0) {
    console.log(`${filePath}: Fixed ${changesMade} JSX syntax issues`);
  }
  
  return modified;
}

// Get all TypeScript/JavaScript files
function getAllFiles(dir, extensions = ['.tsx', '.jsx']) {
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
    content = fixJSXSyntax(content, filePath);
    
    // Write back if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${filePath}`);
    }
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

console.log('🔧 Fixing JSX syntax errors...\n');

// Process all JSX/TSX files
const files = getAllFiles('src');
console.log(`Found ${files.length} files to process\n`);

files.forEach(processFile);

console.log('\n✅ JSX syntax fixes completed!');
console.log('Run "npm run build" to test compilation.');