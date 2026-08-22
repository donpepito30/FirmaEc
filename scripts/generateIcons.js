import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#2563eb" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- 100% Full-Bleed Background - No rounded corners in SVG so OS mask fills entirely -->
  <rect width="512" height="512" fill="url(#bgGrad)"/>
  
  <!-- Subtle inner ambient stroke frame -->
  <rect x="12" y="12" width="488" height="488" fill="none" stroke="#3b82f6" stroke-opacity="0.25" stroke-width="6"/>

  <!-- Escudo PKI (Shield) -->
  <g>
    <path d="M 256,85 L 385,132 C 385,285 288,375 256,412 C 224,375 127,285 127,132 Z" 
          fill="url(#shieldGrad)" 
          filter="url(#glow)"/>

    <!-- Interior Shield Contour -->
    <path d="M 256,108 L 366,149 C 366,275 281,352 256,385 C 231,352 146,275 146,149 Z" 
          fill="none" 
          stroke="#60a5fa" 
          stroke-opacity="0.45" 
          stroke-width="6"/>

    <!-- Pluma Digital / Checkmark Criptográfico -->
    <path d="M 195,248 L 242,295 L 332,185" 
          fill="none" 
          stroke="url(#goldGrad)" 
          stroke-width="36" 
          stroke-linecap="round" 
          stroke-linejoin="round"/>

    <!-- Detalle de sello digital/llave superior -->
    <circle cx="335" cy="180" r="13" fill="#fbbf24"/>
    <circle cx="256" cy="162" r="17" fill="url(#cyanGrad)" opacity="0.9"/>
  </g>
</svg>`;

async function generateIcons() {
  const publicDir = path.join(process.cwd(), 'public');
  
  // Guardar favicon.svg
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf-8');
  console.log('✓ Creado favicon.svg');

  const svgBuffer = Buffer.from(svgContent);

  // 1. pwa-512x512.png (512x512)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('✓ Creado pwa-512x512.png');

  // 2. pwa-192x192.png (192x192)
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('✓ Creado pwa-192x192.png');

  // 3. apple-touch-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Creado apple-touch-icon.png');

  // 4. favicon.png (512x512)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('✓ Creado favicon.png');

  // 5. favicon.jpg (512x512)
  await sharp(svgBuffer)
    .resize(512, 512)
    .jpeg({ quality: 95 })
    .toFile(path.join(publicDir, 'favicon.jpg'));
  console.log('✓ Creado favicon.jpg');
}

generateIcons().catch(err => {
  console.error('Error generando íconos:', err);
  process.exit(1);
});
