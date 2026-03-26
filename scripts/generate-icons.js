const fs = require('fs');
const path = require('path');

// Simple SVG to create icons
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const createIcon = (size) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B0000;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#000000;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#191970;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4ecdc4;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bgGrad)" rx="80"/>
  <circle cx="256" cy="256" r="180" fill="url(#iconGrad)" opacity="0.2"/>
  <path d="M200 150 L200 362 L380 256 Z" fill="url(#iconGrad)"/>
  <rect x="390" y="180" width="30" height="152" rx="8" fill="url(#iconGrad)"/>
  <rect x="430" y="180" width="30" height="152" rx="8" fill="url(#iconGrad)"/>
</svg>`;
  
  const iconPath = path.join(__dirname, `../public/icons/icon-${size}x${size}.svg`);
  fs.writeFileSync(iconPath, svg);
  console.log(`✓ Created icon-${size}x${size}.svg`);
};

sizes.forEach(createIcon);
console.log('\n✅ All SVG icons created!');
console.log('Note: For production, convert these to PNG using an online tool or ImageMagick');
