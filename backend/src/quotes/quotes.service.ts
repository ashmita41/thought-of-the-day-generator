import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { Quote } from './entities/quote.entity';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

interface QuotableResponse {
  _id: string;
  content: string;
  author: string;
  tags?: string[];
}

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);
  private readonly QUOTABLE_API = 'https://api.quotable.io/random';

  constructor(
    @InjectRepository(Quote)
    private quoteRepository: Repository<Quote>,
    private httpService: HttpService
  ) {}

  async fetchQuoteFromAPI(): Promise<Quote> {
    try {
      const response: AxiosResponse<QuotableResponse> = await lastValueFrom(
        this.httpService.get(this.QUOTABLE_API)
      );

      const quoteData = response.data;
      const quote = new Quote();
      quote.text = quoteData.content;
      quote.author = quoteData.author;
      quote.uniqueIdentifier = quoteData._id;
      quote.category = quoteData.tags?.[0] || 'general';

      return this.quoteRepository.save(quote);
    } catch (error) {
      this.logger.error('Failed to fetch quote from API', error);
      throw new NotFoundException('Could not fetch quote from Quotable API');
    }
  }

  async getRandomQuote(): Promise<Quote> {
    const quote = await this.quoteRepository.createQueryBuilder('quote')
      .orderBy('RANDOM()')
      .getOne();

    if (!quote) {
      // If no quotes in database, fetch from API
      return this.fetchQuoteFromAPI();
    }

    return quote;
  }

  async getAllQuotes(): Promise<Quote[]> {
    return this.quoteRepository.find();
  }

  async getQuoteById(id: number): Promise<Quote> {
    const quote = await this.quoteRepository.findOne({ where: { id } });
    if (!quote) {
      throw new NotFoundException(`Quote with ID ${id} not found`);
    }
    return quote;
  }
}