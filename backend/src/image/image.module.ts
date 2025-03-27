import { Module } from '@nestjs/common';
import { ImageService } from './services/image.service';
import { ImageController } from './controllers/image.controller';
import { TextUtilsService } from './services/text-utils.service';
import { QuotesModule } from '../quotes/quotes.module';
import { DesignModule } from '../design/design.module';

@Module({
  imports: [
    QuotesModule,
    DesignModule
  ],
  controllers: [ImageController],
  providers: [
    ImageService, 
    TextUtilsService
  ],
  exports: [ImageService]
})
export class ImageModule {}