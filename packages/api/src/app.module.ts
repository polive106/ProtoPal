import { Module } from '@nestjs/common';
import { DomainModule } from './modules';
import { AuthController } from './controllers/auth.controller';
import { NotesController } from './controllers/notes.controller';
import { HealthController } from './controllers/health.controller';

@Module({
  imports: [DomainModule],
  controllers: [AuthController, NotesController, HealthController],
})
export class AppModule {}
