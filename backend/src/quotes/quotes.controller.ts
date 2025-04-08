import { Controller, Get, Post, NotFoundException, Query, HttpCode } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { Quote } from '@prisma/client';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get('random')
  async getRandomQuote(): Promise<Quote> {
    const quote = await this.quotesService.getRandomQuote();
    if (!quote) {
      throw new NotFoundException('No quotes available');
    }
    return quote;
  }

  @Get('debug')
  async debugQuotes(): Promise<Quote[]> {
    return this.quotesService.debugShowAllQuotes();
  }
  
  @Get('recently-used')
  async getRecentlyUsedQuotes(): Promise<Quote[]> {
    return this.quotesService.getRecentlyUsedQuotes();
  }
  
  @Post('fetch-new')
  @HttpCode(200)
  async fetchNewQuotes(@Query('limit') limit = '5'): Promise<{ success: boolean; count: number }> {
    const parsedLimit = parseInt(limit, 10);
    const validLimit = isNaN(parsedLimit) ? 5 : Math.min(Math.max(parsedLimit, 1), 10);
    
    const newQuotes = await this.quotesService.fetchNewQuotes(validLimit);
    return { 
      success: true, 
      count: newQuotes.length 
    };
  }
  
  @Get('by-category')
  async getQuoteByCategory(@Query('category') category: string): Promise<Quote> {
    const quote = await this.quotesService.getQuoteByType(category);
    if (!quote) {
      throw new NotFoundException('No quotes available for this category');
    }
    return quote;
  }
}