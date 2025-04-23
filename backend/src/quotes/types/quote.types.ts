// This file provides a way to use Quote type without importing from @prisma/client everywhere

export type Quote = {
  id: string;
  text: string;
  author: string;
  source: string;
  lastUsedAt: Date | null;
  usageCount: number;
  createdAt: Date;
  category: string | null;
};

// Custom input types without using Prisma
export type QuoteCreateInput = Omit<Quote, 'id' | 'createdAt'> & {
  id?: string;
  createdAt?: Date;
};

export type QuoteUpdateInput = Partial<QuoteCreateInput>;
