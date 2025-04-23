import { Injectable } from '@nestjs/common';
import { DesignConfigRepository } from '../repositories/design-config.repository';
import { DesignConfig } from '../interfaces/design-config.interface';

@Injectable()
export class DesignService {
  constructor(
    private readonly designConfigRepository: DesignConfigRepository,
  ) {}

  getRandomDesign(): DesignConfig {
    return this.designConfigRepository.findRandomDesign();
  }

  findByDay(day: string): DesignConfig {
    return this.designConfigRepository.findFixedDesignByDay(day);
  }

  findAll(): DesignConfig[] {
    return this.designConfigRepository.findAllDesigns();
  }
}
