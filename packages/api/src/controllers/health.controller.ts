import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Public()
  @Get('ready')
  ready() {
    return { status: 'ready', timestamp: new Date().toISOString() };
  }
}
