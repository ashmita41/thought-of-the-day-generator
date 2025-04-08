import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Quote } from '@prisma/client';
import axios from 'axios';
import { Cron } from '@nestjs/schedule';

interface QuoteSource {
  name: string;
  url: string;
  transform: (data: any) => { text: string; author: string };
}

// Seed quotes in case API fails
const SEED_QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", source: "seed" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon", source: "seed" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", source: "seed" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill", source: "seed" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker", source: "seed" }
];

@Injectable()
export class QuotesService implements OnModuleInit {
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
    private prisma: PrismaService
  ) {}

  async onModuleInit() {
    try {
      // Check if there are any quotes in the database
      const count = await this.prisma.quote.count();
      
      if (count === 0) {
        this.logger.log('No quotes found in database. Seeding initial quotes...');
        // Seed the database with initial quotes
        await this.seedInitialQuotes();
      } else {
        this.logger.log(`Found ${count} quotes in database.`);
      }
      
      // Fetch new quotes during initialization regardless of existing quote count
      await this.fetchNewQuotes(10);
      
      // Ensure we have enough quotes to avoid repetition
      const minQuotesNeeded = 30; // Ensure at least 30 quotes for a month of no repetition
      if (count < minQuotesNeeded) {
        this.logger.log(`Need more quotes to avoid repetition. Fetching additional quotes...`);
        await this.fetchNewQuotes(minQuotesNeeded - count);
      }
    } catch (error) {
      this.logger.error('Error during module initialization:', error);
    }
  }

  @Cron('0 0 * * *') // Run daily at midnight
  async fetchQuotesDaily() {
    this.logger.log('Running scheduled quote fetch');
    await this.fetchNewQuotes(5);
  }

  async seedInitialQuotes() {
    try {
      this.logger.log('Seeding database with initial quotes...');
      
      for (const quote of SEED_QUOTES) {
        try {
          await this.prisma.quote.create({
            data: {
              text: quote.text,
              author: quote.author,
              source: quote.source
            }
          });
        } catch (error) {
          if (error.code === 'P2002') {
            this.logger.log(`Seed quote already exists: ${quote.text}`);
          } else {
            this.logger.error(`Error seeding quote: ${error.message}`);
          }
        }
      }
      
      this.logger.log('Initial quotes seeded successfully.');
    } catch (error) {
      this.logger.error('Failed to seed initial quotes', error);
    }
  }

  async fetchNewQuotes(limit = 5): Promise<Quote[]> {
    const allFetchedQuotes: Quote[] = [];
    this.logger.log(`Fetching ${limit} new quotes from each source...`);

    for (const source of this.quoteSources) {
      try {
        this.logger.log(`Fetching quotes from ${source.name}...`);
        const quotes = await this.fetchQuotesFromSource(source, limit);
        this.logger.log(`Fetched ${quotes.length} quotes from ${source.name}`);
        
        if (quotes.length > 0) {
          const savedQuotes = await this.saveQuotes(quotes, source.name);
          allFetchedQuotes.push(...savedQuotes);
        } else {
          this.logger.warn(`No new quotes retrieved from ${source.name}`);
        }
      } catch (error) {
        this.logger.error(`Failed to fetch quotes from ${source.name}:`, error);
      }
    }

    this.logger.log(`Total new quotes fetched and saved: ${allFetchedQuotes.length}`);
    return allFetchedQuotes;
  }

  private async fetchQuotesFromSource(source: QuoteSource, limit: number): Promise<Partial<Quote>[]> {
    const quotes: Partial<Quote>[] = [];

    for (let i = 0; i < limit; i++) {
      try {
        this.logger.debug(`Fetching quote ${i+1}/${limit} from ${source.name}`);
        
        const response = await axios.get(source.url, { 
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'ThoughtOfTheDay/1.0'
          }
        });
        
        if (!response.data) {
          this.logger.warn(`Empty response from ${source.name}`);
          continue;
        }
        
        const transformedQuote = source.transform(response.data);
        
        if (!transformedQuote?.text || !transformedQuote?.author) {
          this.logger.warn(`Invalid quote data from ${source.name}:`, transformedQuote);
          continue;
        }

        // Check if quote already exists
        const existingQuote = await this.prisma.quote.findFirst({
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
            lastUsedAt: null,
            usageCount: 0
          });
          
          this.logger.debug(`Added new quote to queue: "${transformedQuote.text.substring(0, 30)}..." by ${transformedQuote.author}`);
        } else {
          this.logger.debug(`Quote already exists: "${transformedQuote.text.substring(0, 30)}..." by ${transformedQuote.author}`);
        }
        
        // Add a small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        this.logger.error(`Error fetching quote from ${source.name}:`, error);
        if (axios.isAxiosError(error)) {
          if (error.response) {
            this.logger.error(`Response status: ${error.response.status}, data:`, error.response.data);
          } else if (error.request) {
            this.logger.error('No response received');
          }
        }
        break; // Stop trying if there's an error to avoid excessive API calls
      }
    }

    return quotes;
  }

  private async saveQuotes(quotes: Partial<Quote>[], sourceName: string): Promise<Quote[]> {
    try {
      const savedQuotes: Quote[] = [];
      
      for (const quote of quotes) {
        try {
          if (!quote.text || !quote.author) {
            this.logger.warn('Incomplete quote data, skipping...');
            continue;
          }
          
          const savedQuote = await this.prisma.quote.create({
            data: {
              text: quote.text,
              author: quote.author,
              source: quote.source || sourceName,
              lastUsedAt: quote.lastUsedAt,
              usageCount: quote.usageCount || 0
            },
          });
          
          this.logger.debug(`Saved quote: "${savedQuote.text.substring(0, 30)}..." by ${savedQuote.author}`);
          savedQuotes.push(savedQuote);
        } catch (error) {
          if (error.code === 'P2002') {
            this.logger.debug(`Quote already exists: "${quote.text?.substring(0, 30)}..." by ${quote.author}`);
          } else {
            this.logger.error(`Error saving quote:`, error);
          }
        }
      }
      
      this.logger.log(`Saved ${savedQuotes.length} quotes from ${sourceName}`);
      return savedQuotes;
    } catch (error) {
      this.logger.error(`Failed to save quotes from ${sourceName}:`, error);
      return [];
    }
  }

  async getRandomQuote(): Promise<Quote | null> {
    try {
      // Check if any quotes exist
      const quotesCount = await this.prisma.quote.count();
      
      if (quotesCount === 0) {
        this.logger.warn('No quotes found in database. Seeding initial quotes...');
        await this.seedInitialQuotes();
        // Try again after seeding
        return this.getRandomQuote();
      }
      
      // Define the "cooldown period" - one month (30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // First try: Get a quote that hasn't been used in the last 30 days
      const freshQuotes = await this.prisma.quote.findMany({
        where: {
          OR: [
            { lastUsedAt: null },
            { lastUsedAt: { lt: thirtyDaysAgo } }
          ]
        },
        orderBy: [
          { lastUsedAt: 'asc' }, // Prioritize quotes never used or used longest ago
          { usageCount: 'asc' }  // Then prioritize least used quotes
        ],
        take: 20, // Get a batch of eligible quotes
      });
      
      let quote: Quote | null = null;
      
      if (freshQuotes.length > 0) {
        // Select a random quote from eligible quotes
        const randomIndex = Math.floor(Math.random() * freshQuotes.length);
        quote = freshQuotes[randomIndex];
        this.logger.log(`Found quote that hasn't been used in the last 30 days: ${quote.text.substring(0, 30)}...`);
      } else {
        // Fallback: If all quotes have been used in the last 30 days
        // Get the least recently used quotes
        this.logger.warn('All quotes have been used within the last 30 days, selecting least recently used');
        const leastRecentlyUsedQuotes = await this.prisma.quote.findMany({
          orderBy: [
            { lastUsedAt: 'asc' },
            { usageCount: 'asc' }
          ],
          take: 5,
        });
        
        if (leastRecentlyUsedQuotes.length > 0) {
          const randomIndex = Math.floor(Math.random() * leastRecentlyUsedQuotes.length);
          quote = leastRecentlyUsedQuotes[randomIndex];
        } else {
          // Last resort - get any random quote
          this.logger.warn('Fallback to any random quote');
          const skip = Math.floor(Math.random() * quotesCount);
          quote = await this.prisma.quote.findFirst({
            skip: skip,
            take: 1,
          });
        }
      }
      
      if (quote) {
        // Update last used timestamp
        await this.prisma.quote.update({
          where: { id: quote.id },
          data: { 
            lastUsedAt: new Date(),
            usageCount: { increment: 1 }
          },
        });
        
        return quote;
      } else {
        this.logger.error('Failed to get random quote despite having quotes in database');
        return null;
      }
    } catch (error) {
      this.logger.error(`Failed to retrieve random quote:`, error);
      return null;
    }
  }

  async getQuoteByType(type?: string): Promise<Quote | null> {
    if (!type) {
      return this.getRandomQuote();
    }
    
    try {
      // Define the "cooldown period" - one month (30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // First try: Get a quote in the specified category that hasn't been used in the last 30 days
      const freshCategoryQuotes = await this.prisma.quote.findMany({
        where: {
          category: type,
          OR: [
            { lastUsedAt: null },
            { lastUsedAt: { lt: thirtyDaysAgo } }
          ]
        },
        orderBy: [
          { lastUsedAt: 'asc' },
          { usageCount: 'asc' }
        ],
      });
      
      let quote: Quote | null = null;
      
      if (freshCategoryQuotes.length > 0) {
        // Select a random quote from eligible quotes
        const randomIndex = Math.floor(Math.random() * freshCategoryQuotes.length);
        quote = freshCategoryQuotes[randomIndex];
      } else {
        // Try to get any quote in the category
        const anyCategoryQuotes = await this.prisma.quote.findMany({
          where: {
            category: type
          },
          orderBy: [
            { lastUsedAt: 'asc' },
            { usageCount: 'asc' }
          ],
        });
        
        if (anyCategoryQuotes.length > 0) {
          const randomIndex = Math.floor(Math.random() * anyCategoryQuotes.length);
          quote = anyCategoryQuotes[randomIndex];
        } else {
          // If no quotes found in that category, fall back to any random quote
          this.logger.warn(`No quotes found with category: ${type}, falling back to random quote`);
          return this.getRandomQuote();
        }
      }
      
      if (quote) {
        // Update last used timestamp
        await this.prisma.quote.update({
          where: { id: quote.id },
          data: { 
            lastUsedAt: new Date(),
            usageCount: { increment: 1 }
          },
        });
        
        return quote;
      } else {
        return this.getRandomQuote();
      }
    } catch (error) {
      this.logger.error(`Failed to retrieve quote by type:`, error);
      return this.getRandomQuote(); // Fallback to random quote
    }
  }

  async addQuoteCategory(quoteId: string, category: string): Promise<Quote | null> {
    try {
      const quote = await this.prisma.quote.findUnique({
        where: { id: quoteId }
      });
      
      if (!quote) {
        this.logger.error(`Quote with ID ${quoteId} not found`);
        return null;
      }

      // Update category
      const updatedQuote = await this.prisma.quote.update({
        where: { id: quoteId },
        data: { category: category }
      });
      
      this.logger.log(`Added category ${category} to quote ID ${quoteId}`);
      return updatedQuote;
    } catch (error) {
      this.logger.error(`Failed to add category to quote ID ${quoteId}:`, error);
      return null;
    }
  }

  // Debug method to get recently used quotes
  async getRecentlyUsedQuotes(): Promise<Quote[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentlyUsed = await this.prisma.quote.findMany({
        where: {
          lastUsedAt: { gte: thirtyDaysAgo }
        },
        orderBy: {
          lastUsedAt: 'desc'
        }
      });
      
      return recentlyUsed;
    } catch (error) {
      this.logger.error(`Error retrieving recently used quotes:`, error);
      return [];
    }
  }

  // Debug method to show all quotes
  async debugShowAllQuotes(): Promise<Quote[]> {
    try {
      const quotes = await this.prisma.quote.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
      this.logger.log(`Total Quotes in Database: ${quotes.length}`);
      
      if (quotes.length === 0) {
        this.logger.warn('No quotes found in database');
      }
      
      return quotes;
    } catch (error) {
      this.logger.error(`Error retrieving quotes:`, error);
      throw error;
    }
  }
}