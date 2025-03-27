import { Injectable, Logger } from '@nestjs/common';
import { createCanvas, loadImage, registerFont } from 'canvas';
import { ImageGenerationOptions } from '../interfaces/image-generation.interface';
import { IMAGE_CONFIG } from '../config/image-config';
import { TextUtilsService } from './text-utils.service';
import { ImageStorage } from '../utils/image-storage';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);
  constructor(private textUtilsService: TextUtilsService) {}
  
  async generateQuoteImage(
    options: ImageGenerationOptions
  ): Promise<string> {
    try {
      const { quote, author, design } = options;
      
      // Create canvas with Instagram square post size
      const canvas = createCanvas(IMAGE_CONFIG.WIDTH, IMAGE_CONFIG.HEIGHT);
      const ctx = canvas.getContext('2d');
      
      // Apply background
      ctx.fillStyle = design.background.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set title text style (Thought of the Day)
      ctx.font = `bold 72px ${design.typography.title.fontFamily || 'Arial'}`;
      ctx.fillStyle = design.typography.title.color || '#000000';
      const titleText = 'Thought of the Day';
      const titleWidth = ctx.measureText(titleText).width;
      
      // Set quote text style with increased size
      ctx.font = `${design.typography.quote.weight || 'normal'} 54px ${design.typography.quote.fontFamily || 'Arial'}`;
      
      // Calculate max width for text
      const maxTextWidth = canvas.width - (IMAGE_CONFIG.MARGINS.HORIZONTAL * 2);
      
      // Wrap text
      const wrappedQuote = this.textUtilsService.wrapText(
        ctx, 
        quote, 
        maxTextWidth, 
        54 // Increased font size
      );
      
      // Calculate total height of text elements
      const titleHeight = 72;
      const quoteLineHeight = 60;
      const authorHeight = 36;
      const titleToQuoteGap = 70; // Increased gap between title and quote
      const totalTextHeight = titleHeight + 
                               titleToQuoteGap +
                               (wrappedQuote.length * quoteLineHeight) + 
                               authorHeight + 
                               100; // Additional spacing
      
      // Calculate starting Y position to center everything
      const startY = (canvas.height - totalTextHeight) / 2;
      
      // Render title
      ctx.font = `bold 72px ${design.typography.title.fontFamily || 'Arial'}`;
      ctx.fillStyle = design.typography.title.color || '#000000';
      ctx.fillText(
        titleText, 
        (canvas.width - titleWidth) / 2, 
        startY
      );
      
      // Render quote text
      ctx.font = `${design.typography.quote.weight || 'normal'} 54px ${design.typography.quote.fontFamily || 'Arial'}`;
      ctx.fillStyle = design.typography.quote.color || '#000000';
      wrappedQuote.forEach((line, index) => {
        const lineWidth = ctx.measureText(line).width;
        ctx.fillText(
          line, 
          (canvas.width - lineWidth) / 2, 
          startY + titleHeight + titleToQuoteGap + (index * quoteLineHeight)
        );
      });
      
      // Render author with slightly smaller font
      ctx.font = `${design.typography.author.weight || 'italic'} 36px ${design.typography.author.fontFamily || 'Arial'}`;
      ctx.fillStyle = design.typography.author.color || '#555555';
      
      const authorText = `- ${author}`;
      const authorWidth = ctx.measureText(authorText).width;
      ctx.fillText(
        authorText, 
        (canvas.width - authorWidth) / 2, 
        startY + titleHeight + titleToQuoteGap + (wrappedQuote.length * quoteLineHeight) + 50
      );
      
      // Save and return image path
      const imageUrl = await ImageStorage.saveImage(canvas);
      this.logger.log(`Successfully generated image: ${imageUrl}`);
      return imageUrl;
    } catch (error) {
      this.logger.error('Failed to generate image:', error);
      throw new Error(`Failed to generate image: ${error.message}`);
    }
  }
}