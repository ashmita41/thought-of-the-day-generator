import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Word } from './types/word.types';
import axios from 'axios';
import { Cron } from '@nestjs/schedule';

// Dictionary API URL
const DICTIONARY_API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

// Seed words in case API fails
const SEED_WORDS = [
  {
    word: 'serendipity',
    phonetic: '/ˌsɛrənˈdɪpɪti/',
    definition:
      'The faculty or phenomenon of finding valuable or agreeable things not sought for',
    example: 'The discovery was a perfect example of serendipity',
    partOfSpeech: 'noun',
    source: 'seed',
  },
  {
    word: 'eloquent',
    phonetic: '/ˈɛləkwənt/',
    definition: 'Fluent or persuasive in speaking or writing',
    example: 'She gave an eloquent speech that moved the audience',
    partOfSpeech: 'adjective',
    source: 'seed',
  },
  {
    word: 'resilience',
    phonetic: '/rɪˈzɪliəns/',
    definition: 'The capacity to recover quickly from difficulties; toughness',
    example: 'The resilience of the human spirit is remarkable',
    partOfSpeech: 'noun',
    source: 'seed',
  },
  {
    word: 'ephemeral',
    phonetic: '/ɪˈfɛm(ə)rəl/',
    definition: 'Lasting for a very short time',
    example: 'The ephemeral nature of fashion trends',
    partOfSpeech: 'adjective',
    source: 'seed',
  },
  {
    word: 'ubiquitous',
    phonetic: '/juːˈbɪkwɪtəs/',
    definition: 'Present, appearing, or found everywhere',
    example: 'Mobile phones are now ubiquitous in modern society',
    partOfSpeech: 'adjective',
    source: 'seed',
  },
];

@Injectable()
export class WordsService implements OnModuleInit {
  private readonly logger = new Logger(WordsService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    try {
      // Check if there are any words in the database
      const count = await this.prisma.word.count();

      if (count === 0) {
        this.logger.log('No words found in database. Seeding initial words...');
        // Seed the database with initial words
        await this.seedInitialWords();
      } else {
        this.logger.log(`Found ${count} words in database.`);
      }

      // Fetch new words during initialization regardless of existing word count
      await this.fetchNewWords(5);

      // Ensure we have enough words to avoid repetition
      const minWordsNeeded = 30; // Ensure at least 30 words for a month of no repetition
      if (count < minWordsNeeded) {
        this.logger.log(
          `Need more words to avoid repetition. Fetching additional words...`,
        );
        await this.fetchNewWords(minWordsNeeded - count);
      }
    } catch (error) {
      this.logger.error('Error during module initialization:', error);
    }
  }

  @Cron('0 0 * * *') // Run daily at midnight
  async fetchWordsDaily() {
    this.logger.log('Running scheduled word fetch');
    await this.fetchNewWords(3);
  }

  async seedInitialWords() {
    try {
      this.logger.log('Seeding database with initial words...');

      for (const wordData of SEED_WORDS) {
        try {
          await this.prisma.word.create({
            data: {
              word: wordData.word,
              phonetic: wordData.phonetic,
              partOfSpeech: wordData.partOfSpeech,
              definition: wordData.definition,
              example: wordData.example,
              source: wordData.source,
              usageCount: 0,
            },
          });
        } catch (error) {
          if (error.code === 'P2002') {
            this.logger.log(`Seed word already exists: ${wordData.word}`);
          } else {
            this.logger.error(`Error seeding word: ${error.message}`);
          }
        }
      }

      this.logger.log('Initial words seeded successfully.');
    } catch (error) {
      this.logger.error('Failed to seed initial words', error);
    }
  }

  async fetchNewWords(limit = 5): Promise<Word[]> {
    const allFetchedWords: Word[] = [];
    this.logger.log(`Attempting to fetch ${limit} new English words...`);

    // Words to try fetching from the API
    // Add more reliable common words that are likely to exist in the dictionary
    const wordList = [
      'success',
      'journey',
      'achieve',
      'inspire',
      'balance',
      'create',
      'focus',
      'growth',
      'learn',
      'wisdom',
      'freedom',
      'patience',
      'respect',
      'change',
      'clarity',
      'courage',
      'passion',
      'purpose',
      'vision',
      'strength',
      'innovation',
      'perseverance',
      'cognition',
      'meticulous',
      'paradigm',
      'ambivalent',
      'prudent',
      'arbitrary',
      'benevolent',
      'cryptic',
      'diligent',
      'eloquent',
      'fastidious',
      'gregarious',
      'intricate',
      'jubilant',
      'luminous',
      'nostalgia',
      'opulent',
      'peculiar',
      'quintessential',
      'resilient',
      'superfluous',
      'tranquil',
      'ubiquitous',
      'vehement',
      'whimsical',
      'aesthetic',
      'brevity',
      'cacophony',
    ];

    // Shuffle the array to get random words each time
    const shuffledWords = wordList.sort(() => 0.5 - Math.random());

    // Take twice the needed amount to have fallbacks in case of API failures
    const wordsToFetch = shuffledWords.slice(0, limit * 2);
    let successCount = 0;

    for (const wordToFetch of wordsToFetch) {
      // If we've already fetched enough words, break
      if (successCount >= limit) {
        break;
      }

      try {
        // Check if word already exists in database
        const existingWord = await this.prisma.word.findUnique({
          where: { word: wordToFetch },
        });

        if (existingWord) {
          this.logger.debug(
            `Word '${wordToFetch}' already exists in database, skipping...`,
          );
          continue;
        }

        this.logger.debug(`Fetching word data for: ${wordToFetch}`);

        const response = await axios.get(
          `${DICTIONARY_API_URL}/${wordToFetch}`,
          {
            timeout: 10000,
            headers: {
              Accept: 'application/json',
              'User-Agent': 'WordOfTheDay/1.0',
            },
            validateStatus: (status) => status < 500, // Accept 4xx errors to handle them gracefully
          },
        );

        // Handle 404 (word not found) gracefully
        if (response.status === 404) {
          this.logger.warn(
            `Word '${wordToFetch}' not found in dictionary API, skipping...`,
          );
          continue;
        }

        if (
          !response.data ||
          !Array.isArray(response.data) ||
          response.data.length === 0
        ) {
          this.logger.warn(`No data returned for word: ${wordToFetch}`);
          continue;
        }

        const wordData = response.data[0];

        if (
          !wordData?.word ||
          !wordData?.meanings ||
          wordData.meanings.length === 0
        ) {
          this.logger.warn(`Invalid word data for: ${wordToFetch}`);
          continue;
        }

        // Get the first meaning and its first definition
        const meaning = wordData.meanings[0];
        const definition =
          meaning?.definitions && meaning.definitions.length > 0
            ? meaning.definitions[0].definition
            : null;

        const example =
          meaning?.definitions &&
          meaning.definitions.length > 0 &&
          meaning.definitions[0].example
            ? meaning.definitions[0].example
            : null;

        if (!definition) {
          this.logger.warn(`No definition found for word: ${wordToFetch}`);
          continue;
        }

        // Find audio URL if available
        let audioUrl = null;
        if (wordData.phonetics && wordData.phonetics.length > 0) {
          for (const phonetic of wordData.phonetics) {
            if (phonetic.audio && phonetic.audio.trim() !== '') {
              audioUrl = phonetic.audio;
              break;
            }
          }
        }

        // Create the word in the database
        const savedWord = await this.prisma.word.create({
          data: {
            word: wordData.word,
            phonetic: wordData.phonetic || null,
            audio: audioUrl,
            partOfSpeech: meaning.partOfSpeech || null,
            definition: definition,
            example: example,
            source: 'dictionaryapi.dev',
            usageCount: 0,
          },
        });

        this.logger.debug(`Successfully saved word: ${savedWord.word}`);
        allFetchedWords.push(savedWord);
        successCount++;

        // Add a small delay between requests to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        // Only log detailed errors for non-404 responses
        if (axios.isAxiosError(error) && error.response?.status !== 404) {
          this.logger.error(`Error fetching word '${wordToFetch}':`, error);
          if (error.response) {
            this.logger.error(
              `Response status: ${error.response.status}, data:`,
              error.response.data,
            );
          } else if (error.request) {
            this.logger.error('No response received');
          }
        } else {
          this.logger.warn(
            `Problem fetching word '${wordToFetch}': ${error.message}`,
          );
        }
      }
    }

    this.logger.log(
      `Total new words fetched and saved: ${allFetchedWords.length}`,
    );

    // If we couldn't fetch enough words from the API, use seed words
    if (allFetchedWords.length < limit) {
      this.logger.warn(
        `Could only fetch ${allFetchedWords.length} words, adding seed words to meet the limit of ${limit}`,
      );
      await this.seedInitialWords();
    }

    return allFetchedWords;
  }

  async getRandomWord(): Promise<Word | null> {
    try {
      // Check if any words exist
      const wordsCount = await this.prisma.word.count();

      if (wordsCount === 0) {
        this.logger.warn(
          'No words found in database. Seeding initial words...',
        );
        await this.seedInitialWords();
        // Try again after seeding
        return this.getRandomWord();
      }

      // Find words that haven't been used recently or have been used less frequently
      const words = await this.prisma.word.findMany({
        orderBy: [{ lastUsedAt: 'asc' }, { usageCount: 'asc' }],
        take: 5, // Get top 5 least recently used words
      });

      if (words.length === 0) {
        this.logger.warn('No words available after filtering');
        return null;
      }

      // Randomly select one from the 5 least used words
      const selectedWord = words[Math.floor(Math.random() * words.length)];

      // Update the word's usage statistics
      await this.prisma.word.update({
        where: { id: selectedWord.id },
        data: {
          lastUsedAt: new Date(),
          usageCount: selectedWord.usageCount + 1,
        },
      });

      return selectedWord;
    } catch (error) {
      this.logger.error('Error getting random word:', error);
      return null;
    }
  }

  async getAllWords(): Promise<Word[]> {
    return this.prisma.word.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
