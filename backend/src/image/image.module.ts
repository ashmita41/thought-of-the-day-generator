import { Module } from '@nestjs/common';
import { ImageService } from './services/image.service';
import { ImageController } from './controllers/image.controller';
import { TextUtilsService } from './services/text-utils.service';
import { QuotesModule } from '../quotes/quotes.module';
import { DesignModule } from '../design/design.module';
import { WordsModule } from '../words/words.module';
import { WordImageController } from './controllers/word-image.controller';
import { WordImageService } from './services/word-image.service';
import { QuoteImageService } from './services/quote-image.service';
import { QuoteImageController } from './controllers/quote-image.controller';

@Module({
  imports: [
    QuotesModule,
    DesignModule,
    WordsModule
  ],
  controllers: [
    ImageController,
    WordImageController,
    QuoteImageController
  ],
  providers: [
    ImageService, 
    TextUtilsService,
    WordImageService,
    QuoteImageService
  ],
  exports: [ImageService, WordImageService, QuoteImageService]
})
export class ImageModule {}