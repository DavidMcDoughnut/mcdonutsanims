import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '../public/optimized/formbgarr2.webp');
const outputPath = path.join(__dirname, '../public/optimized/formbgarr2-og.webp');

async function optimizeImage() {
  try {
    await sharp(inputPath)
      .resize(1200, 630, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 90 })
      .toFile(outputPath);
    
    console.log('Successfully created OG image:', outputPath);
  } catch (error) {
    console.error('Error creating OG image:', error);
  }
}

optimizeImage(); 