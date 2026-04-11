import { Module } from '@nestjs/common';
import {
  createConnection,
  createMongoConnection,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function repositoryProvider(token: string, AdapterClass: new (db: any) => unknown) {
  return {
    provide: token,
    useFactory: (db: unknown) => new AdapterClass(db),
    inject: [DATABASE_CONNECTION],
  };
}

function getRepositoryProviders() {
  if (isMongoEnabled()) {
    return [
      repositoryProvider(USER_REPOSITORY, MongoUserRepository),
      repositoryProvider(ROLE_REPOSITORY, MongoRoleRepository),
      repositoryProvider(USER_ROLE_REPOSITORY, MongoUserRoleRepository),
      repositoryProvider(NOTE_REPOSITORY, MongoNoteRepository),
      repositoryProvider(TOKEN_BLACKLIST_REPOSITORY, MongoTokenBlacklistRepository),
      repositoryProvider(RATE_LIMIT_REPOSITORY, MongoRateLimitRepository),
      repositoryProvider(VERIFICATION_TOKEN_REPOSITORY, MongoVerificationTokenRepository),
      repositoryProvider(PASSWORD_RESET_TOKEN_REPOSITORY, MongoPasswordResetTokenRepository),
      repositoryProvider(LOGIN_ATTEMPT_REPOSITORY, MongoLoginAttemptRepository),
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
