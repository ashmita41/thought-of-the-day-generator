import { 
    Controller, 
    Get, 
    Post, 
    Param, 
    ParseIntPipe,
    UseInterceptors, 
    ClassSerializerInterceptor 
  } from '@nestjs/common';
  import { QuotesService } from './quotes.service';
  import { Quote } from './entities/quote.entity';
  
  @Controller('quotes')
  @UseInterceptors(ClassSerializerInterceptor)
  export class QuotesController {
    constructor(private readonly quotesService: QuotesService) {}
  
    @Get('random')
    async getRandomQuote(): Promise<Quote> {
      return this.quotesService.getRandomQuote();
    }
  
    @Get()
    async getAllQuotes(): Promise<Quote[]> {
      return this.quotesService.getAllQuotes();
    }
  
    @Get(':id')
    async getQuoteById(@Param('id', ParseIntPipe) id: number): Promise<Quote> {
      return this.quotesService.getQuoteById(id);
    }
  
    @Post('fetch')
    async fetchAndStoreQuote(): Promise<Quote> {
      return this.quotesService.fetchQuoteFromAPI();
    }
  }