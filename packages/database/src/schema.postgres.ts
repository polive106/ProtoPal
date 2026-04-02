import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';

// === USERS ===
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  status: text('status', {
    enum: ['pending', 'verified', 'approved', 'rejected'],
  })
    .notNull()
    .default('pending'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

// === ROLES ===
export const roles = pgTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  isSystem: boolean('is_system').notNull().default(false),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

// === USER ROLES ===
export const userRoles = pgTable('user_roles', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  roleId: text('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),
  assignedAt: timestamp('assigned_at').notNull(),
  assignedBy: text('assigned_by').references(() => users.id),
});

// === NOTES ===
export const notes = pgTable('notes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});
