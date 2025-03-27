import { Injectable, OnModuleInit } from '@nestjs/common';
import { QuotesService } from './quotes/quotes.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly quotesService: QuotesService) {}

  async onModuleInit() {
    // Automatically fetch quotes when the application starts
    await this.quotesService.fetchNewQuotes();
  }

  getHello(): string {
    return 'Welcome to Thought of the Day Generator!';
  }
}