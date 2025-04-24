import { Controller, Get, Logger, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { WordsService } from './words.service';
import { Word } from './types/word.types';

/**
 * Controller for managing words used in the Word of the Day feature
 * Provides endpoints for retrieving and refreshing the words database
 */
@Controller('words')
export class WordsController {
  private readonly logger = new Logger(WordsController.name);

  constructor(private readonly wordsService: WordsService) {}

  /**
   * GET /words
   * Returns a random word from the database
   */
  @Get()
  async getRandomWord(): Promise<{ word: Word | null }> {
    try {
      this.logger.log('Getting random word for Word of the Day');
      const word = await this.wordsService.getRandomWord();
      return { word };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting random word: ${errorMessage}`);
      throw new HttpException(
        'Failed to retrieve random word',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * GET /words/all
   * Returns all words from the database
   */
  @Get('all')
  async getAllWords(): Promise<{ words: Word[] }> {
    try {
      this.logger.log('Getting all words');
      const words = await this.wordsService.getAllWords();
      return { words };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting all words: ${errorMessage}`);
      throw new HttpException(
        'Failed to retrieve words',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * GET /words/refresh
   * Refreshes the word database by fetching new words
   */
  @Get('refresh')
  async refreshWords(): Promise<{ count: number }> {
    try {
      this.logger.log('Refreshing word database with new words');
      const words = await this.wordsService.fetchNewWords(5);
      return { count: words.length };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error refreshing words: ${errorMessage}`);
      throw new HttpException(
        'Failed to refresh words',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
