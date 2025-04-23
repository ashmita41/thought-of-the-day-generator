import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { QuotesService } from './quotes/quotes.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly quotesService: QuotesService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('thought-of-the-day')
  async getThoughtOfTheDay() {
    return this.quotesService.getRandomQuote();
  }

  @Get('test')
  testEndpoint() {
    return {
      message: 'Backend is working!',
      timestamp: new Date().toISOString(),
    };
  }
}
