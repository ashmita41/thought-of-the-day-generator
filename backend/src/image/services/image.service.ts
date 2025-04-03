import { Injectable, Logger } from '@nestjs/common';
import { createCanvas, loadImage, registerFont, CanvasRenderingContext2D as NodeCanvasRenderingContext2D } from 'canvas';
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
      
      // Create canvas with square post size
      const canvas = createCanvas(IMAGE_CONFIG.WIDTH, IMAGE_CONFIG.HEIGHT);
      const ctx = canvas.getContext('2d');
      
      // Apply background (handle both solid and gradient)
      if (design.background.type === 'gradient') {
        this.applyGradientBackground(ctx, design.background.color, canvas);
      } else {
        ctx.fillStyle = design.background.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Set title text style
      const titleFontSize = 60; 
      ctx.font = `bold ${titleFontSize}px ${design.typography.title.fontFamily || 'Arial'}`;
      ctx.fillStyle = design.typography.title.color || '#000000';
      const titleText = 'Thought for the Day';
      const titleWidth = ctx.measureText(titleText).width;
      
      // Set quote text style
      const quoteFontSize = 58; // Slightly reduced to have more space
      ctx.font = `${design.typography.quote.weight || 'normal'} ${quoteFontSize}px ${design.typography.quote.fontFamily || 'Arial'}`;
      
      // Calculate max width for text with proper padding
      const maxTextWidth = canvas.width - (IMAGE_CONFIG.MARGINS.HORIZONTAL * 2) - 180; 
      
      // Wrap text
      const wrappedQuote = this.textUtilsService.wrapText(
        ctx, 
        quote, 
        maxTextWidth, 
        quoteFontSize
      );
      
      // Calculate total height of text elements with better spacing
      const titleHeight = titleFontSize;
      const quoteLineHeight = quoteFontSize * 1.2;
      const authorHeight = 40;
      const titleToQuoteGap = 60; 
      const quoteToAuthorGap = 50; 
      
      // Calculate card dimensions with proper padding
      const cardPadding = {
        vertical: 60,  
        horizontal: 50 
      };
      
      const quoteTextHeight = wrappedQuote.length * quoteLineHeight;
      const cardWidth = maxTextWidth + (cardPadding.horizontal * 2);
      const cardHeight = quoteTextHeight + authorHeight + quoteToAuthorGap + (cardPadding.vertical * 2);
      
      // Calculate vertical positions - TITLE HIGHER ABOVE CARD
      const cardY = (canvas.height - cardHeight) / 2 + 20; // Moved card slightly lower
      const titleY = cardY - titleToQuoteGap; // Title above card with gap
      
      // Draw title
      ctx.font = `bold ${titleFontSize}px ${design.typography.title.fontFamily || 'Arial'}`;
      ctx.fillStyle = design.typography.title.color || '#000000';
      
      // Add slight text shadow to title for better contrast
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      ctx.fillText(
        titleText, 
        (canvas.width - titleWidth) / 2, 
        titleY
      );
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Create card background for quote text with design variations based on day
      const cardX = (canvas.width - cardWidth) / 2;
      
      // Draw card with different styles based on design day
      this.drawStylizedCard(ctx, cardX, cardY, cardWidth, cardHeight, design);
      
      // Render quote text - CENTERED WITHIN CARD
      ctx.font = `${design.typography.quote.weight || 'normal'} ${quoteFontSize}px ${design.typography.quote.fontFamily || 'Arial'}`;
      ctx.fillStyle = design.typography.quote.color || '#000000';
      
      // Calculate vertical starting position to center text in card area
      const quoteStartY = cardY + cardPadding.vertical + (quoteFontSize * 0.8);
      
      wrappedQuote.forEach((line, index) => {
        const lineWidth = ctx.measureText(line).width;
        ctx.fillText(
          line, 
          (canvas.width - lineWidth) / 2, 
          quoteStartY + (index * quoteLineHeight)
        );
      });
      
      // Render author with italic style - BETTER POSITIONED
      const authorFontSize = 38; 
      ctx.font = `italic ${authorFontSize}px ${design.typography.author.fontFamily || 'Arial'}`;
      ctx.fillStyle = design.typography.author.color || '#555555';
      
      const authorText = `- ${author}`;
      const authorWidth = ctx.measureText(authorText).width;
      
      // Position author text with proper spacing from quote text and from bottom of card
      const authorY = quoteStartY + (wrappedQuote.length * quoteLineHeight) + quoteToAuthorGap;
      
      ctx.fillText(
        authorText, 
        (canvas.width - authorWidth) / 2, 
        authorY
      );
      
      // Draw decorative elements based on day 
      if (design.designId.includes('monday')) {
        this.addMondayDecoration(ctx, canvas);
      } else if (design.designId.includes('tuesday')) {
        this.addTuesdayDecoration(ctx, canvas);
      } else if (design.designId.includes('wednesday')) {
        this.addWednesdayDecoration(ctx, canvas);
      } else if (design.designId.includes('thursday')) {
        this.addThursdayDecoration(ctx, canvas);
      } else if (design.designId.includes('friday')) {
        this.addFridayDecoration(ctx, canvas);
      } else if (design.designId.includes('saturday')) {
        this.addSaturdayDecoration(ctx, canvas);
      } else if (design.designId.includes('sunday')) {
        this.addSundayDecoration(ctx, canvas);
      } else {
        // Random design - add some universal decorative elements
        this.addRandomDecoration(ctx, canvas);
      }
      
      // Save and return image path
      const imageUrl = await ImageStorage.saveImage(canvas);
      this.logger.log(`Successfully generated image: ${imageUrl}`);
      return imageUrl;
    } catch (error) {
      this.logger.error('Failed to generate image:', error);
      throw new Error(`Failed to generate image: ${error.message}`);
    }
  }

  private applyGradientBackground(ctx: NodeCanvasRenderingContext2D, colorString: string, canvas: any) {
    // Parse the color string to extract gradient colors
    let colors: string[];
    
    try {
      // If color is provided as JSON string with multiple colors
      colors = JSON.parse(colorString);
    } catch (e) {
      // Use default pink/purple gradient
      colors = ['#FF69B4', '#9370DB'];
    }
    
    // Use diagonal gradient for more visual interest
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    
    if (colors.length === 1) {
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, this.adjustColor(colors[0], -30)); // Darker variant
    } else {
      colors.forEach((color, index) => {
        gradient.addColorStop(index / (colors.length - 1), color);
      });
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add subtle texture overlay
    this.addSubtleTexture(ctx, canvas);
  }
  
  private addSubtleTexture(ctx: NodeCanvasRenderingContext2D, canvas: any) {
    // Add subtle noise texture for more visual depth
    ctx.globalAlpha = 0.05;
    
    for (let i = 0; i < canvas.width; i += 4) {
      for (let j = 0; j < canvas.height; j += 4) {
        if (Math.random() > 0.5) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.fillRect(i, j, 2, 2);
        }
      }
    }
    
    ctx.globalAlpha = 1.0;
  }
  
  private adjustColor(hex: string, percent: number): string {
    // Convert hex to RGB
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    // Adjust each component
    r = Math.min(255, Math.max(0, r + percent));
    g = Math.min(255, Math.max(0, g + percent));
    b = Math.min(255, Math.max(0, b + percent));

    // Convert back to hex
    const newHex = '#' + 
      ((1 << 24) + (r << 16) + (g << 8) + b)
        .toString(16)
        .slice(1);
    
    return newHex;
  }
  
  private drawStylizedCard(
    ctx: NodeCanvasRenderingContext2D, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    design: any
  ) {
    // Different card styles based on day
    const designId = design.designId;
    
    // Default style
    let backgroundColor = 'rgba(255, 255, 255, 0.2)';
    let borderRadius = 20;
    let shadowColor = 'rgba(0, 0, 0, 0.3)';
    let shadowBlur = 15;
    let shadowOffsetX = 5;
    let shadowOffsetY = 5;
    let borderColor: string | null = null;
    let borderWidth = 0;
    
    // Day-specific styling
    if (designId.includes('monday')) {
      // Monday: Soft rounded corners with light blue tint
      backgroundColor = 'rgba(255, 255, 255, 0.25)';
      borderRadius = 25;
      shadowColor = 'rgba(0, 0, 40, 0.35)';
      shadowBlur = 20;
    } 
    else if (designId.includes('tuesday')) {
      // Tuesday: More rectangular with orange/red tint
      backgroundColor = 'rgba(255, 255, 255, 0.2)';
      borderRadius = 15;
      shadowColor = 'rgba(50, 0, 0, 0.3)';
      shadowBlur = 18;
      borderColor = 'rgba(255, 255, 255, 0.4)';
      borderWidth = 3;
    }
    else if (designId.includes('wednesday')) {
      // Wednesday: Rounded with green tint
      backgroundColor = 'rgba(255, 255, 255, 0.15)';
      borderRadius = 30;
      shadowColor = 'rgba(0, 30, 0, 0.25)';
      shadowBlur = 25;
    }
    else if (designId.includes('thursday')) {
      // Thursday: Sharp corners with purple tint
      backgroundColor = 'rgba(255, 255, 255, 0.2)';
      borderRadius = 10;
      shadowColor = 'rgba(50, 0, 50, 0.35)';
      shadowOffsetX = 8;
      shadowOffsetY = 8;
      borderColor = 'rgba(255, 255, 255, 0.5)';
      borderWidth = 2;
    }
    else if (designId.includes('friday')) {
      // Friday: Playful shape with golden tint
      backgroundColor = 'rgba(255, 255, 255, 0.25)';
      borderRadius = 35;
      shadowColor = 'rgba(50, 40, 0, 0.3)';
      shadowBlur = 22;
    }
    else if (designId.includes('saturday')) {
      // Saturday: Relaxed shape with teal tint
      backgroundColor = 'rgba(255, 255, 255, 0.2)';
      borderRadius = 28;
      shadowColor = 'rgba(0, 40, 40, 0.25)';
      shadowBlur = 15;
      borderColor = 'rgba(255, 255, 255, 0.3)';
      borderWidth = 4;
    }
    else if (designId.includes('sunday')) {
      // Sunday: Elegant shape with deep purple tint
      backgroundColor = 'rgba(255, 255, 255, 0.15)';
      borderRadius = 20;
      shadowColor = 'rgba(30, 0, 60, 0.3)';
      shadowBlur = 20;
      borderColor = 'rgba(255, 255, 255, 0.2)';
      borderWidth = 3;
    }
    
    // Draw the card with shadow
    ctx.save();
    
    // Add shadow
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetX = shadowOffsetX;
    ctx.shadowOffsetY = shadowOffsetY;
    
    // Draw rounded rect
    ctx.beginPath();
    ctx.moveTo(x + borderRadius, y);
    ctx.lineTo(x + width - borderRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + borderRadius);
    ctx.lineTo(x + width, y + height - borderRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - borderRadius, y + height);
    ctx.lineTo(x + borderRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - borderRadius);
    ctx.lineTo(x, y + borderRadius);
    ctx.quadraticCurveTo(x, y, x + borderRadius, y);
    ctx.closePath();
    
    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fill();
    
    // Add border if specified
    if (borderColor && borderWidth) {
      ctx.shadowColor = 'transparent';
      ctx.lineWidth = borderWidth;
      ctx.strokeStyle = borderColor;
      ctx.stroke();
    }
    
    ctx.restore();
  }
  
  // Day-specific decorative elements
  private addMondayDecoration(ctx: NodeCanvasRenderingContext2D, canvas: any) {
    // Subtle wave pattern on bottom
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#ffffff';
    
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, canvas.height - 40);
      ctx.quadraticCurveTo(i + 25, canvas.height - 80, i + 50, canvas.height - 40);
      ctx.lineTo(i + 50, canvas.height);
      ctx.lineTo(i, canvas.height);
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  private addTuesdayDecoration(ctx: NodeCanvasRenderingContext2D, canvas: any) {
    // Diagonal lines in corners
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    
    // Top left
    for (let i = 0; i < 100; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(i, 0);
      ctx.stroke();
    }
    
    // Bottom right
    for (let i = 0; i < 100; i += 20) {
      ctx.beginPath();
      ctx.moveTo(canvas.width, canvas.height - i);
      ctx.lineTo(canvas.width - i, canvas.height);
      ctx.stroke();
    }
    
    ctx.restore();
  }
  
  private addWednesdayDecoration(ctx: NodeCanvasRenderingContext2D, canvas: any) {
    // Leafy pattern
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#ffffff';
    
    // Draw stylized leaves in corners
    this.drawStylizedLeaf(ctx, 80, 80, 50);
    this.drawStylizedLeaf(ctx, canvas.width - 80, 80, 50);
    this.drawStylizedLeaf(ctx, 80, canvas.height - 80, 50);
    this.drawStylizedLeaf(ctx, canvas.width - 80, canvas.height - 80, 50);
    
    ctx.restore();
  }
  
  private drawStylizedLeaf(ctx: NodeCanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + size, y - size/2, x + size, y + size/2, x, y + size);
    ctx.bezierCurveTo(x - size, y + size/2, x - size, y - size/2, x, y);
    ctx.closePath();
    ctx.fill();
  }
  
  private addThursdayDecoration(ctx: NodeCanvasRenderingContext2D, canvas: any) {
    // Geometric pattern
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    // Draw geometric shapes
    const size = 80;
    ctx.beginPath();
    ctx.rect(40, 40, size, size);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.rect(canvas.width - 40 - size, 40, size, size);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.rect(40, canvas.height - 40 - size, size, size);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.rect(canvas.width - 40 - size, canvas.height - 40 - size, size, size);
    ctx.stroke();
    
    ctx.restore();
  }
  
  private addFridayDecoration(ctx: NodeCanvasRenderingContext2D, canvas: any) {
    // Stars/sparkles pattern
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#ffffff';
    
    // Draw stars in different positions
    this.drawStar(ctx, 80, 80, 5, 15, 7);
    this.drawStar(ctx, canvas.width - 80, 80, 5, 15, 7);
    this.drawStar(ctx, 80, canvas.height - 80, 5, 15, 7);
    this.drawStar(ctx, canvas.width - 80, canvas.height - 80, 5, 15, 7);
    
    // Draw smaller stars
    this.drawStar(ctx, 150, 120, 5, 8, 4);
    this.drawStar(ctx, canvas.width - 150, 120, 5, 8, 4);
    this.drawStar(ctx, 150, canvas.height - 120, 5, 8, 4);
    this.drawStar(ctx, canvas.width - 150, canvas.height - 120, 5, 8, 4);
    
    ctx.restore();
  }
  
  private drawStar(ctx: NodeCanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }
  
  private addSaturdayDecoration(ctx: NodeCanvasRenderingContext2D, canvas: any) {
    // Circular pattern
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    
    // Draw concentric circles
    ctx.beginPath();
    ctx.arc(80, 80, 40, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(canvas.width - 80, 80, 40, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(80, canvas.height - 80, 40, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(canvas.width - 80, canvas.height - 80, 40, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
  }
  
  private addSundayDecoration(ctx: NodeCanvasRenderingContext2D, canvas: any) {
    // Gentle rays from corners
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    
    // Top left rays
    for (let i = 0; i < 120; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(120, i + 60);
      ctx.stroke();
    }
    
    // Bottom right rays
    for (let i = 0; i < 120; i += 20) {
      ctx.beginPath();
      ctx.moveTo(canvas.width, canvas.height - i);
      ctx.lineTo(canvas.width - 120, canvas.height - i - 60);
      ctx.stroke();
    }
    
    ctx.restore();
  }
  
  private addRandomDecoration(ctx: NodeCanvasRenderingContext2D, canvas: any) {
    // Random pattern based on current day
    const patterns = [
      () => this.addMondayDecoration(ctx, canvas),
      () => this.addTuesdayDecoration(ctx, canvas),
      () => this.addWednesdayDecoration(ctx, canvas),
      () => this.addThursdayDecoration(ctx, canvas),
      () => this.addFridayDecoration(ctx, canvas),
      () => this.addSaturdayDecoration(ctx, canvas),
      () => this.addSundayDecoration(ctx, canvas)
    ];
    
    // Choose random pattern
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    randomPattern();
  }
}