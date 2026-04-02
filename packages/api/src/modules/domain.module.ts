import { Module } from '@nestjs/common';
import type {
  UserRepository,
  RoleRepository,
  UserRoleRepository,
  NoteRepository,
  PasswordHasher,
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
      ) => new RegisterUser(userRepo, roleRepo, userRoleRepo, hasher),
      inject: [USER_REPOSITORY, ROLE_REPOSITORY, USER_ROLE_REPOSITORY, PASSWORD_HASHER],
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
    GetUserRoles,
    CreateNote,
    ListNotes,
    UpdateNote,
    DeleteNote,
    GetNote,
  ],
})
export class DomainModule {}
