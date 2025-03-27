import { Injectable } from '@nestjs/common';
import { CanvasRenderingContext2D } from 'canvas';

@Injectable()
export class TextUtilsService {
  wrapText(
    ctx: CanvasRenderingContext2D, 
    text: string, 
    maxWidth: number, 
    fontSize: number
  ): string[] {
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

    // Dynamically adjust if too many lines
    return lines.length > 3 
      ? this.wrapText(ctx, text, maxWidth, fontSize - 2) 
      : lines;
  }

  calculateVerticalCenter(
    ctx: CanvasRenderingContext2D, 
    lines: string[], 
    fontSize: number, 
    canvasHeight: number
  ): number {
    const totalTextHeight = lines.length * fontSize;
    return (canvasHeight - totalTextHeight) / 2;
  }
}