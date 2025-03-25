import { Injectable } from '@nestjs/common';
import { QuotesService } from './quotes/quotes.service';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(private readonly quotesService: QuotesService) {}

  async getThoughtOfTheDay() {
    try {
      // Fetch a random quote for the day
      const quote = await lastValueFrom(this.quotesService.findRandom());
      return {
        text: quote.text,
        author: quote.author,
        date: new Date().toISOString()
      };
    } catch (error) {
      // Fallback quote if something goes wrong
      return {
        text: 'Creativity is intelligence having fun.',
        author: 'Albert Einstein',
        date: new Date().toISOString()
      };
    }
  }

  // Keeping the original method for compatibility
  getHello(): string {
    return 'Welcome to Thought of the Day Generator!';
  }
}