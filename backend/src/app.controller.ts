import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller()
export class AppController {
  constructor(@InjectConnection() private connection: Connection) {}

  @Get('health')
  getHealth() {
    const dbStatus = this.connection.readyState === 1 ? 'up' : 'down';
    if (dbStatus === 'down') {
      throw new HttpException({ status: 'down', database: dbStatus }, HttpStatus.SERVICE_UNAVAILABLE);
    }
    return { status: 'ok', database: dbStatus };
  }
}
