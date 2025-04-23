import { Injectable } from '@nestjs/common';
import { CanvasRenderingContext2D as NodeCanvasRenderingContext2D } from 'canvas';

@Injectable()
export class TextUtilsService {
  wrapText(
    ctx: NodeCanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    fontSize: number,
  ): string[] {
    // Start with the current font size
    let currentFontSize = fontSize;
    let lines: string[] = [];
    let attempts = 0;
    const maxAttempts = 3; // Maximum number of font size adjustments

    // Try to fit the text with the current font size
    while (attempts < maxAttempts) {
      // Update font size in the context for proper measurement
      const fontParts = ctx.font.split(' ');
      fontParts[fontParts.length - 2] = `${currentFontSize}px`;
      ctx.font = fontParts.join(' ');

      lines = this.splitTextIntoLines(ctx, text, maxWidth);

      // If we have too many lines or the text is still too wide, reduce font size
      if (lines.length > 5) {
        currentFontSize -= 4;
        attempts++;
      } else {
        // Text fits well with the current font size
        break;
      }
    }

    // Balance line lengths for better visual appearance
    lines = this.balanceLines(ctx, lines, maxWidth);

    return lines;
  }

  private splitTextIntoLines(
    ctx: NodeCanvasRenderingContext2D,
    text: string,
    maxWidth: number,
  ): string[] {
    // Handle quotes with special characters
    text = text.replace(/[""]/g, '"').replace(/['']/g, "'");

    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i];
      const metrics = ctx.measureText(testLine);

      if (metrics.width <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }

    lines.push(currentLine);
    return lines;
  }

  /**
   * Tries to balance line lengths for more aesthetic appearance
   */
  private balanceLines(
    ctx: NodeCanvasRenderingContext2D,
    lines: string[],
    maxWidth: number,
  ): string[] {
    // If there are less than 2 lines, no balancing needed
    if (lines.length < 2) {
      return lines;
    }

    // Try to balance consecutive short lines
    const balancedLines: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const currentLine = lines[i];

      // If this is the last line or the current line is already long enough
      if (
        i === lines.length - 1 ||
        ctx.measureText(currentLine).width > maxWidth * 0.75
      ) {
        balancedLines.push(currentLine);
        i++;
        continue;
      }

      // Check if we can combine with the next line
      const nextLine = lines[i + 1];
      const combinedLine = currentLine + ' ' + nextLine;

      if (ctx.measureText(combinedLine).width <= maxWidth) {
        balancedLines.push(combinedLine);
        i += 2; // Skip the next line since we combined it
      } else {
        balancedLines.push(currentLine);
        i++;
      }
    }

    return balancedLines;
  }

  calculateVerticalCenter(
    ctx: NodeCanvasRenderingContext2D,
    lines: string[],
    fontSize: number,
    canvasHeight: number,
  ): number {
    const lineHeight = fontSize * 1.2; // Add some line spacing
    const totalTextHeight = lines.length * lineHeight;
    return (canvasHeight - totalTextHeight) / 2;
  }

  /**
   * Get ideal spacing between lines based on font size and line count
   */
  getIdealLineHeight(fontSize: number, lineCount: number): number {
    // Base line height
    let lineHeight = fontSize * 1.2;

    // Adjust line height based on number of lines
    if (lineCount > 3) {
      // Reduce line height slightly for many lines
      lineHeight = fontSize * 1.15;
    } else if (lineCount <= 2) {
      // Increase line height for few lines
      lineHeight = fontSize * 1.3;
    }

    return lineHeight;
  }
}
