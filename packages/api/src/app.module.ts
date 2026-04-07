import { Module } from '@nestjs/common';
import { DomainModule } from './modules';
import { AuthController } from './controllers/auth.controller';
import { AdminController } from './controllers/admin.controller';
import { NotesController } from './controllers/notes.controller';
import { HealthController } from './controllers/health.controller';
import { TokenCleanupService } from './services/TokenCleanupService';
import { AuditLogService } from './services';

@Module({
  imports: [DomainModule],
  controllers: [AuthController, AdminController, NotesController, HealthController],
  providers: [TokenCleanupService, AuditLogService],
})
export class AppModule {}
