import { Module } from '@nestjs/common';
import { ImageService } from './services/image.service';
import { QuoteImageService } from './services/quote-image.service';
import { WordImageService } from './services/word-image.service';
import { QuoteImageController } from './controllers/quote-image.controller';
import { WordImageController } from './controllers/word-image.controller';
import { TextUtilsService } from './services/text-utils.service';
import { QuotesModule } from '../quotes/quotes.module';
import { DesignModule } from '../design/design.module';
import { WordsModule } from '../words/words.module';

@Module({
  imports: [QuotesModule, DesignModule, WordsModule],
  controllers: [QuoteImageController, WordImageController],
  providers: [
    ImageService,
    QuoteImageService,
    WordImageService,
    TextUtilsService,
  ],
  exports: [ImageService, QuoteImageService, WordImageService],
})
export class ImageModule {}
