import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { WordService } from '../../words/services/word.service';
import { WordImageService } from '../services/word-image.service';
import { DesignService } from '../../design/services/design.service';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Response type for word image generation
 */
interface WordImageResponse {
  imageUrl: string;
}

/**
 * Controller for generating word of the day images
 */
@Controller('image')
export class WordImageController {
  private readonly logger = new Logger(WordImageController.name);
  private readonly placeholderPath: string;

  constructor(
    private readonly wordService: WordService,
    private readonly wordImageService: WordImageService,
    private readonly designService: DesignService,
  ) {
    this.placeholderPath = path.join(
      process.cwd(),
      'generated-images',
      'words',
      'placeholder.png',
    );
  }

  /**
   * GET /image/word-image
   * Generates an image for the word of the day
   * @param day Optional day to use for fixed design mode
   * @param mode Design mode - fixed (by day) or random
   * @returns Object with URL to the generated image
   */
  @Get('word-image')
  async generateWordImage(
    @Query('day') day?: string,
    @Query('mode') mode: 'fixed' | 'random' = 'random',
  ): Promise<WordImageResponse> {
    try {
      // Determine design based on query parameters
      const design =
        mode === 'fixed' && day
          ? this.designService.findByDay(day)
          : this.designService.getRandomDesign();

      // Get word of the day data
      const wordData = await this.wordService.getWordOfTheDay();

      if (!wordData || !wordData.word) {
        this.logger.warn('No word found or word service returned invalid data. Using default word.');
        return this.generateDefaultWordImage(design);
      }

      // Generate image with the word data
      this.logger.log(`Generating image for word: ${wordData.word}`);

      try {
        const imageUrl = await this.wordImageService.generateWordImage({
          word: wordData.word,
          definition: wordData.definition || `Definition of ${wordData.word}`,
          partOfSpeech: wordData.partOfSpeech || null,
          phonetic: wordData.phonetic || null,
          example: wordData.example || null,
          design,
        });

        this.logger.log(`Successfully generated word image: ${imageUrl}`);
        return { imageUrl };
      } catch (imageError) {
        const errorMessage = imageError instanceof Error ? imageError.message : String(imageError);
        const errorStack = imageError instanceof Error ? imageError.stack : undefined;
        
        this.logger.error(
          `Failed to generate word image: ${errorMessage}`,
          errorStack,
        );

        return this.getPlaceholderImage();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      this.logger.error(
        `Error in generateWordImage: ${errorMessage}`,
        errorStack,
      );

      return this.getPlaceholderImage();
    }
  }

  /**
   * Creates an image with default word data
   * @param design The design configuration to use
   * @returns Object with URL to the generated image
   */
  private async generateDefaultWordImage(design: any): Promise<WordImageResponse> {
    // Check if placeholder exists first
    if (fs.existsSync(this.placeholderPath)) {
      return { imageUrl: `/generated-images/words/placeholder.png` };
    }

    try {
      // Generate with a default word
      const defaultWordData = {
        word: 'Inspiration',
        definition: 'The process of being mentally stimulated to do or feel something.',
        partOfSpeech: 'noun',
        phonetic: '/ˌɪnspɪˈreɪʃn/',
        example: 'Nature was the inspiration for much of his work.',
      };

      const imageUrl = await this.wordImageService.generateWordImage({
        word: defaultWordData.word,
        definition: defaultWordData.definition,
        partOfSpeech: defaultWordData.partOfSpeech,
        phonetic: defaultWordData.phonetic,
        example: defaultWordData.example,
        design: design,
      });

      this.logger.log(`Successfully generated default word image: ${imageUrl}`);
      return { imageUrl };
    } catch (defaultError) {
      const errorMessage = defaultError instanceof Error ? defaultError.message : String(defaultError);
      const errorStack = defaultError instanceof Error ? defaultError.stack : undefined;
      
      this.logger.error(
        `Failed to generate default word image: ${errorMessage}`,
        errorStack,
      );

      return this.getPlaceholderImage();
    }
  }

  /**
   * Returns the placeholder image URL
   * @returns Object with URL to the placeholder image
   */
  private getPlaceholderImage(): WordImageResponse {
    try {
      if (fs.existsSync(this.placeholderPath)) {
        return { imageUrl: `/generated-images/words/placeholder.png` };
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      this.logger.error(`Failed to check/return placeholder: ${errorMessage}`);
    }

    // Fallback to a path that will be handled by the error middleware in main.ts
    return { imageUrl: `/generated-images/words/placeholder.png` };
  }
}
