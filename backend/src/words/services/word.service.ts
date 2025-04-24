import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, timeout } from 'rxjs';
import { AxiosError } from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { Word } from '../types/word.types';
import { WordApiService } from './word-api.service';

// Types for word data
interface WordData {
  word: string;
  phonetic: string | null;
  partOfSpeech: string | null;
  definition: string;
  example: string | null;
  synonyms: string[];
}

// Fallback words to use if all APIs fail
const FALLBACK_WORDS: WordData[] = [
  {
    word: 'serendipity',
    phonetic: '/ˌsɛrənˈdɪpɪti/',
    partOfSpeech: 'noun',
    definition:
      'The occurrence and development of events by chance in a happy or beneficial way',
    example:
      'Finding that rare book while looking for something else was pure serendipity.',
    synonyms: [],
  },
  {
    word: 'resilience',
    phonetic: '/rɪˈzɪliəns/',
    partOfSpeech: 'noun',
    definition: 'The capacity to recover quickly from difficulties; toughness',
    example:
      'The resilience she showed after the setback impressed everyone on the team.',
    synonyms: [],
  },
  {
    word: 'innovation',
    phonetic: '/ˌɪnəˈveɪʃən/',
    partOfSpeech: 'noun',
    definition:
      'The action or process of innovating; a new method, idea, product, etc.',
    example:
      "The company's latest innovation has revolutionized the entire industry.",
    synonyms: [],
  },
  {
    word: 'perseverance',
    phonetic: '/ˌpɜːrsəˈvɪərəns/',
    partOfSpeech: 'noun',
    definition:
      'Persistence in doing something despite difficulty or delay in achieving success',
    example:
      'Her perseverance in pursuing her goals eventually led to remarkable achievements.',
    synonyms: [],
  },
  {
    word: 'mindfulness',
    phonetic: '/ˈmaɪndflnəs/',
    partOfSpeech: 'noun',
    definition: 'The quality or state of being conscious or aware of something',
    example:
      'Daily mindfulness practices helped him manage stress and improve focus.',
    synonyms: [],
  },
];

/**
 * Service responsible for fetching and processing word data
 * Provides word of the day functionality with fallback mechanisms
 */
@Injectable()
export class WordService {
  private readonly logger = new Logger(WordService.name);
  private readonly MERRIAM_WEBSTER_COLLEGIATE_KEY: string;
  private readonly MERRIAM_WEBSTER_THESAURUS_KEY: string;
  private apiFailCount = 0;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private prisma: PrismaService,
    private wordApiService: WordApiService,
  ) {
    this.MERRIAM_WEBSTER_COLLEGIATE_KEY =
      this.configService.get<string>('MERRIAM_WEBSTER_COLLEGIATE_KEY') ||
      '355d7e92-f789-49dc-8c07-fa65b94c05b7';
    this.MERRIAM_WEBSTER_THESAURUS_KEY =
      this.configService.get<string>('MERRIAM_WEBSTER_THESAURUS_KEY') ||
      '9d371e11-cd9e-405d-ba84-8c0a3f7c30c3';
  }

  /**
   * Retrieves the word of the day
   * Tries multiple API sources with fallback to predefined words if needed
   * @returns A WordData object containing the word and its details
   */
  async getWordOfTheDay(): Promise<WordData> {
    try {
      // If we've had multiple API failures, use fallback words directly
      if (this.apiFailCount > 2) {
        this.logger.warn(
          `Using fallback word due to previous API failures (count: ${this.apiFailCount})`,
        );
        return this.getRandomFallbackWord();
      }

      this.logger.log('Getting word of the day...');
      // Get a random word using the fallback system
      try {
        const randomWord = await this.getRandomWordWithFallback();
        this.logger.log(`Successfully got random word: ${randomWord}`);

        // Get detailed information for the word
        const wordDetails = await this.getWordDetails(randomWord);
        this.logger.log(`Successfully got word details for: ${randomWord}`);

        // Reset failure count on success
        this.apiFailCount = 0;

        // Ensure all required properties are present with appropriate types
        return {
          word: randomWord,
          phonetic: wordDetails.phonetic ?? null,
          partOfSpeech: wordDetails.partOfSpeech ?? null,
          definition: wordDetails.definition || `Definition of ${randomWord}`,
          example: wordDetails.example ?? null,
          synonyms: wordDetails.synonyms || [],
        };
      } catch (apiError: any) {
        // Increment failure count
        this.apiFailCount++;
        this.logger.warn(`API failure count: ${this.apiFailCount}`);

        // Use fallback word
        this.logger.warn(
          `Using fallback word due to API error: ${apiError.message}`,
        );
        return this.getRandomFallbackWord();
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to get word of the day: ${error.message}`,
        error.stack,
      );

      // Always return a fallback word as last resort
      return this.getRandomFallbackWord();
    }
  }

  /**
   * Get a random word from our fallback list - guaranteed to work without API calls
   * @returns A WordData object from the predefined list
   */
  private getRandomFallbackWord(): WordData {
    const randomIndex = Math.floor(Math.random() * FALLBACK_WORDS.length);
    const fallbackWord = FALLBACK_WORDS[randomIndex];
    this.logger.log(`Using fallback word: ${fallbackWord.word}`);

    // Return a copy of the fallback word with capitalized fields
    return {
      word: this.capitalizeFirstLetter(fallbackWord.word),
      phonetic: fallbackWord.phonetic,
      partOfSpeech: fallbackWord.partOfSpeech,
      definition: this.capitalizeFirstLetter(fallbackWord.definition),
      example: this.capitalizeFirstLetter(fallbackWord.example || ''),
      synonyms: fallbackWord.synonyms || [],
    };
  }

  /**
   * Try multiple random word APIs with fallback
   * @returns A random word string
   */
  private async getRandomWordWithFallback(): Promise<string> {
    type ApiFunction = () => Promise<string>;
    
    const apis: ApiFunction[] = [
      this.getRandomWordFromHeroku.bind(this),
      this.getRandomWordFromVercel.bind(this),
      this.getRandomWordFromRyanRK.bind(this),
    ];

    // Keep track of errors for better diagnostics
    const errors: string[] = [];

    // Try each API in sequence until one works
    for (const apiFunc of apis) {
      try {
        this.logger.log(`Trying API: ${apiFunc.name}`);
        const word = await apiFunc();
        if (word) {
          this.logger.log(`Successfully retrieved random word: ${word}`);
          return word;
        }
      } catch (error: any) {
        errors.push(
          `${apiFunc.name}: ${error instanceof Error ? error.message : String(error)}`,
        );
        this.logger.warn(
          `API failed: ${error instanceof Error ? error.message : String(error)}`,
        );
        // Continue to next API
      }
    }

    // If all APIs fail, throw an error with details
    const errorMessage = `All random word APIs failed: ${errors.join('; ')}`;
    this.logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  private async getRandomWordFromHeroku(): Promise<string> {
    try {
      this.logger.log('Attempting to get word from Heroku API');
      const response = await firstValueFrom(
        this.httpService
          .get('https://random-word-api.herokuapp.com/word?number=1')
          .pipe(
            timeout(5000),
            catchError((error: AxiosError) => {
              this.logger.error(`Heroku API error: ${error.message}`);
              if (error.response) {
                this.logger.error(
                  `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`,
                );
              }
              throw new Error(
                `Heroku Random Word API failed: ${error.message}`,
              );
            }),
          ),
      );

      const data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        this.logger.log(`Heroku API returned word: ${data[0]}`);
        return data[0] as string;
      }
      throw new Error('Invalid response from Heroku API');
    } catch (error: any) {
      this.logger.error(`Error in getRandomWordFromHeroku: ${error.message}`);
      throw error;
    }
  }

  private async getRandomWordFromVercel(): Promise<string> {
    try {
      this.logger.log('Attempting to get word from Vercel API');
      const response = await firstValueFrom(
        this.httpService
          .get('https://random-word-api.vercel.app/api?words=1')
          .pipe(
            timeout(5000),
            catchError((error: AxiosError) => {
              this.logger.error(`Vercel API error: ${error.message}`);
              if (error.response) {
                this.logger.error(
                  `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`,
                );
              }
              throw new Error(
                `Vercel Random Word API failed: ${error.message}`,
              );
            }),
          ),
      );

      const data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        this.logger.log(`Vercel API returned word: ${data[0]}`);
        return data[0] as string;
      }
      throw new Error('Invalid response from Vercel API');
    } catch (error: any) {
      this.logger.error(`Error in getRandomWordFromVercel: ${error.message}`);
      throw error;
    }
  }

  private async getRandomWordFromRyanRK(): Promise<string> {
    try {
      this.logger.log('Attempting to get word from RyanRK API');
      const response = await firstValueFrom(
        this.httpService
          .get('https://random-word.ryanrk.com/api/en/word/random')
          .pipe(
            timeout(5000),
            catchError((error: AxiosError) => {
              this.logger.error(`RyanRK API error: ${error.message}`);
              if (error.response) {
                this.logger.error(
                  `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`,
                );
              }
              throw new Error(
                `RyanRK Random Word API failed: ${error.message}`,
              );
            }),
          ),
      );

      const data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        this.logger.log(`RyanRK API returned word: ${data[0]}`);
        return data[0] as string;
      }
      throw new Error('Invalid response from RyanRK API');
    } catch (error: any) {
      this.logger.error(`Error in getRandomWordFromRyanRK: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get detailed information for a given word using Merriam-Webster APIs
   * @param word The word to get details for
   */
  private async getWordDetails(word: string): Promise<Partial<WordData>> {
    try {
      this.logger.log(`Getting word details for: ${word}`);

      try {
        // Try to get data from both APIs
        const [collegiateData, thesaurusData] = await Promise.all([
          this.getMerriamWebsterCollegiateData(word),
          this.getMerriamWebsterThesaurusData(word),
        ]);

        // Process and combine the data
        const processedData = this.processWordData(
          word,
          collegiateData,
          thesaurusData,
        );
        return processedData;
      } catch (apiError: any) {
        // If API calls fail, return a simplified structure with default values
        this.logger.warn(
          `APIs failed for word '${word}', using default content. Error: ${apiError.message}`,
        );
        const defaultPartOfSpeech = this.guessPartOfSpeech(word);
        return {
          phonetic: '',
          partOfSpeech: defaultPartOfSpeech,
          definition: `Definition of ${word}`,
          example: this.generateDefaultExample(word, defaultPartOfSpeech),
          synonyms: [],
        };
      }
    } catch (error: any) {
      this.logger.error(`Failed to get word details: ${error.message}`);
      throw error;
    }
  }

  private async getMerriamWebsterCollegiateData(word: string): Promise<any> {
    try {
      const url = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${this.MERRIAM_WEBSTER_COLLEGIATE_KEY}`;
      this.logger.log(`Requesting Collegiate data for word: ${word}`);

      const response = await firstValueFrom(
        this.httpService.get(url).pipe(
          timeout(8000),
          catchError((error: AxiosError) => {
            this.logger.error(
              `Merriam-Webster Collegiate API error: ${error.message}`,
            );
            if (error.response) {
              this.logger.error(
                `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`,
              );
            }
            throw new Error(
              `Failed to get word definition data: ${error.message}`,
            );
          }),
        ),
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error in getMerriamWebsterCollegiateData: ${error.message}`,
      );
      throw error;
    }
  }

  private async getMerriamWebsterThesaurusData(word: string): Promise<any> {
    try {
      const url = `https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${word}?key=${this.MERRIAM_WEBSTER_THESAURUS_KEY}`;
      this.logger.log(`Requesting Thesaurus data for word: ${word}`);

      const response = await firstValueFrom(
        this.httpService.get(url).pipe(
          timeout(8000),
          catchError((error: AxiosError) => {
            this.logger.error(
              `Merriam-Webster Thesaurus API error: ${error.message}`,
            );
            if (error.response) {
              this.logger.error(
                `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`,
              );
            }
            throw new Error(
              `Failed to get word thesaurus data: ${error.message}`,
            );
          }),
        ),
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error in getMerriamWebsterThesaurusData: ${error.message}`,
      );
      throw error;
    }
  }

  private processWordData(
    word: string,
    collegiateData: any,
    thesaurusData: any,
  ): Partial<WordData> {
    // Initialize with default empty values
    const result: WordData = {
      word: this.capitalizeFirstLetter(word),
      phonetic: '',
      partOfSpeech: 'noun', // Default part of speech
      definition: `Definition of ${word}`, // Default definition
      example: `The word "${word}" is commonly used in academic contexts.`, // Improved default example
      synonyms: [],
    };

    // Process collegiate data for pronunciation and definition
    if (
      Array.isArray(collegiateData) &&
      collegiateData.length > 0 &&
      typeof collegiateData[0] === 'object'
    ) {
      const entry = collegiateData[0];

      // Get phonetic pronunciation if available
      if (entry.hwi && entry.hwi.prs && entry.hwi.prs.length > 0) {
        result.phonetic = `/${entry.hwi.prs[0].mw}/`;
      }

      // Get part of speech
      if (entry.fl) {
        result.partOfSpeech = entry.fl;
      }

      // Get definition
      if (entry.shortdef && entry.shortdef.length > 0) {
        result.definition = this.capitalizeFirstLetter(entry.shortdef[0]);
      }

      // Attempt to get usage examples from collegiate data
      if (entry.def && Array.isArray(entry.def)) {
        // Try to find examples in different parts of the structure
        for (const def of entry.def) {
          if (def.sseq && Array.isArray(def.sseq)) {
            for (const sseqItem of def.sseq) {
              if (Array.isArray(sseqItem)) {
                for (const senseItem of sseqItem) {
                  if (
                    Array.isArray(senseItem) &&
                    senseItem.length > 1 &&
                    typeof senseItem[1] === 'object'
                  ) {
                    const sense = senseItem[1];

                    // Check for usage examples in dt field
                    if (sense.dt && Array.isArray(sense.dt)) {
                      for (const dt of sense.dt) {
                        if (
                          Array.isArray(dt) &&
                          dt[0] === 'vis' &&
                          Array.isArray(dt[1])
                        ) {
                          const examples = dt[1]
                            .filter((ex: any) => ex.t)
                            .map((ex: any) => {
                              // Extract and capitalize the example
                              const cleanExample = ex.t.replace(
                                /({\/it}|{it}|{\/wi}|{wi})/g,
                                '',
                              );
                              return this.capitalizeFirstLetter(cleanExample);
                            });

                          if (examples.length > 0) {
                            result.example = examples[0];
                            break;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // Process thesaurus data for examples and synonyms
    if (
      Array.isArray(thesaurusData) &&
      thesaurusData.length > 0 &&
      typeof thesaurusData[0] === 'object'
    ) {
      const entry = thesaurusData[0];

      // Get example from thesaurus data
      if (entry.def && Array.isArray(entry.def) && entry.def.length > 0) {
        const sseq = entry.def[0].sseq;
        if (
          Array.isArray(sseq) &&
          sseq.length > 0 &&
          Array.isArray(sseq[0]) &&
          sseq[0].length > 1
        ) {
          const sn = sseq[0][1];
          if (sn.dt && Array.isArray(sn.dt)) {
            // Look for usage examples
            for (const dt of sn.dt) {
              if (
                Array.isArray(dt) &&
                dt[0] === 'vis' &&
                Array.isArray(dt[1]) &&
                dt[1].length > 0
              ) {
                const examples = dt[1]
                  .map((ex: any) => {
                    if (ex.t) {
                      // Extract and capitalize the example
                      const cleanExample = ex.t.replace(
                        /({\/it}|{it}|{\/wi}|{wi})/g,
                        '',
                      );
                      return this.capitalizeFirstLetter(cleanExample);
                    }
                    return null;
                  })
                  .filter(Boolean);

                if (examples.length > 0) {
                  // Only override if we have a good example from thesaurus
                  const example = examples[0];
                  if (example) {
                    result.example = example;
                    break;
                  }
                }
              }
            }
          }

          // Get synonyms
          if (
            sn.syn_list &&
            Array.isArray(sn.syn_list) &&
            sn.syn_list.length > 0
          ) {
            result.synonyms = sn.syn_list[0]
              .map((s: any) => {
                if (s.wd) return s.wd;
                return null;
              })
              .filter(Boolean)
              .slice(0, 5);
          }
        }
      }
    }

    // Generate contextual example sentence if no example was found
    if (
      result.example ===
      `The word "${word}" is commonly used in academic contexts.`
    ) {
      // Create more natural examples based on part of speech
      result.example = this.generateDefaultExample(word, result.partOfSpeech || 'noun');
    }

    return result;
  }

  /**
   * Capitalize the first letter of a sentence
   */
  private capitalizeFirstLetter(text: string | null): string {
    if (!text || typeof text !== 'string' || text.length === 0) {
      return text || '';
    }

    // Trim any leading whitespace and capitalize the first character
    const trimmed = text.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  /**
   * Generates a more meaningful default example sentence based on part of speech
   */
  private generateDefaultExample(word: string, partOfSpeech: string): string {
    switch (partOfSpeech) {
      case 'noun': {
        return `The ${word} attracted everyone's attention at the meeting.`;
      }
      case 'verb': {
        // For verbs, create a more complete sentence with subject and object
        const subjects = [
          'The teacher',
          'She',
          'He',
          'The manager',
          'My friend',
        ];
        const objects = [
          'the project',
          'the task',
          'the problem',
          'the situation',
          'the discussion',
        ];
        const randomSubject =
          subjects[Math.floor(Math.random() * subjects.length)];
        const randomObject =
          objects[Math.floor(Math.random() * objects.length)];

        // Handle different verb forms correctly
        if (word.endsWith('s')) {
          // Third person singular present tense
          return `${randomSubject} ${word} ${randomObject} efficiently.`;
        } else if (word.endsWith('ed')) {
          // Past tense
          return `${randomSubject} ${word} ${randomObject} yesterday.`;
        } else if (word.endsWith('ing')) {
          // Present participle
          return `${randomSubject} is ${word} ${randomObject} right now.`;
        } else {
          // Base form
          return `${randomSubject} will ${word} ${randomObject} tomorrow.`;
        }
      }
      case 'adjective': {
        const nouns = [
          'design',
          'approach',
          'solution',
          'presentation',
          'idea',
        ];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        return `The ${word} ${randomNoun} received positive feedback from everyone.`;
      }
      case 'adverb': {
        const verbs = [
          'spoke',
          'worked',
          'responded',
          'performed',
          'completed the task',
        ];
        const randomVerb = verbs[Math.floor(Math.random() * verbs.length)];
        return `She ${randomVerb} ${word} during the entire meeting.`;
      }
      case 'pronoun': {
        return `${word.charAt(0).toUpperCase() + word.slice(1)} is responsible for completing the assignment.`;
      }
      case 'preposition': {
        return `The book is ${word} the table.`;
      }
      case 'conjunction': {
        return `I wanted to go to the park, ${word} it started raining.`;
      }
      case 'interjection': {
        return `"${word.charAt(0).toUpperCase() + word.slice(1)}!" she exclaimed with surprise.`;
      }
      default: {
        return `The term "${word}" is commonly used in professional contexts.`;
      }
    }
  }

  /**
   * Make a reasonable guess at part of speech based on word endings
   */
  private guessPartOfSpeech(word: string): string {
    const lowerWord = word.toLowerCase();

    // Common verb endings
    if (
      lowerWord.endsWith('ing') ||
      lowerWord.endsWith('ate') ||
      lowerWord.endsWith('ize') ||
      lowerWord.endsWith('ise') ||
      lowerWord.endsWith('en') ||
      (lowerWord.endsWith('s') &&
        !lowerWord.endsWith('ous') &&
        !lowerWord.endsWith('ss'))
    ) {
      return 'verb';
    }

    // Common adjective endings
    if (
      lowerWord.endsWith('al') ||
      lowerWord.endsWith('ive') ||
      lowerWord.endsWith('ous') ||
      lowerWord.endsWith('ful') ||
      lowerWord.endsWith('ic') ||
      lowerWord.endsWith('able') ||
      lowerWord.endsWith('ible')
    ) {
      return 'adjective';
    }

    // Common adverb endings
    if (lowerWord.endsWith('ly')) {
      return 'adverb';
    }

    // Common noun endings
    if (
      lowerWord.endsWith('tion') ||
      lowerWord.endsWith('sion') ||
      lowerWord.endsWith('ness') ||
      lowerWord.endsWith('ity') ||
      lowerWord.endsWith('ment') ||
      lowerWord.endsWith('ance') ||
      lowerWord.endsWith('ence')
    ) {
      return 'noun';
    }

    // Default to noun if we can't determine
    return 'noun';
  }

  /**
   * Get a random word from the database
   */
  async getRandomWord(): Promise<Word | null> {
    try {
      const wordCount = await this.prisma.word.count();

      if (wordCount === 0) {
        this.logger.warn('No words found in database');
        return null;
      }

      const randomSkip = Math.floor(Math.random() * wordCount);

      const randomWord = await this.prisma.word.findFirst({
        skip: randomSkip,
      });

      return randomWord;
    } catch (error: any) {
      this.logger.error(
        `Failed to get random word: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }
}
