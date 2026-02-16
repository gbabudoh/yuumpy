import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceIcon = path.join(__dirname, '../public/yuumpy-icon.png');
const outputDir = path.join(__dirname, '../public');

// Icon sizes needed for PWA
const iconSizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 150, name: 'mstile-150x150.png' },
];

async function generateIcons() {
  try {
    // Check if source icon exists
    if (!fs.existsSync(sourceIcon)) {
      console.error(`Source icon not found: ${sourceIcon}`);
      process.exit(1);
    }

    console.log('Generating PWA icons from yuumpy-icon.png...\n');

    // Generate all icon sizes
    for (const { size, name } of iconSizes) {
      const outputPath = path.join(outputDir, name);
      
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated ${name} (${size}x${size})`);
    }

    // Also create a favicon.png (using 32x32 as default)
    const faviconPath = path.join(outputDir, 'favicon.png');
    await sharp(sourceIcon)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(faviconPath);
    
    console.log(`✓ Generated favicon.png (32x32)`);

    console.log('\n✅ All PWA icons generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Update src/app/manifest.ts to use PNG icons');
    console.log('2. Verify icons are displayed correctly');
    
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();

