/**
 * Interface for image configuration settings
 */
interface ImageConfigInterface {
  /**
   * Width of the generated image in pixels
   */
  WIDTH: number;

  /**
   * Height of the generated image in pixels
   */
  HEIGHT: number;

  /**
   * Margin settings for image content
   */
  MARGINS: {
    /**
     * Horizontal margin in pixels
     */
    HORIZONTAL: number;

    /**
     * Vertical margin in pixels
     */
    VERTICAL: number;
  };

  /**
   * Paths to font files
   */
  FONT_PATHS: {
    /**
     * Path to Arial font file
     */
    ARIAL: string;

    /**
     * Path to Georgia font file
     */
    GEORGIA: string;
  };
}

/**
 * Configuration constants for image generation
 * Used by both Thought of the Day and Word of the Day generators
 */
export const IMAGE_CONFIG: ImageConfigInterface = {
  WIDTH: 1080, // square post size for social media
  HEIGHT: 1080,
  MARGINS: {
    HORIZONTAL: 100,
    VERTICAL: 100,
  },
  FONT_PATHS: {
    ARIAL: '/path/to/Arial.ttf',
    GEORGIA: '/path/to/Georgia.ttf',
  },
};
