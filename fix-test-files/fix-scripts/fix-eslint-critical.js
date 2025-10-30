#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Critical fixes for ESLint errors
const fixes = [
  // Fix unescaped entities - most common patterns
  {
    pattern: /don't/g,
    replacement: "don&apos;t",
    description: "Fix unescaped apostrophe in don't"
  },
  {
    pattern: /can't/g,
    replacement: "can&apos;t", 
    description: "Fix unescaped apostrophe in can't"
  },
  {
    pattern: /won't/g,
    replacement: "won&apos;t",
    description: "Fix unescaped apostrophe in won't"
  },
  {
    pattern: /it's/g,
    replacement: "it&apos;s",
    description: "Fix unescaped apostrophe in it's"
  },
  {
    pattern: /you're/g,
    replacement: "you&apos;re",
    description: "Fix unescaped apostrophe in you're"
  },
  {
    pattern: /we're/g,
    replacement: "we&apos;re",
    description: "Fix unescaped apostrophe in we're"
  },
  {
    pattern: /they're/g,
    replacement: "they&apos;re",
    description: "Fix unescaped apostrophe in they're"
  },
  {
    pattern: /that's/g,
    replacement: "that&apos;s",
    description: "Fix unescaped apostrophe in that's"
  },
  {
    pattern: /what's/g,
    replacement: "what&apos;s",
    description: "Fix unescaped apostrophe in what's"
  },
  {
    pattern: /here's/g,
    replacement: "here&apos;s",
    description: "Fix unescaped apostrophe in here's"
  },
  {
    pattern: /there's/g,
    replacement: "there&apos;s",
    description: "Fix unescaped apostrophe in there's"
  },
  {
    pattern: /let's/g,
    replacement: "let&apos;s",
    description: "Fix unescaped apostrophe in let's"
  },
  {
    pattern: /I'm/g,
    replacement: "I&apos;m",
    description: "Fix unescaped apostrophe in I'm"
  },
  {
    pattern: /you'll/g,
    replacement: "you&apos;ll",
    description: "Fix unescaped apostrophe in you'll"
  },
  {
    pattern: /we'll/g,
    replacement: "we&apos;ll",
    description: "Fix unescaped apostrophe in we'll"
  },
  {
    pattern: /they'll/g,
    replacement: "they&apos;ll",
    description: "Fix unescaped apostrophe in they'll"
  },
  {
    pattern: /I'll/g,
    replacement: "I&apos;ll",
    description: "Fix unescaped apostrophe in I'll"
  },
  {
    pattern: /isn't/g,
    replacement: "isn&apos;t",
    description: "Fix unescaped apostrophe in isn't"
  },
  {
    pattern: /aren't/g,
    replacement: "aren&apos;t",
    description: "Fix unescaped apostrophe in aren't"
  },
  {
    pattern: /wasn't/g,
    replacement: "wasn&apos;t",
    description: "Fix unescaped apostrophe in wasn't"
  },
  {
    pattern: /weren't/g,
    replacement: "weren&apos;t",
    description: "Fix unescaped apostrophe in weren't"
  },
  {
    pattern: /doesn't/g,
    replacement: "doesn&apos;t",
    description: "Fix unescaped apostrophe in doesn't"
  },
  {
    pattern: /didn't/g,
    replacement: "didn&apos;t",
    description: "Fix unescaped apostrophe in didn't"
  },
  {
    pattern: /haven't/g,
    replacement: "haven&apos;t",
    description: "Fix unescaped apostrophe in haven't"
  },
  {
    pattern: /hasn't/g,
    replacement: "hasn&apos;t",
    description: "Fix unescaped apostrophe in hasn't"
  },
  {
    pattern: /hadn't/g,
    replacement: "hadn&apos;t",
    description: "Fix unescaped apostrophe in hadn't"
  },
  {
    pattern: /shouldn't/g,
    replacement: "shouldn&apos;t",
    description: "Fix unescaped apostrophe in shouldn't"
  },
  {
    pattern: /wouldn't/g,
    replacement: "wouldn&apos;t",
    description: "Fix unescaped apostrophe in wouldn't"
  },
  {
    pattern: /couldn't/g,
    replacement: "couldn&apos;t",
    description: "Fix unescaped apostrophe in couldn't"
  }
];

// Files to process
const filesToProcess = [
  'src/app/admin/settings/page.tsx',
  'src/app/privacy-policy/page.tsx',
  'src/app/terms/page.tsx',
  'src/app/featured/page.tsx',
  'src/app/categories/[slug]/page.tsx',
  'src/components/ContactForm.tsx',
  'src/components/CookieBanner.tsx',
  'src/components/Header.tsx'
];

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changesMade = 0;

  fixes.forEach(fix => {
    const matches = content.match(fix.pattern);
    if (matches) {
      content = content.replace(fix.pattern, fix.replacement);
      changesMade += matches.length;
      console.log(`${filePath}: ${fix.description} (${matches.length} replacements)`);
    }
  });

  if (changesMade > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${changesMade} issues in ${filePath}`);
  } else {
    console.log(`✓ No issues found in ${filePath}`);
  }
}

console.log('🔧 Starting ESLint critical fixes...\n');

filesToProcess.forEach(processFile);

console.log('\n✅ ESLint critical fixes completed!');
console.log('Run "npm run lint" to check remaining issues.');