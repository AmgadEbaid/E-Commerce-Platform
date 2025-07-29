import { Body, Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,@Inject('NATS_SERVICE') private client: ClientProxy) {}

   @Get('sum')
  doMath(@Body() Body:number[]): any {
    console.log('api data:', Body);
    return this.client.send({ cmd: 'sum' }, Body);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
