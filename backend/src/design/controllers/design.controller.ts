import { Controller, Get, Param } from '@nestjs/common';
import { DesignService } from '../services/design.service';
import { DesignConfig } from '../interfaces/design-config.interface';

@Controller('design')
export class DesignController {
  constructor(private readonly designService: DesignService) {}

  @Get('random')
  getRandomDesign(): DesignConfig {
    return this.designService.getRandomDesign();
  }

  @Get('fixed/:day')
  getFixedDesign(@Param('day') day: string): DesignConfig {
    return this.designService.findByDay(day);
  }

  @Get('all')
  getAllDesigns(): DesignConfig[] {
    return this.designService.findAll();
  }
}