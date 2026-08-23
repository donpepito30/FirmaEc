import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import https from 'https';

const imageUrl = 'https://i.ibb.co/gLHyRXGF/1787509151518.png';
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

  await sharp(sourceFile)
    .resize(512, 512, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .jpeg({ quality: 95 })
    .toFile(path.join(publicDir, 'favicon.jpg'));

  console.log('All PWA icons & favicons updated from user URL successfully!');
}

processIcons().catch((err) => {
  console.error('Error in download & process:', err);
  process.exit(1);
});
