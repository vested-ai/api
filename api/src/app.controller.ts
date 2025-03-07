import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): any {
    return this.appService.getHello();
  }

  @Get('test')
  getTest(): any {
    return this.appService.getTest();
  }

  @Get('status')
  getStatus(): any {
    return this.appService.getStatus();
  }
} 