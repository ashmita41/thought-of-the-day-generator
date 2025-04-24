import {
  createCanvas,
  CanvasRenderingContext2D as NodeCanvasRenderingContext2D,
  registerFont,
} from 'canvas';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WordImageGenerationOptions } from '../interfaces/word-image-generation.interface';
import { IMAGE_CONFIG } from '../config/image-config';
import { TextUtilsService } from './text-utils.service';
import { ImageStorage } from '../utils/image-storage';
import * as path from 'path';

@Injectable()
export class WordImageService implements OnModuleInit {
  private readonly logger = new Logger(WordImageService.name);
  private fonts = {
    title: ['Lato', 'Nunito', 'Lora'],
    body: ['Lato', 'Nunito', 'Lora'],
  };

  constructor(private textUtilsService: TextUtilsService) {
    // We don't need to initialize with S3 service since we're using local storage
    // Just ensure our directories exist
    ImageStorage.ensureDirectoriesExist();
    try {
      // You can put any initialization code that might throw errors here
    } catch (err) {
      this.logger.error(`Failed to initialize WordImageService: ${err.message}`);
    }
  }

  onModuleInit() {
    try {
      // Register custom fonts
      registerFont(path.join(process.cwd(), 'src/assets/fonts/lato.ttf'), {
        family: 'Lato',
      });
      registerFont(path.join(process.cwd(), 'src/assets/fonts/nunito.ttf'), {
        family: 'Nunito',
      });
      registerFont(path.join(process.cwd(), 'src/assets/fonts/lora.ttf'), {
        family: 'Lora',
      });
      this.logger.log('Custom fonts registered successfully');
    } catch (error) {
      this.logger.error(`Failed to register custom fonts: ${error.message}`);
    }
  }

  async generateWordImage(
    options: WordImageGenerationOptions,
  ): Promise<string> {
    try {
      this.logger.log(`Starting word image generation for: ${options.word}`);
      const { word, definition, example, partOfSpeech, design } = options;

      // Create canvas with square post size
      this.logger.debug('Creating canvas');
      const canvas = createCanvas(IMAGE_CONFIG.WIDTH, IMAGE_CONFIG.HEIGHT);
      const ctx = canvas.getContext('2d');

      // Select fonts based on the day
      const dayIndex = this.getDayIndex(design.designId);
      const titleFont = this.fonts.title[dayIndex % this.fonts.title.length];
      const bodyFont = this.fonts.body[dayIndex % this.fonts.body.length];

      // Create day-specific background
      this.logger.debug(`Creating background with design: ${design.designId}`);
      this.createDayBackground(ctx, canvas, design.designId);

      // Draw the word in large font, centered and with more emphasis
      const wordFontSize = 140; // Increased font size for more impact
      ctx.font = `bold ${wordFontSize}px ${titleFont}, ${design.typography.title.fontFamily || 'Arial'}`;
      // Shadow for word
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
      ctx.fillStyle = '#222222'; // Darker text for better contrast

      const wordWidth = ctx.measureText(word).width;
      const wordX = (canvas.width - wordWidth) / 2;
      const wordY = 300; // Position after header with more space

      ctx.fillText(word, wordX, wordY);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Draw part of speech in italics below the word
      let currentY = wordY + 60;
      if (partOfSpeech) {
        const partOfSpeechFontSize = 40;
        ctx.font = `italic ${partOfSpeechFontSize}px ${bodyFont}, ${design.typography.author.fontFamily || 'Arial'}`;
        ctx.fillStyle = '#555555';

        const partOfSpeechText = `(${partOfSpeech})`;
        const partOfSpeechWidth = ctx.measureText(partOfSpeechText).width;
        ctx.fillText(
          partOfSpeechText,
          (canvas.width - partOfSpeechWidth) / 2,
          currentY,
        );

        currentY += 60;
      }

      // Draw "Meaning" heading with better styling
      const headingFontSize = 44;
      ctx.font = `bold ${headingFontSize}px ${titleFont}, ${design.typography.title.fontFamily || 'Arial'}`;
      ctx.fillStyle = '#333333';

      const meaningHeadingText = 'MEANING';
      const meaningHeadingWidth = ctx.measureText(meaningHeadingText).width;

      // Draw decorative line before and after heading
      const lineWidth = 100;
      const lineY = currentY - headingFontSize / 4;
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(
        (canvas.width - meaningHeadingWidth) / 2 - lineWidth - 20,
        lineY,
      );
      ctx.lineTo((canvas.width - meaningHeadingWidth) / 2 - 20, lineY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo((canvas.width + meaningHeadingWidth) / 2 + 20, lineY);
      ctx.lineTo(
        (canvas.width + meaningHeadingWidth) / 2 + lineWidth + 20,
        lineY,
      );
      ctx.stroke();

      ctx.fillText(
        meaningHeadingText,
        (canvas.width - meaningHeadingWidth) / 2,
        currentY,
      );

      currentY += 60; // Increased space

      // Draw the definition in a styled rounded rectangle
      const definitionFontSize = 40; // Slightly larger font
      ctx.font = `bold${definitionFontSize}px ${bodyFont}, ${design.typography.quote.fontFamily || 'Arial'}`;
      ctx.fillStyle = '#000000';

      // Calculate max width for text
      const maxTextWidth = canvas.width - 250; // Increased margins

      // Wrap text to fit within max width
      const wrappedDefinition = this.textUtilsService.wrapText(
        ctx,
        definition,
        maxTextWidth,
        definitionFontSize,
      );

      // Draw styled rounded rectangle for definition with gradient background
      const definitionPadding = 30; // Increased padding
      const definitionBoxHeight =
        wrappedDefinition.length * (definitionFontSize * 1.3) +
        definitionPadding * 2;
      const definitionBoxWidth = maxTextWidth + definitionPadding * 2;
      const definitionBoxX = (canvas.width - definitionBoxWidth) / 2;

      // Add shadow to the box
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;

      // Create gradient for box background
      const boxGradient = ctx.createLinearGradient(
        definitionBoxX,
        currentY,
        definitionBoxX + definitionBoxWidth,
        currentY + definitionBoxHeight,
      );
      boxGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      boxGradient.addColorStop(1, 'rgba(245, 245, 245, 0.95)');
      ctx.fillStyle = boxGradient;

      this.drawRoundedRect(
        ctx,
        definitionBoxX,
        currentY - definitionFontSize / 2,
        definitionBoxWidth,
        definitionBoxHeight,
        20,
      );

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Draw definition lines centered within the white box with better vertical spacing
      ctx.fillStyle = '#333333'; // Softer text color
      wrappedDefinition.forEach((line, index) => {
        const lineWidth = ctx.measureText(line).width;
        ctx.fillText(
          line,
          (canvas.width - lineWidth) / 2,
          currentY + definitionPadding + index * (definitionFontSize * 1.3),
        );
      });

      // Update currentY to after definition text and box
      currentY += definitionBoxHeight + 60; // Increased spacing

      // Draw "Example" heading instead of "Sentence"
      if (example) {
        ctx.font = `bold ${headingFontSize}px ${titleFont}, ${design.typography.title.fontFamily || 'Arial'}`;
        ctx.fillStyle = '#333333';

        const exampleHeadingText = 'SENTENCE';
        const exampleHeadingWidth = ctx.measureText(exampleHeadingText).width;

        // Draw decorative line before and after heading
        const exLineY = currentY - headingFontSize / 4;
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(
          (canvas.width - exampleHeadingWidth) / 2 - lineWidth - 20,
          exLineY,
        );
        ctx.lineTo((canvas.width - exampleHeadingWidth) / 2 - 20, exLineY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo((canvas.width + exampleHeadingWidth) / 2 + 20, exLineY);
        ctx.lineTo(
          (canvas.width + exampleHeadingWidth) / 2 + lineWidth + 20,
          exLineY,
        );
        ctx.stroke();

        ctx.fillText(
          exampleHeadingText,
          (canvas.width - exampleHeadingWidth) / 2,
          currentY,
        );

        currentY += 60; // Increased space

        // Wrap example sentence - without quotation marks
        const exampleFontSize = 40;
        ctx.font = `italic ${exampleFontSize}px ${bodyFont}, ${design.typography.author.fontFamily || 'Arial'}`;

        const wrappedExample = this.textUtilsService.wrapText(
          ctx,
          example, 
          maxTextWidth,
          exampleFontSize,
        );

        // Draw styled rounded rectangle for example
        const examplePadding = 30; // Increased padding
        const exampleBoxHeight =
          wrappedExample.length * (exampleFontSize * 1.3) + examplePadding * 2;
        const exampleBoxWidth = maxTextWidth + examplePadding * 2;
        const exampleBoxX = (canvas.width - exampleBoxWidth) / 2;

        // Add shadow to the box
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        // Create gradient for box background (slightly different than definition box)
        const exampleBoxGradient = ctx.createLinearGradient(
          exampleBoxX,
          currentY,
          exampleBoxX + exampleBoxWidth,
          currentY + exampleBoxHeight,
        );
        exampleBoxGradient.addColorStop(0, 'rgba(250, 250, 255, 0.95)');
        exampleBoxGradient.addColorStop(1, 'rgba(240, 240, 250, 0.95)');
        ctx.fillStyle = exampleBoxGradient;

        this.drawRoundedRect(
          ctx,
          exampleBoxX,
          currentY - exampleFontSize / 2,
          exampleBoxWidth,
          exampleBoxHeight,
          20,
        );

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw example lines centered
        ctx.fillStyle = '#444444'; // Slightly darker than definition text
        wrappedExample.forEach((line, index) => {
          const lineWidth = ctx.measureText(line).width;
          ctx.fillText(
            line,
            (canvas.width - lineWidth) / 2,
            currentY + examplePadding + index * (exampleFontSize * 1.3),
          );
        });
      }

      // Save and return image path
      this.logger.debug('Image drawing complete, saving image');
      try {
        const imageUrl = await ImageStorage.saveImage(canvas, 'word');
        this.logger.log(
          `Successfully generated and saved word image: ${imageUrl}`,
        );
        return imageUrl;
      } catch (saveError) {
        this.logger.error(
          `Error saving image: ${saveError.message}`,
          saveError.stack,
        );
        // Return placeholder if save fails
        return 'generated-images/words/placeholder.png';
      }
    } catch (error) {
      this.logger.error(
        `Failed to generate word image: ${error.message}`,
        error.stack,
      );
      // Return placeholder on any error
      return 'generated-images/words/placeholder.png';
    }
  }

  // Draw the fixed header for Word of the Day
  private drawFixedHeader(
    ctx: NodeCanvasRenderingContext2D,
    canvas: any,
    fontFamily: string,
  ) {
    // we'll add subtle decorative elements at the top
    const decorY = 50;

    // Draw decorative elements at the top
    this.drawHeaderDecoration(ctx, canvas.width / 3, decorY);
    this.drawHeaderDecoration(ctx, (canvas.width * 2) / 3, decorY);
  }

  // Draw decorative element for header 
  private drawHeaderDecoration(
    ctx: NodeCanvasRenderingContext2D,
    x: number,
    y: number,
  ) {
    // Draw an elegant decorative element
    const size = 20;

    // Save current context
    ctx.save();

    // Set styles for decoration
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;

    // Draw circular flourish
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Add inner detail
    ctx.beginPath();
    ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
    ctx.stroke();

    // Restore context
    ctx.restore();
  }

  private getDayIndex(designId: string): number {
    const days = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    for (let i = 0; i < days.length; i++) {
      if (designId.includes(days[i])) {
        return i;
      }
    }
    return Math.floor(Math.random() * 7); // Default to random index if no day found
  }

  // Create day-specific background designs with improved gradients
  private createDayBackground(
    ctx: NodeCanvasRenderingContext2D,
    canvas: any,
    designId: string,
  ) {
    // Create gradient based on day of the week
    const width = canvas.width;
    const height = canvas.height;

    // Default to a calm blue gradient
    let gradient = ctx.createLinearGradient(0, 0, width, height);

    if (designId.includes('monday')) {
      // Monday - Energetic Blue to Purple Gradient to start the week
      gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#4158D0');
      gradient.addColorStop(0.46, '#C850C0');
      gradient.addColorStop(1, '#FFCC70');
    } else if (designId.includes('tuesday')) {
      // Tuesday - Soft Green to Blue gradient
      gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#0BAB64');
      gradient.addColorStop(1, '#3BB2F9');
    } else if (designId.includes('wednesday')) {
      // Wednesday - Warm Orange to Pink gradient for mid-week
      gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#FA8BFF');
      gradient.addColorStop(0.5, '#2BD2FF');
      gradient.addColorStop(1, '#2BFF88');
    } else if (designId.includes('thursday')) {
      // Thursday - Deep Purple to Orange gradient
      gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#8E2DE2');
      gradient.addColorStop(1, '#FF8235');
    } else if (designId.includes('friday')) {
      // Friday - Vibrant Pink to Yellow gradient to end work week
      gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#FF3CAC');
      gradient.addColorStop(0.5, '#784BA0');
      gradient.addColorStop(1, '#2B86C5');
    } else if (designId.includes('saturday')) {
      // Saturday - Festive Red to Purple gradient for weekend
      gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#FF416C');
      gradient.addColorStop(1, '#FF4B2B');
    } else if (designId.includes('sunday')) {
      // Sunday - Calm Turquoise to Blue gradient to close the weekend
      gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#3EECAC');
      gradient.addColorStop(0.5, '#55D8C1');
      gradient.addColorStop(1, '#3D87FF');
    } else {
      // Random gradient as fallback
      const hue = Math.floor(Math.random() * 360);
      gradient.addColorStop(0, `hsl(${hue}, 100%, 85%)`);
      gradient.addColorStop(0.5, `hsl(${(hue + 60) % 360}, 80%, 75%)`);
      gradient.addColorStop(1, `hsl(${(hue + 120) % 360}, 60%, 70%)`);
    }

    // Fill the background with the gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add a subtle overlay pattern for texture
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < width; i += 20) {
      for (let j = 0; j < height; j += 20) {
        ctx.fillRect(i, j, 10, 10);
      }
    }
    ctx.globalAlpha = 1.0;

    // Add decorative elements based on day
    this.addDecorativeElements(ctx, canvas, designId);
  }

  private addDecorativeElements(
    ctx: NodeCanvasRenderingContext2D,
    canvas: any,
    designId: string,
  ) {
    const width = canvas.width;
    const height = canvas.height;

    if (designId.includes('monday')) {
      // Monday - Floating bubbles
      this.drawBubbles(ctx, width, height, 15);
    } else if (designId.includes('tuesday')) {
      // Tuesday - Leafy pattern
      this.drawLeaves(ctx, width, height, 12);
    } else if (designId.includes('wednesday')) {
      // Wednesday - Sun and clouds
      this.drawSunAndClouds(ctx, width, height);
    } else if (designId.includes('thursday')) {
      // Thursday - Stars
      this.drawStars(ctx, width, height, 20);
    } else if (designId.includes('friday')) {
      // Friday - Confetti
      this.drawConfetti(ctx, width, height, 30);
    } else if (designId.includes('saturday')) {
      // Saturday - Geometric shapes
      this.drawGeometricShapes(ctx, width, height, 15);
    } else if (designId.includes('sunday')) {
      // Sunday - Birds and trees
      this.drawBirdsAndTrees(ctx, width, height);
    } else {
      // Default - Simple dots
      this.drawDots(ctx, width, height, 25);
    }
  }

  private drawBubbles(
    ctx: NodeCanvasRenderingContext2D,
    width: number,
    height: number,
    count: number,
  ) {
    ctx.save();
    ctx.globalAlpha = 0.1;

    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 10 + Math.random() * 50;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    }

    ctx.restore();
  }

  private drawLeaves(
    ctx: NodeCanvasRenderingContext2D,
    width: number,
    height: number,
    count: number,
  ) {
    ctx.save();
    ctx.globalAlpha = 0.1;

    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 20 + Math.random() * 40;
      const rotation = Math.random() * Math.PI * 2;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      // Draw leaf
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.bezierCurveTo(size / 3, -size / 2, size, -size / 4, size, 0);
      ctx.bezierCurveTo(size, size / 4, size / 3, size / 2, 0, size / 2);
      ctx.bezierCurveTo(-size / 3, size / 2, -size, size / 4, -size, 0);
      ctx.bezierCurveTo(-size, -size / 4, -size / 3, -size / 2, 0, -size / 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  private drawSunAndClouds(
    ctx: NodeCanvasRenderingContext2D,
    width: number,
    height: number,
  ) {
    ctx.save();
    ctx.globalAlpha = 0.1;

    // Draw sun
    const sunX = width * 0.8;
    const sunY = height * 0.2;
    const sunSize = 80;

    ctx.beginPath();
    ctx.arc(sunX, sunY, sunSize, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // Draw sun rays
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 5;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(
        sunX + Math.cos(angle) * sunSize,
        sunY + Math.sin(angle) * sunSize,
      );
      ctx.lineTo(
        sunX + Math.cos(angle) * (sunSize + 40),
        sunY + Math.sin(angle) * (sunSize + 40),
      );
      ctx.stroke();
    }

    // Draw clouds
    this.drawCloud(ctx, width * 0.3, height * 0.3, 100);
    this.drawCloud(ctx, width * 0.6, height * 0.5, 80);
    this.drawCloud(ctx, width * 0.2, height * 0.7, 120);

    ctx.restore();
  }

  private drawCloud(
    ctx: NodeCanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
  ) {
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.arc(x + size / 3, y - size / 4, size / 3, 0, Math.PI * 2);
    ctx.arc(x + size / 1.5, y, size / 2.5, 0, Math.PI * 2);
    ctx.arc(x + size / 3, y + size / 4, size / 3, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  }

  private drawStars(
    ctx: NodeCanvasRenderingContext2D,
    width: number,
    height: number,
    count: number,
  ) {
    ctx.save();
    ctx.globalAlpha = 0.1;

    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 10 + Math.random() * 20;

      this.drawStar(ctx, x, y, 5, size, size / 2);
    }

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
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  }

  private drawConfetti(
    ctx: NodeCanvasRenderingContext2D,
    width: number,
    height: number,
    count: number,
  ) {
    ctx.save();
    ctx.globalAlpha = 0.1;

    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 5 + Math.random() * 10;
      const rotation = Math.random() * Math.PI * 2;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      // Randomly choose between circle, square, or triangle
      const shape = Math.floor(Math.random() * 3);
      ctx.fillStyle = '#FFFFFF';

      if (shape === 0) {
        // Circle
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
      } else if (shape === 1) {
        // Square
        ctx.fillRect(-size, -size, size * 2, size * 2);
      } else {
        // Triangle
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size, size);
        ctx.lineTo(-size, size);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }

    ctx.restore();
  }

  private drawGeometricShapes(
    ctx: NodeCanvasRenderingContext2D,
    width: number,
    height: number,
    count: number,
  ) {
    ctx.save();
    ctx.globalAlpha = 0.1;

    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 20 + Math.random() * 40;

      // Choose shape: hexagon, pentagon, or octagon
      const sides = [5, 6, 8][Math.floor(Math.random() * 3)];
      this.drawPolygon(ctx, x, y, sides, size);
    }

    ctx.restore();
  }

  private drawPolygon(
    ctx: NodeCanvasRenderingContext2D,
    x: number,
    y: number,
    sides: number,
    radius: number,
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);

    for (let i = 1; i <= sides; i++) {
      const angle = (i * 2 * Math.PI) / sides;
      const ptX = x + radius * Math.cos(angle);
      const ptY = y + radius * Math.sin(angle);
      ctx.lineTo(ptX, ptY);
    }

    ctx.closePath();
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  }

  private drawBirdsAndTrees(
    ctx: NodeCanvasRenderingContext2D,
    width: number,
    height: number,
  ) {
    ctx.save();
    ctx.globalAlpha = 0.1;

    // Draw trees
    this.drawTree(ctx, width * 0.2, height * 0.8, 100);
    this.drawTree(ctx, width * 0.8, height * 0.9, 120);
    this.drawTree(ctx, width * 0.5, height * 0.95, 80);

    // Draw birds
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * width;
      const y = Math.random() * (height * 0.6);
      const size = 5 + Math.random() * 10;

      this.drawBird(ctx, x, y, size);
    }

    ctx.restore();
  }

  private drawTree(
    ctx: NodeCanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
  ) {
    // Draw trunk
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - size / 20, y - size, size / 10, size);

    // Draw foliage
    ctx.beginPath();
    ctx.moveTo(x, y - size - size / 2);
    ctx.lineTo(x + size / 2, y - size + size / 4);
    ctx.lineTo(x - size / 2, y - size + size / 4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x, y - size - size / 4);
    ctx.lineTo(x + size / 2, y - size + size / 2);
    ctx.lineTo(x - size / 2, y - size + size / 2);
    ctx.closePath();
    ctx.fill();
  }

  private drawBird(
    ctx: NodeCanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
  ) {
    // Draw simple bird (~ shape)
    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.quadraticCurveTo(x - size / 2, y - size, x, y);
    ctx.quadraticCurveTo(x + size / 2, y - size, x + size, y);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  private drawDots(
    ctx: NodeCanvasRenderingContext2D,
    width: number,
    height: number,
    count: number,
  ) {
    ctx.save();
    ctx.globalAlpha = 0.1;

    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 2 + Math.random() * 10;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
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
    ctx.quadraticCurveTo(x + radius, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }
}
