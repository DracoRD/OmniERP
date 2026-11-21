import { Module, Controller, Get } from '@nestjs/common';

@Controller('health')
class HealthController {
  @Get()
  check() { return { name: 'OmniERP API', status: 'ok', version: '0.1.0' }; }
}

@Module({ controllers: [HealthController] })
export class AppModule {}
