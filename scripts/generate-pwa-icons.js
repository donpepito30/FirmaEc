import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/favicon.svg');
const publicDir = path.resolve('public');

async function generateIcons() {
  console.log('Generating PWA Icons & Social Thumbnails with Sharp...');

  // 1. Standard 512x512 PNG
  await sharp(svgPath)
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 2. Standard 192x192 PNG
  await sharp(svgPath)
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 3. Apple Touch Icon 180x180 PNG
  await sharp(svgPath)
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 4. Favicon 64x64 PNG & Favicon JPG
  await sharp(svgPath)
    .resize(64, 64)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon.png'));

  await sharp(svgPath)
    .resize(512, 512)
    .jpeg({ quality: 95 })
    .toFile(path.join(publicDir, 'favicon.jpg'));

  // 5. Maskable Icon 512x512 PNG
  await sharp(svgPath)
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  console.log('All PWA icons & thumbnails generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
