import { Module } from '@nestjs/common';
import { DomainModule } from './modules';
import { AuthController } from './controllers/auth.controller';
import { AdminController } from './controllers/admin.controller';
import { NotesController } from './controllers/notes.controller';
import { HealthController } from './controllers/health.controller';
import { DevMailboxController } from './controllers/dev-mailbox.controller';
import { TokenCleanupService } from './services/TokenCleanupService';
import { AuditLogService } from './services';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const controllers: any[] = [AuthController, AdminController, NotesController, HealthController];
if (process.env.NODE_ENV !== 'production') {
  controllers.push(DevMailboxController);
}

@Module({
  imports: [DomainModule],
  controllers,
  providers: [TokenCleanupService, AuditLogService],
})
export class AppModule {}
