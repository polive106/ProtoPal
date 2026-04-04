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

## Mobile Feature Template

```typescript
// packages/mobile/src/features/my-entity/api.ts
import { api } from '@/lib/api';

export interface MyEntity { id: string; name: string; userId: string; createdAt: string; updatedAt: string; }

export const myEntityApi = {
  list: () => api.get<{ items: MyEntity[] }>('/my-entities').then(r => r.items),
  get: (id: string) => api.get<{ item: MyEntity }>(`/my-entities/${id}`).then(r => r.item),
  create: (data: { name: string }) => api.post<{ item: MyEntity }>('/my-entities', data).then(r => r.item),
  update: (id: string, data: { name?: string }) => api.patch<{ item: MyEntity }>(`/my-entities/${id}`, data).then(r => r.item),
  delete: (id: string) => api.delete(`/my-entities/${id}`),
};
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
- [ ] Mobile hooks + hook tests
- [ ] Mobile widgets + widget tests
- [ ] Mobile ui/ compositions
- [ ] Mobile screens (Expo Router)
- [ ] E2E tests (Playwright for web, Maestro for mobile)
- [ ] Export from index.ts files
