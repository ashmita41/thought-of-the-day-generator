// src/design/design.module.ts
import { Module } from '@nestjs/common';
import { DesignService } from './services/design.service';
import { DesignController } from './controllers/design.controller';
import { DesignConfigRepository } from './repositories/design-config.repository';

@Module({
  controllers: [DesignController],
  providers: [DesignService, DesignConfigRepository],
  exports: [DesignService]
})
export class DesignModule {}