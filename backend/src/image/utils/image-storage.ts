import * as fs from 'fs';
import * as path from 'path';
import { Canvas } from 'canvas';
import * as moment from 'moment';
import { Logger } from '@nestjs/common';

export class ImageStorage {
  private static logger = new Logger(ImageStorage.name);

  static readonly GENERATED_IMAGES_DIR = path
    .resolve(__dirname, '..', '..', '..', '..', 'generated-images')
    .replace(/\\/g, '/');
  static readonly THOUGHT_IMAGES_DIR = path.join(
    ImageStorage.GENERATED_IMAGES_DIR,
    'thoughts',
  );
  static readonly WORD_IMAGES_DIR = path.join(
    ImageStorage.GENERATED_IMAGES_DIR,
    'words',
  );
  static readonly TEMP_DIR = path.join(
    ImageStorage.GENERATED_IMAGES_DIR,
    'temp',
  );

  static async ensureDirectoriesExist(): Promise<void> {
    try {
      await ImageStorage.createDirectoryIfNotExists(
        ImageStorage.GENERATED_IMAGES_DIR,
      );
      await ImageStorage.createDirectoryIfNotExists(
        ImageStorage.THOUGHT_IMAGES_DIR,
      );
      await ImageStorage.createDirectoryIfNotExists(
        ImageStorage.WORD_IMAGES_DIR,
      );
      await ImageStorage.createDirectoryIfNotExists(ImageStorage.TEMP_DIR);

      ImageStorage.logger.log('All directories are ready');
    } catch (error) {
      ImageStorage.logger.error(
        `Error ensuring directories exist: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private static async createDirectoryIfNotExists(
    directoryPath: string,
  ): Promise<void> {
    try {
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
        ImageStorage.logger.log(`Created directory: ${directoryPath}`);
      }
    } catch (error) {
      ImageStorage.logger.error(
        `Error creating directory ${directoryPath}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  static async saveImage(
    canvas: Canvas,
    type: 'thought' | 'word' | 'temp',
    filename?: string,
  ): Promise<string> {
    try {
      const buffer = canvas.toBuffer('image/png');
      const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss-SSS');
      const generatedFilename = filename || `${timestamp}.png`;

      let directoryPath: string;
      let urlPath: string;
      switch (type) {
        case 'thought':
          directoryPath = ImageStorage.THOUGHT_IMAGES_DIR;
          urlPath = `generated-images/thoughts/${generatedFilename}`;
          break;
        case 'word':
          directoryPath = ImageStorage.WORD_IMAGES_DIR;
          urlPath = `generated-images/words/${generatedFilename}`;
          break;
        case 'temp':
          directoryPath = ImageStorage.TEMP_DIR;
          urlPath = `generated-images/temp/${generatedFilename}`;
          break;
        default:
          throw new Error(`Invalid image type: ${type}`);
      }

      const filePath = path.join(directoryPath, generatedFilename);

      fs.writeFileSync(filePath, buffer);
      ImageStorage.logger.log(`Image saved to: ${filePath}`);

      return urlPath;
    } catch (error) {
      ImageStorage.logger.error(
        `Error saving image: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  static createPlaceholderImage(
    message: string = 'Image not available',
  ): Canvas {
    const canvas = new Canvas(400, 300);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 400, 300);

    // Error text
    ctx.fillStyle = '#ff0000';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Error generating image', 200, 100);
    ctx.fillText(message, 200, 150);

    return canvas;
  }
}
