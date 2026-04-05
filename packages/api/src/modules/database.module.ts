import { Module } from '@nestjs/common';
import {
  createConnection,
  type DatabaseConnection,
  DrizzleUserRepository,
  DrizzleRoleRepository,
  DrizzleUserRoleRepository,
  DrizzleNoteRepository,
  DrizzleTokenBlacklistRepository,
  DrizzleVerificationTokenRepository,
} from '@acme/database';
import {
  DATABASE_CONNECTION,
  USER_REPOSITORY,
  ROLE_REPOSITORY,
  USER_ROLE_REPOSITORY,
  NOTE_REPOSITORY,
  TOKEN_BLACKLIST_REPOSITORY,
  VERIFICATION_TOKEN_REPOSITORY,
} from './tokens';

function repositoryProvider(token: string, AdapterClass: new (db: DatabaseConnection) => unknown) {
  return {
    provide: token,
    useFactory: (db: DatabaseConnection) => new AdapterClass(db),
    inject: [DATABASE_CONNECTION],
  };
}

@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: async () => createConnection(),
    },
    repositoryProvider(USER_REPOSITORY, DrizzleUserRepository),
    repositoryProvider(ROLE_REPOSITORY, DrizzleRoleRepository),
    repositoryProvider(USER_ROLE_REPOSITORY, DrizzleUserRoleRepository),
    repositoryProvider(NOTE_REPOSITORY, DrizzleNoteRepository),
    repositoryProvider(TOKEN_BLACKLIST_REPOSITORY, DrizzleTokenBlacklistRepository),
    repositoryProvider(VERIFICATION_TOKEN_REPOSITORY, DrizzleVerificationTokenRepository),
  ],
  exports: [
    DATABASE_CONNECTION,
    USER_REPOSITORY,
    ROLE_REPOSITORY,
    USER_ROLE_REPOSITORY,
    NOTE_REPOSITORY,
    TOKEN_BLACKLIST_REPOSITORY,
    VERIFICATION_TOKEN_REPOSITORY,
  ],
})
export class DatabaseModule {}
