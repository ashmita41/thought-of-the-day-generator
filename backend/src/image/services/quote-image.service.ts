import { Injectable, Logger } from '@nestjs/common';
import {
  createCanvas,
  CanvasRenderingContext2D as NodeCanvasRenderingContext2D,
} from 'canvas';
import { ImageGenerationOptions } from '../interfaces/image-generation.interface';
import { IMAGE_CONFIG } from '../config/image-config';
import { TextUtilsService } from './text-utils.service';
import { ImageStorage } from '../utils/image-storage';

@Injectable()
export class QuoteImageService {
  private readonly logger = new Logger(QuoteImageService.name);

  constructor(private textUtilsService: TextUtilsService) {}

  async generateQuoteImage(options: ImageGenerationOptions): Promise<string> {
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
      const maxTextWidth =
        canvas.width - IMAGE_CONFIG.MARGINS.HORIZONTAL * 2 - 180;

      // Wrap text
      const wrappedQuote = this.textUtilsService.wrapText(
        ctx,
        quote,
        maxTextWidth,
        quoteFontSize,
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
        horizontal: 50,
      };

      const quoteTextHeight = wrappedQuote.length * quoteLineHeight;
      const cardWidth = maxTextWidth + cardPadding.horizontal * 2;
      const cardHeight =
        quoteTextHeight +
        authorHeight +
        quoteToAuthorGap +
        cardPadding.vertical * 2;

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

      ctx.fillText(titleText, (canvas.width - titleWidth) / 2, titleY);

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
      const quoteStartY = cardY + cardPadding.vertical + quoteFontSize * 0.8;

      wrappedQuote.forEach((line, index) => {
        const lineWidth = ctx.measureText(line).width;
        ctx.fillText(
          line,
          (canvas.width - lineWidth) / 2,
          quoteStartY + index * quoteLineHeight,
        );
      });

      // Render author with italic style - BETTER POSITIONED
      const authorFontSize = 38;
      ctx.font = `italic ${authorFontSize}px ${design.typography.author.fontFamily || 'Arial'}`;
      ctx.fillStyle = design.typography.author.color || '#555555';

      const authorText = `- ${author}`;
      const authorWidth = ctx.measureText(authorText).width;

      // Position author text with proper spacing from quote text and from bottom of card
      const authorY =
        quoteStartY + wrappedQuote.length * quoteLineHeight + quoteToAuthorGap;

      ctx.fillText(authorText, (canvas.width - authorWidth) / 2, authorY);

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
      try {
        const imageUrl = await ImageStorage.saveImage(canvas, 'thought');
        this.logger.log(`Successfully generated quote image: ${imageUrl}`);
        return imageUrl;
      } catch (saveError) {
        this.logger.error(
          `Error saving image: ${saveError.message}`,
          saveError.stack,
        );
        // Return placeholder if save fails
        return 'generated-images/thoughts/placeholder.png';
      }
    } catch (error) {
      this.logger.error(
        `Failed to generate image: ${error.message}`,
        error.stack,
      );
      // Return placeholder on any error
      return 'generated-images/thoughts/placeholder.png';
    }
  }

  private applyGradientBackground(
    ctx: NodeCanvasRenderingContext2D,
    color: string,
    canvas: any,
  ) {
    // Parse the color string to extract gradient colors
    let colors: string[] = ['#ffffff', '#f0f0f0'];

    try {
      if (color) {
        // Try to parse as JSON array
        const parsedColors = JSON.parse(color);
        if (Array.isArray(parsedColors) && parsedColors.length > 0) {
          colors = parsedColors;
          this.logger.log(`Successfully parsed colors: ${colors.join(', ')}`);
        }
      }
    } catch (error) {
      this.logger.warn(
        `Failed to parse color value: ${color}. Using default colors.`,
      );
    }

    // Use diagonal gradient for more visual interest
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height,
    );

    if (colors.length === 1) {
      // If only one color provided, create a slight gradient from it
      const baseColor = colors[0];
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(1, this.adjustBrightness(baseColor, -10));
    } else {
      // Use provided colors for gradient
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

  private adjustBrightness(hex: string, percent: number): string {
    // Convert hex to RGB
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    // Adjust brightness
    r = Math.max(0, Math.min(255, r + percent));
    g = Math.max(0, Math.min(255, g + percent));
    b = Math.max(0, Math.min(255, b + percent));

    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private drawStylizedCard(
    ctx: NodeCanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    design: any,
  ) {
    // Different card styles based on day
    ctx.save();

    // Default values - using semi-transparent white for modern look
    let backgroundColor = 'rgba(255, 255, 255, 0.2)';
    let borderColor: string | null = null;
    let borderWidth = 0;
    let borderRadius = 20;
    let shadowColor = 'rgba(0, 0, 0, 0.3)';
    let shadowBlur = 15;
    let shadowOffsetX = 5;
    let shadowOffsetY = 5;

    if (design.designId.includes('monday')) {
      // Monday - Soft blue with light shadow
      backgroundColor = 'rgba(255, 255, 255, 0.25)';
      borderRadius = 25;
      shadowColor = 'rgba(0, 0, 40, 0.35)';
      shadowBlur = 20;
    } else if (design.designId.includes('tuesday')) {
      // Tuesday - Light warm color with stronger shadow
      backgroundColor = 'rgba(255, 255, 255, 0.2)';
      borderRadius = 15;
      shadowColor = 'rgba(50, 0, 0, 0.3)';
      shadowBlur = 18;
      borderColor = 'rgba(255, 255, 255, 0.4)';
      borderWidth = 3;
    } else if (design.designId.includes('wednesday')) {
      // Wednesday - Natural green tint with leafy pattern
      backgroundColor = 'rgba(255, 255, 255, 0.15)';
      borderRadius = 30;
      shadowColor = 'rgba(0, 30, 0, 0.25)';
      shadowBlur = 25;
    } else if (design.designId.includes('thursday')) {
      // Thursday - Slight purple tint with distinctive shadow
      backgroundColor = 'rgba(255, 255, 255, 0.2)';
      borderRadius = 10;
      shadowColor = 'rgba(50, 0, 50, 0.35)';
      shadowOffsetX = 8;
      shadowOffsetY = 8;
      borderColor = 'rgba(255, 255, 255, 0.5)';
      borderWidth = 2;
    } else if (design.designId.includes('friday')) {
      // Friday - Happy yellow tint with warm shadow
      backgroundColor = 'rgba(255, 255, 255, 0.25)';
      borderRadius = 35;
      shadowColor = 'rgba(50, 40, 0, 0.3)';
      shadowBlur = 22;
    } else if (design.designId.includes('saturday')) {
      // Saturday - Relaxed peach tint with soft shadow
      backgroundColor = 'rgba(255, 255, 255, 0.2)';
      borderRadius = 28;
      shadowColor = 'rgba(0, 40, 40, 0.25)';
      shadowBlur = 15;
      borderColor = 'rgba(255, 255, 255, 0.3)';
      borderWidth = 4;
    } else if (design.designId.includes('sunday')) {
      // Sunday - Light gold with subtle glow
      backgroundColor = 'rgba(255, 255, 255, 0.15)';
      borderRadius = 20;
      shadowColor = 'rgba(30, 0, 60, 0.3)';
      shadowBlur = 20;
      borderColor = 'rgba(255, 255, 255, 0.2)';
      borderWidth = 3;
    }

    // Apply shadow
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
    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - borderRadius,
      y + height,
    );
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

  private drawRoundedRect(
    ctx: NodeCanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  // Decorative elements for each day
  private addMondayDecoration(ctx: NodeCanvasRenderingContext2D, canvas: any) {
    // Soft waves in corners
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#6495ED'; // Cornflower blue
    ctx.lineWidth = 3;

    // Top left corner waves
    for (let i = 0; i < 80; i += 20) {
      ctx.beginPath();
      ctx.arc(40, 40, i, 0, Math.PI * 0.5);
      ctx.stroke();
    }

    // Bottom right corner waves
    for (let i = 0; i < 80; i += 20) {
      ctx.beginPath();
      ctx.arc(canvas.width - 40, canvas.height - 40, i, Math.PI, Math.PI * 1.5);
      ctx.stroke();
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

  private addWednesdayDecoration(
    ctx: NodeCanvasRenderingContext2D,
    canvas: any,
  ) {
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

  private drawStylizedLeaf(
    ctx: NodeCanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
  ) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(
      x + size,
      y - size / 2,
      x + size * 1.5,
      y + size / 3,
      x,
      y + size,
    );
    ctx.bezierCurveTo(
      x - size * 1.5,
      y + size / 3,
      x - size,
      y - size / 2,
      x,
      y,
    );
    ctx.closePath();
    ctx.fill();
  }

  private addThursdayDecoration(
    ctx: NodeCanvasRenderingContext2D,
    canvas: any,
  ) {
    // Diamond pattern in corners
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#ffffff';

    const diamondSize = 15;
    const diamondSpacing = 30;
    const cornerSize = 150;

    // Top left corner
    for (let y = 30; y < cornerSize; y += diamondSpacing) {
      for (let x = 30; x < cornerSize - y; x += diamondSpacing) {
        this.drawDiamond(ctx, x, y, diamondSize);
      }
    }

    // Bottom right corner
    for (
      let y = canvas.height - 30;
      y > canvas.height - cornerSize;
      y -= diamondSpacing
    ) {
      for (
        let x = canvas.width - 30;
        x > canvas.width - (canvas.height - y) - cornerSize;
        x -= diamondSpacing
      ) {
        this.drawDiamond(ctx, x, y, diamondSize);
      }
    }

    ctx.restore();
  }

  private drawDiamond(
    ctx: NodeCanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
  ) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size, y);
    ctx.closePath();
    ctx.fill();
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

  private drawStar(
    ctx: NodeCanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number,
  ) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

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

  private addSaturdayDecoration(
    ctx: NodeCanvasRenderingContext2D,
    canvas: any,
  ) {
    // Curved lines
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    // Draw curves in top right
    for (let i = 0; i < 150; i += 30) {
      ctx.beginPath();
      ctx.arc(canvas.width, 0, i + 50, Math.PI / 2, Math.PI);
      ctx.stroke();
    }

    // Draw curves in bottom left
    for (let i = 0; i < 150; i += 30) {
      ctx.beginPath();
      ctx.arc(0, canvas.height, i + 50, -Math.PI / 2, 0);
      ctx.stroke();
    }

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
    // Soft dots pattern across the background
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = '#ffffff';

    for (let y = 40; y < canvas.height; y += 80) {
      for (let x = 40; x < canvas.width; x += 80) {
        const size = Math.random() * 4 + 2;
        ctx.beginPath();
        ctx.arc(
          x + (Math.random() * 40 - 20),
          y + (Math.random() * 40 - 20),
          size,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
