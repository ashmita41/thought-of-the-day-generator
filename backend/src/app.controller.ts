import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getThoughtOfTheDay() {
    return this.appService.getThoughtOfTheDay();
  }

  @Get('/hello')
  getHello(): string {
    return this.appService.getHello();
  }
}