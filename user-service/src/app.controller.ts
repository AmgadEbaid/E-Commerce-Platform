import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @MessagePattern({ cmd: 'sum' })
  accumulate(data: number[]): number {
    console.log('user-service data:', data);
    return (data || []).reduce((a, b) => a + b);
  }
}
