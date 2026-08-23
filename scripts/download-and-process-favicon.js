import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import https from 'https';

const imageUrl = 'https://i.ibb.co/RkZ2DM14/1787509151518.png';
const publicDir = path.resolve('public');
const sourceFile = path.join(publicDir, 'custom-source-icon.png');

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadImage(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download image, status code: ${response.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(dest));
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function processIcons() {
  console.log(`Downloading icon from ${imageUrl}...`);
  await downloadImage(imageUrl, sourceFile);
  console.log(`Downloaded image to ${sourceFile}. Processing with Sharp...`);

  // Ensure image metadata is valid
  const metadata = await sharp(sourceFile).metadata();
  console.log(`Source image metadata: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

  // 1. Standard 512x512 PNG
  await sharp(sourceFile)
    .resize(512, 512, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 2. Maskable 512x512 PNG (with padding so it fits safe area when cropped by Android/iOS)
  await sharp(sourceFile)
    .resize(410, 410, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 0 } })
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 15, g: 23, b: 42, alpha: 1 }
    })
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // 3. Standard 192x192 PNG
  await sharp(sourceFile)
    .resize(192, 192, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 4. Maskable 192x192 PNG
  await sharp(sourceFile)
    .resize(154, 154, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 0 } })
    .extend({
      top: 19,
      bottom: 19,
      left: 19,
      right: 19,
      background: { r: 15, g: 23, b: 42, alpha: 1 }
    })
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-maskable-192x192.png'));

  // 5. Apple Touch Icon 180x180 PNG
  await sharp(sourceFile)
    .resize(180, 180, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 6. Favicon 64x64 PNG & Favicon JPG & custom-source-icon as favicon.png
  await sharp(sourceFile)
    .resize(64, 64, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon.png'));

  // Generate favicon.ico (32x32 ICO/PNG)
  await sharp(sourceFile)
    .resize(32, 32, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .toFile(path.join(publicDir, 'favicon.ico'));

  // Save to src/assets/logo.png for direct Vite bundler imports
  const srcAssetsDir = path.resolve('src/assets');
  if (!fs.existsSync(srcAssetsDir)) {
    fs.mkdirSync(srcAssetsDir, { recursive: true });
  }
  await sharp(sourceFile)
    .resize(192, 192, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .png({ quality: 100 })
    .toFile(path.join(srcAssetsDir, 'logo.png'));

  // Also save public/logo.png
  await sharp(sourceFile)
    .resize(192, 192, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'logo.png'));

  await sharp(sourceFile)
    .resize(512, 512, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .jpeg({ quality: 95 })
    .toFile(path.join(publicDir, 'favicon.jpg'));

  // 7. Generate favicon.svg containing base64 PNG
  const pwa512Buffer = fs.readFileSync(path.join(publicDir, 'pwa-512x512.png'));
  const base64Png = pwa512Buffer.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,${base64Png}" width="512" height="512" />
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);

  console.log('All PWA icons & favicons updated from user URL successfully!');
}

processIcons().catch((err) => {
  console.error('Error in download & process:', err);
  process.exit(1);
});
