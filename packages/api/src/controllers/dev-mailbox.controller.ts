import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { Public } from '../common/decorators';
import { ConsoleEmailService } from '../services/ConsoleEmailService';

@Controller('dev/mailbox')
export class DevMailboxController {
  @Public()
  @Get('verification-token')
  getVerificationToken(@Query('email') email: string) {
    const token = ConsoleEmailService.getVerificationToken(email);
    if (!token) {
      throw new NotFoundException('No verification token found for this email');
    }
    return { token };
  }
}
