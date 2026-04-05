import { Module } from '@nestjs/common';
import { BcryptPasswordHasher, JwtService } from '../services';
import { CryptoTokenGenerator } from '../services/CryptoTokenGenerator';
import { ConsoleEmailService } from '../services/ConsoleEmailService';
import { PreviewEmailService } from '../services/PreviewEmailService';
import { PASSWORD_HASHER, JWT_SERVICE, EMAIL_SERVICE, TOKEN_GENERATOR } from './tokens';

@Module({
  providers: [
    {
      provide: PASSWORD_HASHER,
      useFactory: () => new BcryptPasswordHasher(),
    },
    {
      provide: JWT_SERVICE,
      useFactory: () => new JwtService(process.env.JWT_SECRET!),
    },
    {
      provide: TOKEN_GENERATOR,
      useFactory: () => new CryptoTokenGenerator(),
    },
    {
      provide: EMAIL_SERVICE,
      useFactory: () => {
        if (process.env.NODE_ENV === 'test') {
          return new ConsoleEmailService();
        }
        return new PreviewEmailService();
      },
    },
  ],
  exports: [PASSWORD_HASHER, JWT_SERVICE, TOKEN_GENERATOR, EMAIL_SERVICE],
})
export class ServicesModule {}
