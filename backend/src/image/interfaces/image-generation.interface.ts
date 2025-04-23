import { DesignConfig } from '../../design/interfaces/design-config.interface';

/**
 * Interface defining the options required to generate a quote/thought image
 */
export interface ImageGenerationOptions {
  /**
   * The quote text to display on the image
   */
  quote: string;

  /**
   * The author of the quote
   */
  author: string;

  /**
   * The title to display at the top of the image (e.g., "Thought of the Day")
   */
  title: string;

  /**
   * The design configuration that controls how the image looks
   */
  design: DesignConfig;
}
