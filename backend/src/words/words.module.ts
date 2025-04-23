import { Module } from '@nestjs/common';
import { WordsService } from './words.service';
import { WordsController } from './words.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { WordService } from './services/word.service';
import { WordApiService } from './services/word-api.service';
import { WordImageConnectorService } from './services/word-image-connector.service';
import { WordController } from './controllers/word.controller';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [WordsController, WordController],
  providers: [
    WordsService,
    WordService,
    WordApiService,
    WordImageConnectorService,
  ],
  exports: [WordsService, WordService],
})
export class WordsModule {}
