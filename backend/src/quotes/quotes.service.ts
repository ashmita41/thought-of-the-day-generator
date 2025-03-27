import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quote } from './entities/quote.entity';
import axios from 'axios';

interface QuoteSource {
  name: string;
  url: string;
  transform: (data: any) => { text: string; author: string };
}

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);
  private quoteSources: QuoteSource[] = [
    {
      name: 'quotable',
      url: 'https://api.quotable.io/random',
      transform: (data) => ({
        text: data.content,
        author: data.author
      })
    },
    {
      name: 'zen-quotes',
      url: 'https://zenquotes.io/api/random',
      transform: (data) => ({
        text: data[0].q,
        author: data[0].a
      })
    }
  ];

  constructor(
    @InjectRepository(Quote)
    private quoteRepository: Repository<Quote>
  ) {}

  async fetchNewQuotes(limit = 10): Promise<Quote[]> {
    const allFetchedQuotes: Quote[] = [];

    for (const source of this.quoteSources) {
      try {
        const quotes = await this.fetchQuotesFromSource(source, limit);
        const savedQuotes = await this.saveQuotes(quotes, source.name);
        allFetchedQuotes.push(...savedQuotes);
      } catch (error) {
        this.logger.error(`Failed to fetch quotes from ${source.name}`, error);
      }
    }

    return allFetchedQuotes;
  }

  private async fetchQuotesFromSource(source: QuoteSource, limit: number): Promise<Partial<Quote>[]> {
    const quotes: Partial<Quote>[] = [];

    for (let i = 0; i < limit; i++) {
      try {
        const response = await axios.get(source.url);
        const transformedQuote = source.transform(response.data);

        // Check if quote already exists
        const existingQuote = await this.quoteRepository.findOne({
          where: {
            text: transformedQuote.text,
            author: transformedQuote.author
          }
        });

        if (!existingQuote) {
          quotes.push({
            text: transformedQuote.text,
            author: transformedQuote.author,
            source: source.name,
            lastUsedAt: null
          });
        }
      } catch (error) {
        this.logger.error(`Error fetching quote from ${source.name}`, error);
      }
    }

    return quotes;
  }

  private async saveQuotes(quotes: Partial<Quote>[], sourceName: string): Promise<Quote[]> {
    try {
      const savedQuotes = await this.quoteRepository.save(quotes as Quote[]);
      this.logger.log(`Saved ${savedQuotes.length} quotes from ${sourceName}`);
      return savedQuotes;
    } catch (error) {
      this.logger.error(`Failed to save quotes from ${sourceName}`, error);
      return [];
    }
  }

  async getRandomQuote(): Promise<Quote | null> {
    try {
      // Find a quote that hasn't been used recently
      const quote = await this.quoteRepository
        .createQueryBuilder('quote')
        .orderBy('RANDOM()')
        .getOne();

      if (quote) {
        // Update last used timestamp
        quote.lastUsedAt = new Date();
        await this.quoteRepository.save(quote);
      }

      return quote;
    } catch (error) {
      this.logger.error('Failed to retrieve random quote', error);
      return null;
    }
  }

  async getQuoteByType(type?: string): Promise<Quote | null> {
    // For now, it will behave like getRandomQuote()
    return this.getRandomQuote();
  }

  async addQuoteCategory(quoteId: string, category: string): Promise<Quote | null> {
    try {
      const quote = await this.quoteRepository.findOne({ where: { id: quoteId } });
      
      if (!quote) {
        this.logger.error(`Quote with ID ${quoteId} not found`);
        return null;
      }

      // Update category
      quote.category = category;
      
      const updatedQuote = await this.quoteRepository.save(quote);
      this.logger.log(`Added category ${category} to quote ID ${quoteId}`);
      
      return updatedQuote;
    } catch (error) {
      this.logger.error(`Failed to add category to quote ID ${quoteId}`, error);
      return null;
    }
  }

  // Debug method to show all quotes
  async debugShowAllQuotes(): Promise<Quote[]> {
    const quotes = await this.quoteRepository.find();
    this.logger.log(`Total Quotes in Database: ${quotes.length}`);
    quotes.forEach(quote => {
      this.logger.log(`Quote: ${quote.text} by ${quote.author} (Source: ${quote.source})`);
    });
    return quotes;
  }
}