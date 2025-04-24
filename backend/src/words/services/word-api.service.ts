import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, timeout, catchError } from 'rxjs';
import { AxiosError } from 'axios';
import { of } from 'rxjs';

/**
 * Service for retrieving random words from external APIs
 * Used as a data source for the Word of the Day feature
 */
@Injectable()
export class WordApiService {
  private readonly logger = new Logger(WordApiService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Fetches a random word from an external API
   * @returns A random word string or null if the request fails
   */
  async getRandomWord(): Promise<string | null> {
    try {
      // Try random word API from Heroku
      const response = await lastValueFrom(
        this.httpService.get(
          'https://random-word-api.herokuapp.com/word?number=1',
        ).pipe(
          timeout(5000), // 5 second timeout
          catchError((error) => {
            this.logger.warn(`Heroku API error: ${error.message}`);
            return of({ data: null });
          })
        ),
      );

      if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const word = response.data[0];
        this.logger.log(`Successfully retrieved random word: ${word}`);
        return word;
      }

      this.logger.warn('API returned invalid data format');
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error fetching random word: ${errorMessage}`);
      return null;
    }
  }
}
