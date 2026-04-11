import { Module } from '@nestjs/common';
import {
  createConnection,
  createMongoConnection,
  type DatabaseConnection,
  DrizzleUserRepository,
  DrizzleRoleRepository,
  DrizzleUserRoleRepository,
  DrizzleNoteRepository,
  DrizzleTokenBlacklistRepository,
  DrizzleRateLimitRepository,
  DrizzleVerificationTokenRepository,
  DrizzlePasswordResetTokenRepository,
  DrizzleLoginAttemptRepository,
  MongoUserRepository,
  MongoRoleRepository,
  MongoUserRoleRepository,
  MongoNoteRepository,
  MongoTokenBlacklistRepository,
  MongoRateLimitRepository,
  MongoVerificationTokenRepository,
  MongoPasswordResetTokenRepository,
  MongoLoginAttemptRepository,
} from '@acme/database';
import type { Db } from 'mongodb';
import {
  DATABASE_CONNECTION,
  USER_REPOSITORY,
  ROLE_REPOSITORY,
  USER_ROLE_REPOSITORY,
  NOTE_REPOSITORY,
  TOKEN_BLACKLIST_REPOSITORY,
  RATE_LIMIT_REPOSITORY,
  VERIFICATION_TOKEN_REPOSITORY,
  PASSWORD_RESET_TOKEN_REPOSITORY,
  LOGIN_ATTEMPT_REPOSITORY,
} from './tokens';

const isMongoEnabled = () => !!process.env.MONGODB_URL;

function repositoryProvider(
  token: string,
  AdapterClass: new (db: DatabaseConnection) => unknown,
) {
  return {
    provide: token,
    useFactory: (db: DatabaseConnection) => new AdapterClass(db),
    inject: [DATABASE_CONNECTION],
  };
}

function mongoRepositoryProvider(
  token: string,
  AdapterClass: new (db: Db) => unknown,
) {
  return {
    provide: token,
    useFactory: (db: Db) => new AdapterClass(db),
    inject: [DATABASE_CONNECTION],
  };
}

function getRepositoryProviders() {
  if (isMongoEnabled()) {
    return [
      mongoRepositoryProvider(USER_REPOSITORY, MongoUserRepository),
      mongoRepositoryProvider(ROLE_REPOSITORY, MongoRoleRepository),
      mongoRepositoryProvider(USER_ROLE_REPOSITORY, MongoUserRoleRepository),
      mongoRepositoryProvider(NOTE_REPOSITORY, MongoNoteRepository),
      mongoRepositoryProvider(TOKEN_BLACKLIST_REPOSITORY, MongoTokenBlacklistRepository),
      mongoRepositoryProvider(RATE_LIMIT_REPOSITORY, MongoRateLimitRepository),
      mongoRepositoryProvider(VERIFICATION_TOKEN_REPOSITORY, MongoVerificationTokenRepository),
      mongoRepositoryProvider(PASSWORD_RESET_TOKEN_REPOSITORY, MongoPasswordResetTokenRepository),
      mongoRepositoryProvider(LOGIN_ATTEMPT_REPOSITORY, MongoLoginAttemptRepository),
    ];
  }
  return [
    repositoryProvider(USER_REPOSITORY, DrizzleUserRepository),
    repositoryProvider(ROLE_REPOSITORY, DrizzleRoleRepository),
    repositoryProvider(USER_ROLE_REPOSITORY, DrizzleUserRoleRepository),
    repositoryProvider(NOTE_REPOSITORY, DrizzleNoteRepository),
    repositoryProvider(TOKEN_BLACKLIST_REPOSITORY, DrizzleTokenBlacklistRepository),
    repositoryProvider(RATE_LIMIT_REPOSITORY, DrizzleRateLimitRepository),
    repositoryProvider(VERIFICATION_TOKEN_REPOSITORY, DrizzleVerificationTokenRepository),
    repositoryProvider(PASSWORD_RESET_TOKEN_REPOSITORY, DrizzlePasswordResetTokenRepository),
    repositoryProvider(LOGIN_ATTEMPT_REPOSITORY, DrizzleLoginAttemptRepository),
  ];
}

@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: async () => {
        const mongoUrl = process.env.MONGODB_URL;
        if (mongoUrl) {
          const conn = await createMongoConnection(mongoUrl);
          return conn.db;
        }
        return createConnection();
      },
    },
    ...getRepositoryProviders(),
  ],
  exports: [
    DATABASE_CONNECTION,
    USER_REPOSITORY,
    ROLE_REPOSITORY,
    USER_ROLE_REPOSITORY,
    NOTE_REPOSITORY,
    TOKEN_BLACKLIST_REPOSITORY,
    RATE_LIMIT_REPOSITORY,
    VERIFICATION_TOKEN_REPOSITORY,
    PASSWORD_RESET_TOKEN_REPOSITORY,
    LOGIN_ATTEMPT_REPOSITORY,
  ],
})
export class DatabaseModule {}
