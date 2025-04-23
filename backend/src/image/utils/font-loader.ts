import * as fs from 'fs';
import * as path from 'path';
import { registerFont } from 'canvas';

export class FontLoader {
  static loadFonts() {
    const fontDir = path.join(__dirname, '../../assets/fonts');

    // Make sure the directory exists
    if (!fs.existsSync(fontDir)) {
      fs.mkdirSync(fontDir, { recursive: true });
    }

    // Map of font files to font family names
    const fontMap = {
      // Default system fonts
      'arial.ttf': 'Arial',
      'georgia.ttf': 'Georgia',
      'verdana.ttf': 'Verdana',
      'courier.ttf': 'Courier New',
      'palatino.ttf': 'Palatino Linotype',
      'trebuchet.ttf': 'Trebuchet MS',

      // New modern fonts - make sure these files exist in assets/fonts directory
      'montserrat.ttf': 'Montserrat',
      'playfair.ttf': 'Playfair Display',
      'lato.ttf': 'Lato',
      'merriweather.ttf': 'Merriweather',
      'roboto-slab.ttf': 'Roboto Slab',
      'opensans.ttf': 'Open Sans',
      'librebaskerville.ttf': 'Libre Baskerville',
      'raleway.ttf': 'Raleway',
      'sourcesanspro.ttf': 'Source Sans Pro',
      'lora.ttf': 'Lora',
      'nunito.ttf': 'Nunito',
      'crimson.ttf': 'Crimson Text',
    };

    // Register all fonts that exist in the directory
    Object.entries(fontMap).forEach(([fileName, fontFamily]) => {
      const fontPath = path.join(fontDir, fileName);
      if (fs.existsSync(fontPath)) {
        registerFont(fontPath, { family: fontFamily });
      }
    });

    // Register any other fonts in the directory
    const fontFiles = fs
      .readdirSync(fontDir)
      .filter((file) => file.endsWith('.ttf') || file.endsWith('.otf'));

    fontFiles.forEach((file) => {
      // Only register if not already in our map
      if (!Object.keys(fontMap).includes(file)) {
        registerFont(path.join(fontDir, file), {
          family: path.basename(file, path.extname(file)),
        });
      }
    });
  }
}
