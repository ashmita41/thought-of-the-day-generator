import { Injectable } from '@nestjs/common';
import { createCanvas, loadImage } from 'canvas';
import { ImageGenerationOptions } from '../interfaces/image-generation.interface';
import { IMAGE_CONFIG } from '../config/image-config';
import { TextUtilsService } from './text-utils.service';
import { ImageStorage } from '../utils/image-storage';

@Injectable()
export class ImageService {
  constructor(private textUtilsService: TextUtilsService) {}

  async generateQuoteImage(
    options: ImageGenerationOptions
  ): Promise<string> {
    const { quote, author, design } = options;
    
    // Create canvas with Instagram square post size
    const canvas = createCanvas(IMAGE_CONFIG.WIDTH, IMAGE_CONFIG.HEIGHT);
    const ctx = canvas.getContext('2d');

    // Apply background
    ctx.fillStyle = design.background.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set quote text style
    ctx.font = `${design.typography.quote.weight} ${design.typography.quote.fontSize}px ${design.typography.quote.fontFamily}`;
    ctx.fillStyle = design.typography.quote.color;

    // Calculate max width for text
    const maxTextWidth = canvas.width - (IMAGE_CONFIG.MARGINS.HORIZONTAL * 2);

    // Wrap text
    const wrappedQuote = this.textUtilsService.wrapText(
      ctx, 
      quote, 
      maxTextWidth, 
      design.typography.quote.fontSize
    );

    // Calculate vertical positioning
    const quoteStartY = this.textUtilsService.calculateVerticalCenter(
      ctx, 
      wrappedQuote, 
      design.typography.quote.fontSize, 
      canvas.height
    );

    // Render quote text
    wrappedQuote.forEach((line, index) => {
      const lineWidth = ctx.measureText(line).width;
      ctx.fillText(
        line, 
        (canvas.width - lineWidth) / 2, 
        quoteStartY + index * design.typography.quote.fontSize
      );
    });

    // Render author
    ctx.font = `${design.typography.author.weight} ${design.typography.author.fontSize}px ${design.typography.author.fontFamily}`;
    ctx.fillStyle = design.typography.author.color;
    
    const authorWidth = ctx.measureText(author).width;
    ctx.fillText(
      author, 
      (canvas.width - authorWidth) / 2, 
      quoteStartY + (wrappedQuote.length * design.typography.quote.fontSize) + 50
    );

    // Save and return image path
    return ImageStorage.saveImage(canvas);
  }
}