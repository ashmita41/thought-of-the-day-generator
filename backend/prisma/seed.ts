import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", source: "seed" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon", source: "seed" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", source: "seed" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill", source: "seed" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker", source: "seed" }
];

async function main() {
  console.log(`Start seeding ...`);
  
  for (const quote of SEED_QUOTES) {
    try {
      const result = await prisma.quote.create({
        data: quote
      });
      console.log(`Created quote with ID: ${result.id}`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`Quote already exists: ${quote.text}`);
      } else {
        console.error(`Error creating quote: ${error.message}`);
      }
    }
  }
  
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });