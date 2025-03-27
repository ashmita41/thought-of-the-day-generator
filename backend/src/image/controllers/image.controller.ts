import { Controller, Get, Query, Render } from '@nestjs/common';
import { QuotesService } from '../../quotes/quotes.service';
import { ImageService } from '../services/image.service';
import { DesignService } from '../../design/services/design.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('image')
export class ImageController {
  constructor(
    private readonly quotesService: QuotesService,
    private readonly imageService: ImageService,
    private readonly designService: DesignService
  ) {}

  @Get('quote-image')
  @Render('quote-image')
  async generateQuoteImage(
    @Query('day') day?: string,
    @Query('mode') mode: 'fixed' | 'random' = 'random'
  ) {
    // Determine design based on query parameters
    const design = mode === 'fixed' && day 
      ? this.designService.findByDay(day)
      : this.designService.getRandomDesign();

    // Fetch a random quote
    const quote = await this.quotesService.getRandomQuote();
    
    // If quote is null, provide a default quote
    if (!quote) {
      return {
        imageUrl: await this.imageService.generateQuoteImage({
          quote: 'No quote available',
          author: 'Unknown',
          title: 'Thought of the Day',
          design: {
            ...design,
            typography: {
              ...design.typography,
              title: {
                ...design.typography.title,
                fontSize: 48, // Larger title
                weight: 'bold'
              },
              quote: {
                ...design.typography.quote,
                fontSize: 36 // Slightly larger quote
              }
            }
          }
        })
      };
    }

    // Generate image with the quote
    return {
      imageUrl: await this.imageService.generateQuoteImage({
        quote: quote.text,
        author: quote.author,
        title: 'Thought of the Day',
        design: {
          ...design,
          typography: {
            ...design.typography,
            title: {
              ...design.typography.title,
              fontSize: 48, // Larger title
              weight: 'bold'
            },
            quote: {
              ...design.typography.quote,
              fontSize: 36 // Slightly larger quote
            }
          }
        }
      })
    };
  }
}