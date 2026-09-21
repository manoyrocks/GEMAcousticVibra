import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateIcons() {
  const iconSvg = fs.readFileSync(path.resolve('public/icon.svg'));
  const iconMaskableSvg = fs.readFileSync(path.resolve('public/icon-maskable.svg'));

  const targets = [
    { svg: iconSvg, size: 180, out: 'public/apple-touch-icon.png' },
    { svg: iconSvg, size: 192, out: 'public/pwa-192x192.png' },
    { svg: iconSvg, size: 512, out: 'public/pwa-512x512.png' },
    { svg: iconMaskableSvg, size: 512, out: 'public/pwa-maskable-512x512.png' },
    { svg: iconSvg, size: 32, out: 'public/favicon-32x32.png' },
    { svg: iconSvg, size: 16, out: 'public/favicon-16x16.png' },
  ];

  for (const t of targets) {
    await sharp(t.svg)
      .resize(t.size, t.size)
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(path.resolve(t.out));
    console.log(`Generated: ${t.out} (${t.size}x${t.size})`);
  }

  // Generate favicon.ico from the 32x32 PNG (using sharp png copy)
  await sharp(iconSvg)
    .resize(48, 48)
    .png()
    .toFile(path.resolve('public/favicon.png'));

  console.log('All icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
