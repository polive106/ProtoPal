import { Module } from '@nestjs/common';
import { DomainModule } from './modules';
import { AuthController } from './controllers/auth.controller';
import { NotesController } from './controllers/notes.controller';
import { HealthController } from './controllers/health.controller';
import { TokenCleanupService } from './services/TokenCleanupService';
import { AuditLogService } from './services';

@Module({
  imports: [DomainModule],
  controllers: [AuthController, NotesController, HealthController],
  providers: [TokenCleanupService, AuditLogService],
})
export class AppModule {}
