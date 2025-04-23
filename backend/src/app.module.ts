import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { QuotesModule } from './quotes/quotes.module';
import { WordsModule } from './words/words.module';
import { DesignModule } from './design/design.module';
import { ImageModule } from './image/image.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule.register({
      timeout: 15000, // 15 seconds global timeout
      maxRedirects: 5,
      headers: {
        'User-Agent': 'ThoughtOfTheDay/1.0',
        Accept: 'application/json',
      },
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    QuotesModule,
    WordsModule,
    DesignModule,
    ImageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
