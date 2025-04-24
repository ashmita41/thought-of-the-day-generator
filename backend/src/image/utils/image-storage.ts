import * as fs from 'fs';
import * as path from 'path';
import { Canvas, createCanvas } from 'canvas';
import * as moment from 'moment';

export class ImageStorage {
  private static GENERATED_IMAGES_DIR = path.join(process.cwd(), 'generated-images');

  static ensureDirectoriesExist() {
    // Main directory
    if (!fs.existsSync(this.GENERATED_IMAGES_DIR)) {
      fs.mkdirSync(this.GENERATED_IMAGES_DIR, { recursive: true });
    }
    
    // Subdirectories for different image types
    const thoughts = path.join(this.GENERATED_IMAGES_DIR, 'thoughts');
    const words = path.join(this.GENERATED_IMAGES_DIR, 'words');
    
    if (!fs.existsSync(thoughts)) {
      fs.mkdirSync(thoughts, { recursive: true });
    }
    
    if (!fs.existsSync(words)) {
      fs.mkdirSync(words, { recursive: true });
    }
  }

  static saveImage(canvas: Canvas, category: string = 'thought'): string {
    this.ensureDirectoriesExist();
    
    // Use category to determine subdirectory
    const subdirectory = category === 'word' ? 'words' : 'thoughts';
    const subDirPath = path.join(this.GENERATED_IMAGES_DIR, subdirectory);
    
    const filename = `${category}-of-the-day-${moment().format('YYYY-MM-DD-HH-mm-ss')}.png`;
    const filepath = path.join(subDirPath, filename);
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);
    
    // Return path with the /generated-images prefix to match the static file serving route
    return `generated-images/${subdirectory}/${filename}`;
  }
  
  static createPlaceholderImage(): Canvas {
    // Create a small transparent canvas
    const canvas = createCanvas(1, 1);
    const ctx = canvas.getContext('2d');
    
    // Set transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, 1, 1);
    
    return canvas;
  }
}