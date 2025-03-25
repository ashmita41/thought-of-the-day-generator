import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuotesModule } from './quotes/quotes.module';

@Module({
  imports: [
    HttpModule,
    QuotesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}