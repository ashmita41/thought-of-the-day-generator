import { Injectable, Logger } from '@nestjs/common';
import { WordService } from './word.service';
import { WordImageGenerationOptions } from '../../image/interfaces/word-image-generation.interface';

/**
 * Service responsible for connecting word data with image generation
 * Acts as a bridge between the WordService and WordImageService
 */
@Injectable()
export class WordImageConnectorService {
  private readonly logger = new Logger(WordImageConnectorService.name);

  constructor(private readonly wordService: WordService) {}

  /**
   * Retrieves word data and prepares it for image generation
   * Adds design configuration and ensures all required fields are present
   * @returns WordImageGenerationOptions object with complete data for image generation
   */
  async getWordImageData(): Promise<WordImageGenerationOptions> {
    try {
      this.logger.log('Getting word data from WordService...');
      const wordData = await this.wordService.getWordOfTheDay();
      this.logger.log(`Successfully retrieved word data for: ${wordData.word}`);

      // Ensure all required fields are present
      const result: WordImageGenerationOptions = {
        word: wordData.word,
        phonetic: wordData.phonetic || '',
        definition: wordData.definition || `The meaning of ${wordData.word}`,
        example: wordData.example || `Example of using ${wordData.word}`,
        partOfSpeech: wordData.partOfSpeech || 'noun',
        design: {
          designId: this.getCurrentDayDesignId(),
          mode: 'random' as const,
          background: {
            type: 'gradient' as const,
            color: '#f5f5f5',
          },
          layout: {
            type: 'centered' as const,
            margins: {
              top: 50,
              bottom: 50,
              left: 50,
              right: 50,
            },
          },
          typography: {
            title: {
              fontFamily: 'Arial',
              fontSize: 48,
              color: '#000000',
              weight: 'bold',
              alignment: 'center' as const,
            },
            quote: {
              fontFamily: 'Georgia',
              fontSize: 36,
              color: '#333333',
              weight: 'normal',
              alignment: 'center' as const,
            },
            author: {
              fontFamily: 'Arial',
              fontSize: 24,
              color: '#555555',
              weight: 'normal',
              alignment: 'center' as const,
            },
          },
        },
      };

      this.logger.log('Word data prepared successfully with design');
      return result;
    } catch (error) {
      // Convert unknown error to an Error object with type checking
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred';
      
      const errorStack = error instanceof Error 
        ? error.stack 
        : new Error().stack;
        
      this.logger.error(
        `Failed to get word image data: ${errorMessage}`,
        errorStack,
      );
      
      // Re-throw the error with a clearer message
      const enhancedError = new Error(
        `Failed to retrieve word data: ${errorMessage}`,
      );
      
      if (error instanceof Error && error.stack) {
        enhancedError.stack = error.stack;
      }
      
      throw enhancedError;
    }
  }

  /**
   * Determines the design ID based on the current day of the week
   * @returns A string representing the design ID for today
   */
  private getCurrentDayDesignId(): string {
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const dayIndex = new Date().getDay();
    return `word-${days[dayIndex]}-design`;
  }
}
