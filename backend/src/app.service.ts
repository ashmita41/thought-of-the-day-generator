import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QuotesService } from './quotes/quotes.service';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly quotesService: QuotesService) {}

  async onModuleInit() {
    this.logger.log('Initializing App Service...');
    // Nothing to do here since QuotesService handles initialization
  }

  getHello(): string {
    return 'Welcome to Thought of the Day Generator!';
  }
}
