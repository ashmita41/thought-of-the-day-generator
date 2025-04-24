import { DesignConfig } from '../../design/interfaces/design-config.interface';

/**
 * Interface defining the options required to generate a word of the day image
 */
export interface WordImageGenerationOptions {
  /**
   * The featured word to be displayed prominently
   */
  word: string;

  /**
   * The phonetic pronunciation of the word (optional)
   */
  phonetic: string | null;

  /**
   * The definition of the word
   */
  definition: string;

  /**
   * An example sentence using the word (optional)
   */
  example: string | null;

  /**
   * The part of speech (noun, verb, adjective, etc.) (optional)
   */
  partOfSpeech: string | null;

  /**
   * The design configuration that controls how the image looks
   */
  design: DesignConfig;
}
