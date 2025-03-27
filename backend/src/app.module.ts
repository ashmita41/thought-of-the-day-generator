import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuotesModule } from './quotes/quotes.module';
import { DesignModule } from './design/design.module';
import { ImageModule } from './image/image.module';
import databaseConfig from './config/database.config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig]
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        return configService.get('database') as TypeOrmModuleOptions;
      },
      inject: [ConfigService]
    }),
    QuotesModule,
    DesignModule,
    ImageModule  // Added ImageModule to the imports array
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}