import { Controller, Get, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { WordService } from '../services/word.service';

// Define a response interface
interface WordOfTheDayResponse {
  word: string;
  phonetic: string | null;
  partOfSpeech: string | null;
  definition: string;
  example: string | null;
  synonyms: string[];
}

/**
 * Controller for handling Word of the Day API endpoints
 */
@Controller('word')
export class WordController {
  private readonly logger = new Logger(WordController.name);

  constructor(private readonly wordService: WordService) {}

  /**
   * GET /word/of-the-day
   * Returns the word of the day with its details
   */
  @Get('of-the-day')
  async getWordOfTheDay(): Promise<WordOfTheDayResponse> {
    try {
      this.logger.log('Request received for word of the day');
      const wordData = await this.wordService.getWordOfTheDay();
      return wordData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting word of the day: ${errorMessage}`);
      throw new HttpException(
        'Failed to retrieve word of the day',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
