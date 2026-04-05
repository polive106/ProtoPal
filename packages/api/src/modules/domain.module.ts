import { Module } from '@nestjs/common';
import type {
  UserRepository,
  RoleRepository,
  UserRoleRepository,
  NoteRepository,
  PasswordHasher,
  VerificationTokenRepository,
  EmailService,
  TokenGenerator,
} from '@acme/domain';
import {
  RegisterUser,
  LoginUser,
  GetUserRoles,
  CreateNote,
  ListNotes,
  UpdateNote,
  DeleteNote,
  GetNote,
  VerifyEmail,
  ResendVerification,
} from '@acme/domain';
import { DatabaseModule } from './database.module';
import { ServicesModule } from './services.module';
import {
  USER_REPOSITORY,
  ROLE_REPOSITORY,
  USER_ROLE_REPOSITORY,
  NOTE_REPOSITORY,
  PASSWORD_HASHER,
  JWT_SERVICE,
  VERIFICATION_TOKEN_REPOSITORY,
  EMAIL_SERVICE,
  TOKEN_GENERATOR,
} from './tokens';

@Module({
  imports: [DatabaseModule, ServicesModule],
  providers: [
    {
      provide: RegisterUser,
      useFactory: (
        userRepo: UserRepository,
        roleRepo: RoleRepository,
        userRoleRepo: UserRoleRepository,
        hasher: PasswordHasher,
        verificationTokenRepo: VerificationTokenRepository,
        emailService: EmailService,
        tokenGenerator: TokenGenerator,
      ) =>
        new RegisterUser(
          userRepo,
          roleRepo,
          userRoleRepo,
          hasher,
          verificationTokenRepo,
          emailService,
          tokenGenerator,
        ),
      inject: [
        USER_REPOSITORY,
        ROLE_REPOSITORY,
        USER_ROLE_REPOSITORY,
        PASSWORD_HASHER,
        VERIFICATION_TOKEN_REPOSITORY,
        EMAIL_SERVICE,
        TOKEN_GENERATOR,
      ],
    },
    {
      provide: LoginUser,
      useFactory: (
        userRepo: UserRepository,
        userRoleRepo: UserRoleRepository,
        hasher: PasswordHasher,
      ) => new LoginUser(userRepo, userRoleRepo, hasher),
      inject: [USER_REPOSITORY, USER_ROLE_REPOSITORY, PASSWORD_HASHER],
    },
    {
      provide: VerifyEmail,
      useFactory: (
        verificationTokenRepo: VerificationTokenRepository,
        userRepo: UserRepository,
        tokenGenerator: TokenGenerator,
      ) => new VerifyEmail(verificationTokenRepo, userRepo, tokenGenerator),
      inject: [VERIFICATION_TOKEN_REPOSITORY, USER_REPOSITORY, TOKEN_GENERATOR],
    },
    {
      provide: ResendVerification,
      useFactory: (
        userRepo: UserRepository,
        verificationTokenRepo: VerificationTokenRepository,
        emailService: EmailService,
        tokenGenerator: TokenGenerator,
      ) =>
        new ResendVerification(
          userRepo,
          verificationTokenRepo,
          emailService,
          tokenGenerator,
        ),
      inject: [
        USER_REPOSITORY,
        VERIFICATION_TOKEN_REPOSITORY,
        EMAIL_SERVICE,
        TOKEN_GENERATOR,
      ],
    },
    {
      provide: GetUserRoles,
      useFactory: (userRoleRepo: UserRoleRepository) => new GetUserRoles(userRoleRepo),
      inject: [USER_ROLE_REPOSITORY],
    },
    {
      provide: CreateNote,
      useFactory: (repo: NoteRepository) => new CreateNote(repo),
      inject: [NOTE_REPOSITORY],
    },
    {
      provide: ListNotes,
      useFactory: (repo: NoteRepository) => new ListNotes(repo),
      inject: [NOTE_REPOSITORY],
    },
    {
      provide: UpdateNote,
      useFactory: (repo: NoteRepository) => new UpdateNote(repo),
      inject: [NOTE_REPOSITORY],
    },
    {
      provide: DeleteNote,
      useFactory: (repo: NoteRepository) => new DeleteNote(repo),
      inject: [NOTE_REPOSITORY],
    },
    {
      provide: GetNote,
      useFactory: (repo: NoteRepository) => new GetNote(repo),
      inject: [NOTE_REPOSITORY],
    },
  ],
  exports: [
    DatabaseModule,
    ServicesModule,
    RegisterUser,
    LoginUser,
    VerifyEmail,
    ResendVerification,
    GetUserRoles,
    CreateNote,
    ListNotes,
    UpdateNote,
    DeleteNote,
    GetNote,
  ],
})
export class DomainModule {}
