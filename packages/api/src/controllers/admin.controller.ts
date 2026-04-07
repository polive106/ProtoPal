import {
  Controller,
  Post,
  Param,
  Inject,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import type { LoginAttemptRepository } from '@acme/domain';
import { Roles } from '../common/decorators';
import { LOGIN_ATTEMPT_REPOSITORY } from '../modules/tokens';
import { AuditLogService, AuditAction } from '../services';

@Controller('admin')
export class AdminController {
  constructor(
    @Inject(LOGIN_ATTEMPT_REPOSITORY) private readonly loginAttemptRepo: LoginAttemptRepository,
    @Inject(AuditLogService) private readonly auditLogService: AuditLogService,
  ) {}

  @Post('unlock-account/:email')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async unlockAccount(
    @Param('email') email: string,
    @Req() req: Request,
  ) {
    await this.loginAttemptRepo.unlockAccount(email);

    this.auditLogService.log({
      action: AuditAction.ACCOUNT_UNLOCKED,
      ip: req.ip,
      outcome: 'success',
      metadata: { unlockedEmail: email },
    });

    return { message: `Account ${email} has been unlocked.` };
  }
}
