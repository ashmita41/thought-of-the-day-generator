// src/design/design.module.ts
import { Module } from '@nestjs/common';
import { DesignService } from './services/design.service';
import { DesignController } from './controllers/design.controller';
import { DesignConfigRepository } from './repositories/design-config.repository';
import { DesignConfigsProvider } from './config/design-configs.provider';

@Module({
  controllers: [DesignController],
  providers: [DesignService, DesignConfigRepository, DesignConfigsProvider],
  exports: [DesignService]
})
export class DesignModule {}