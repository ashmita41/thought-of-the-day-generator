import { Controller, Get } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { Quote } from './entities/quote.entity';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  // Existing methods...

  @Get('debug')
  async debugQuotes(): Promise<Quote[]> {
    return this.quotesService.debugShowAllQuotes();
  }
}