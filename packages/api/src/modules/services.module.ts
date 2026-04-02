import { Module } from '@nestjs/common';
import { BcryptPasswordHasher, JwtService } from '../services';
import { PASSWORD_HASHER, JWT_SERVICE } from './tokens';

@Module({
  providers: [
    {
      provide: PASSWORD_HASHER,
      useFactory: () => new BcryptPasswordHasher(),
    },
    {
      provide: JWT_SERVICE,
      useFactory: () => new JwtService(),
    },
  ],
  exports: [PASSWORD_HASHER, JWT_SERVICE],
})
export class ServicesModule {}
