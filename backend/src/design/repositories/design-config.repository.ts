// src/design/repositories/design-config.repository.ts
import { Injectable } from '@nestjs/common';
import { DesignConfigsProvider } from '../config/design-configs.provider';
import { DesignConfig } from '../interfaces/design-config.interface';

@Injectable()
export class DesignConfigRepository {
  constructor(private readonly configsProvider: DesignConfigsProvider) {}
  
  findRandomDesign(): DesignConfig {
    return this.configsProvider.getRandomDesign();
  }
  
  findFixedDesignByDay(day: string): DesignConfig {
    const design = this.configsProvider.getFixedDesignByDay(day);
    return design || this.findRandomDesign();
  }
  
  findAllDesigns(): DesignConfig[] {
    return [
      ...this.configsProvider.getAllDesigns(),
      this.findRandomDesign()
    ];
  }
}