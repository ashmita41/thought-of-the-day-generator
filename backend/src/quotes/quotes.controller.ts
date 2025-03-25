import { Controller, Get, Param, Post, Body, Delete } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { Quote } from './entities/quote.entity';
import { Observable } from 'rxjs';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  findAll(): Observable<Quote[]> {
    return this.quotesService.findAll();
  }

  @Get('random')
  findRandom(): Observable<Quote> {
    return this.quotesService.findRandom();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Observable<Quote> {
    return this.quotesService.findOne(id);
  }

  @Post()
  create(@Body() quote: Quote): Observable<Quote> {
    return this.quotesService.create(quote);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Observable<void> {
    return this.quotesService.remove(id);
  }
}