import * as fs from 'fs';
import * as path from 'path';
import { Canvas } from 'canvas';
import * as moment from 'moment';

export class ImageStorage {
  private static GENERATED_IMAGES_DIR = path.join(process.cwd(), 'generated-images');

  static ensureDirectoryExists() {
    if (!fs.existsSync(this.GENERATED_IMAGES_DIR)) {
      fs.mkdirSync(this.GENERATED_IMAGES_DIR, { recursive: true });
    }
  }

  static saveImage(canvas: Canvas): string {
    this.ensureDirectoryExists();
    
    const filename = `thought-of-the-day-${moment().format('YYYY-MM-DD-HH-mm-ss')}.png`;
    const filepath = path.join(this.GENERATED_IMAGES_DIR, filename);
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);
    
    // Return full path relative to /images/
    return `${filename}`;
  }
}