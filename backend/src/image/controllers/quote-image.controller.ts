import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QuotesService } from '../../quotes/quotes.service';
import { QuoteImageService } from '../services/quote-image.service';
import { DesignService } from '../../design/services/design.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('image')
export class QuoteImageController {
  private readonly logger = new Logger(QuoteImageController.name);

  constructor(
    private readonly quotesService: QuotesService,
    private readonly quoteImageService: QuoteImageService,
    private readonly designService: DesignService,
  ) {}

  @Get('quote-image')
  async generateQuoteImage(
    @Query('day') day?: string,
    @Query('mode') mode: 'fixed' | 'random' = 'random',
  ) {
    try {
      // First check if we have a placeholder image
      const placeholderPath = path.join(
        process.cwd(),
        'generated-images',
        'thoughts',
        'placeholder.png',
      );

      // Determine design based on query parameters
      const design =
        mode === 'fixed' && day
          ? this.designService.findByDay(day)
          : this.designService.getRandomDesign();

      // Fetch a random quote
      const quote = await this.quotesService.getRandomQuote();

      // If quote is null, provide a default quote
      if (!quote) {
        this.logger.warn('No quote found in database. Using default quote.');

        if (fs.existsSync(placeholderPath)) {
          return { imageUrl: `/generated-images/thoughts/placeholder.png` };
        }

        try {
          const imageUrl = await this.quoteImageService.generateQuoteImage({
            quote: 'No quote available',
            author: 'Unknown',
            title: 'Thought of the Day',
            design: {
              ...design,
              typography: {
                ...design.typography,
                title: {
                  ...design.typography.title,
                  fontSize: 48,
                  weight: 'bold',
                },
                quote: {
                  ...design.typography.quote,
                  fontSize: 36,
                },
              },
            },
          });
          this.logger.log(
            `Successfully generated default quote image: ${imageUrl}`,
          );
          return { imageUrl };
        } catch (defaultError) {
          this.logger.error(
            `Failed to generate default quote image: ${defaultError.message}`,
            defaultError.stack,
          );

          // Return a placeholder if available
          if (fs.existsSync(placeholderPath)) {
            return { imageUrl: `/generated-images/thoughts/placeholder.png` };
          }

          throw new HttpException(
            'Failed to generate default image',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

      // Generate image with the quote
      this.logger.log(`Generating image for quote by: ${quote.author}`);
      try {
        const imageUrl = await this.quoteImageService.generateQuoteImage({
          quote: quote.text,
          author: quote.author,
          title: 'Thought of the Day',
          design: {
            ...design,
            typography: {
              ...design.typography,
              title: {
                ...design.typography.title,
                fontSize: 48,
                weight: 'bold',
              },
              quote: {
                ...design.typography.quote,
                fontSize: 36,
              },
            },
          },
        });
        this.logger.log(`Successfully generated quote image: ${imageUrl}`);
        return { imageUrl };
      } catch (imageError) {
        this.logger.error(
          `Failed to generate quote image: ${imageError.message}`,
          imageError.stack,
        );

        // Return a placeholder if available
        if (fs.existsSync(placeholderPath)) {
          return { imageUrl: `/generated-images/thoughts/placeholder.png` };
        }

        throw new HttpException(
          'Failed to generate image',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error in generateQuoteImage: ${error.message}`,
        error.stack,
      );

      // Try to return a placeholder image as a last resort
      try {
        const placeholderPath = path.join(
          process.cwd(),
          'generated-images',
          'thoughts',
          'placeholder.png',
        );

        if (fs.existsSync(placeholderPath)) {
          return { imageUrl: `/generated-images/thoughts/placeholder.png` };
        }
      } catch (e) {
        this.logger.error(`Failed to check/return placeholder: ${e.message}`);
      }

      // Return a fixed URL that will be handled by the error middleware in main.ts
      return { imageUrl: `/generated-images/thoughts/placeholder.png` };
    }
  }
}
