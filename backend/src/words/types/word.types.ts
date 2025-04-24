// This file provides a way to use Word type without importing from @prisma/client everywhere

export type Word = {
  id: string;
  word: string;
  phonetic: string | null;
  audio: string | null;
  partOfSpeech: string | null;
  definition: string;
  example: string | null;
  source: string | null;
  lastUsedAt: Date | null;
  usageCount: number;
  createdAt: Date;
};

// Custom input types without using Prisma
export type WordCreateInput = Omit<Word, 'id' | 'createdAt'> & {
  id?: string;
  createdAt?: Date;
};

export type WordUpdateInput = Partial<WordCreateInput>;
