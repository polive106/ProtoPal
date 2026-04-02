---
name: scaffold
description: Create a new entity with its full stack including domain, database, API, frontend, and E2E tests.
disable-model-invocation: true
---

## Domain Entity Template

```typescript
// packages/domain/src/entities/MyEntity.ts
export interface MyEntity {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMyEntityDTO {
  name: string;
  userId: string;
}

export interface UpdateMyEntityDTO {
  name?: string;
}
```

## Repository Port Template

```typescript
// packages/domain/src/ports/MyEntityRepository.ts
import type { MyEntity, CreateMyEntityDTO, UpdateMyEntityDTO } from '../entities/MyEntity';

export interface MyEntityRepository {
  create(dto: CreateMyEntityDTO): Promise<MyEntity>;
  findById(id: string): Promise<MyEntity | null>;
  findByUserId(userId: string): Promise<MyEntity[]>;
  update(id: string, data: UpdateMyEntityDTO): Promise<MyEntity>;
  delete(id: string): Promise<void>;
}
```

## Database Schema Template

```typescript
// Add to packages/database/src/schema.sqlite.ts
export const myEntities = sqliteTable('my_entities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});
```

## NestJS Controller Template

```typescript
// packages/api/src/controllers/my-entities.controller.ts
@Controller('my-entities')
export class MyEntitiesController {
  constructor(
    @Inject(CreateMyEntity) private readonly createMyEntity: CreateMyEntity,
    @Inject(ListMyEntities) private readonly listMyEntities: ListMyEntities,
  ) {}

  @Get()
  async list(@CurrentUser() user: JwtPayload) {
    const items = await this.listMyEntities.execute(user.sub);
    return { items };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @SimpleValidatedBody(CreateMyEntityDto) dto: CreateMyEntityDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const item = await this.createMyEntity.execute({ ...dto, userId: user.sub });
    return { item };
  }
}
```

## Checklist
- [ ] Entity + DTOs in domain
- [ ] Repository port in domain
- [ ] Use cases + tests in domain
- [ ] Schema in database
- [ ] Drizzle adapter + tests in database
- [ ] Update seed.ts with sample data
- [ ] Controller + DTOs in API
- [ ] Update domain.module.ts with new providers
- [ ] Update database.module.ts with new adapter
- [ ] Update tokens.ts with new token
- [ ] Frontend hooks + hook tests
- [ ] Frontend widgets + widget tests
- [ ] Frontend ui/ compositions + integration tests
- [ ] Frontend routes (thin wrappers)
- [ ] E2E tests
- [ ] Export from index.ts files
