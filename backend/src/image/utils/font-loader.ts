import * as fs from 'fs';
import * as path from 'path';
import { registerFont } from 'canvas';

export class FontLoader {
  static loadFonts() {
    const fontDir = path.join(__dirname, '../../assets/fonts');
    
    // Example of registering fonts
    const fontFiles = fs.readdirSync(fontDir)
      .filter(file => file.endsWith('.ttf') || file.endsWith('.otf'));

    fontFiles.forEach(file => {
      registerFont(path.join(fontDir, file), { 
        family: path.basename(file, path.extname(file)) 
      });
    });
  }
}