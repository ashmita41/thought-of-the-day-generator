// This file is optional but provides a way to use Quote type without importing from @prisma/client everywhere
import { Quote as PrismaQuote } from '@prisma/client';

export type Quote = PrismaQuote;