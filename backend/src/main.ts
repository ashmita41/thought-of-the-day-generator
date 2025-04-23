import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';
import { ImageStorage } from './image/utils/image-storage';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Set up CORS
  app.enableCors({
    origin: '*', // Allow all origins for testing
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Create placeholder images directory and files if they don't exist
  try {
    const placeholdersDir = path.join(process.cwd(), 'generated-images');
    const thoughtsDir = path.join(placeholdersDir, 'thoughts');
    const wordsDir = path.join(placeholdersDir, 'words');
    const tempDir = path.join(process.cwd(), 'temp');

    // Create directories
    if (!fs.existsSync(placeholdersDir)) {
      fs.mkdirSync(placeholdersDir, { recursive: true });
      logger.log(`Created main images directory: ${placeholdersDir}`);
    }
    if (!fs.existsSync(thoughtsDir)) {
      fs.mkdirSync(thoughtsDir, { recursive: true });
      logger.log(`Created thoughts directory: ${thoughtsDir}`);
    }
    if (!fs.existsSync(wordsDir)) {
      fs.mkdirSync(wordsDir, { recursive: true });
      logger.log(`Created words directory: ${wordsDir}`);
    }
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      logger.log(`Created temp directory: ${tempDir}`);
    }

    // Create placeholder files if they don't exist
    const placeholderThoughtPath = path.join(thoughtsDir, 'placeholder.png');
    const placeholderWordPath = path.join(wordsDir, 'placeholder.png');

    if (!fs.existsSync(placeholderThoughtPath)) {
      const transparentPixel = ImageStorage.createPlaceholderImage();
      fs.writeFileSync(placeholderThoughtPath, transparentPixel.toBuffer());
      logger.log(
        `Created thought placeholder image: ${placeholderThoughtPath}`,
      );
    }

    if (!fs.existsSync(placeholderWordPath)) {
      const transparentPixel = ImageStorage.createPlaceholderImage();
      fs.writeFileSync(placeholderWordPath, transparentPixel.toBuffer());
      logger.log(`Created word placeholder image: ${placeholderWordPath}`);
    }

    // Create test images to verify the static serving works
    const testThoughtPath = path.join(thoughtsDir, 'test-thought.png');
    const testWordPath = path.join(wordsDir, 'test-word.png');

    if (!fs.existsSync(testThoughtPath)) {
      const transparentPixel = ImageStorage.createPlaceholderImage();
      fs.writeFileSync(testThoughtPath, transparentPixel.toBuffer());
      logger.log(`Created test thought image: ${testThoughtPath}`);
    }

    if (!fs.existsSync(testWordPath)) {
      const transparentPixel = ImageStorage.createPlaceholderImage();
      fs.writeFileSync(testWordPath, transparentPixel.toBuffer());
      logger.log(`Created test word image: ${testWordPath}`);
    }
  } catch (error) {
    logger.error(
      `Error creating placeholder files: ${error.message}`,
      error.stack,
    );
  }

  // Serve static files
  app.use('/generated-images', (req, res, next) => {
    logger.log(`Received request for: ${req.url}`);

    // Handle URLs that start with a slash
    const urlPath = req.url.startsWith('/') ? req.url.substring(1) : req.url;

    // Try the main generated-images directory first
    const filePath = path.join(process.cwd(), 'generated-images', urlPath);
    logger.log(`Looking for file at: ${filePath}`);

    try {
      // Check if file exists
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        logger.log(`Found file in main directory: ${filePath}`);
        return res.sendFile(filePath);
      }

      // If not found, try the temp directory
      const tempPath = path.join(process.cwd(), 'temp', path.basename(urlPath));
      logger.log(`Looking for file in temp directory: ${tempPath}`);
      if (fs.existsSync(tempPath) && fs.statSync(tempPath).isFile()) {
        logger.log(`Found file in temp directory: ${tempPath}`);
        return res.sendFile(tempPath);
      }

      // If still not found, try a test image for validation
      const isThoughtPath = urlPath.includes('thoughts');
      const testImagePath = path.join(
        process.cwd(),
        'generated-images',
        isThoughtPath ? 'thoughts/test-thought.png' : 'words/test-word.png',
      );

      if (fs.existsSync(testImagePath)) {
        logger.log(`Serving test image for validation: ${testImagePath}`);
        return res.sendFile(testImagePath);
      }

      // If all else fails, use placeholder
      const type = isThoughtPath ? 'thoughts' : 'words';
      const placeholderPath = path.join(
        process.cwd(),
        'generated-images',
        type,
        'placeholder.png',
      );
      logger.log(`Using placeholder image: ${placeholderPath}`);

      if (
        fs.existsSync(placeholderPath) &&
        fs.statSync(placeholderPath).isFile()
      ) {
        return res.sendFile(placeholderPath);
      } else {
        // If placeholder doesn't exist, generate a transparent PNG on the fly
        logger.warn(`Placeholder image not found, generating on the fly`);
        res.setHeader('Content-Type', 'image/png');
        return res.end(ImageStorage.createPlaceholderImage().toBuffer());
      }
    } catch (error) {
      logger.error(`Error serving static file: ${error.message}`, error.stack);
      res.setHeader('Content-Type', 'image/png');
      return res.end(ImageStorage.createPlaceholderImage().toBuffer());
    }
  });

  await app.listen(3005);
  logger.log('Application is running on: http://localhost:3005');
}
bootstrap();
