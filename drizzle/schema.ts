import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Projects table
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  cadFileUrl: varchar("cadFileUrl", { length: 1024 }),
  cadFileKey: varchar("cadFileKey", { length: 1024 }),
  cadParameters: text("cadParameters"), // JSON string
  status: mysqlEnum("status", ["draft", "completed", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// Designs table
export const designs = mysqlTable("designs", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  styleTheme: varchar("styleTheme", { length: 100 }),
  colorScheme: varchar("colorScheme", { length: 100 }),
  budgetRange: varchar("budgetRange", { length: 50 }),
  parameters: text("parameters"), // JSON string
  version: int("version").default(1).notNull(),
  status: mysqlEnum("status", ["draft", "completed"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Design = typeof designs.$inferSelect;
export type InsertDesign = typeof designs.$inferInsert;

// Renderings table
export const renderings = mysqlTable("renderings", {
  id: int("id").autoincrement().primaryKey(),
  designId: int("designId").notNull(),
  imageUrl: varchar("imageUrl", { length: 1024 }),
  imageKey: varchar("imageKey", { length: 1024 }),
  areaType: varchar("areaType", { length: 50 }), // hall, bar, vip, gaming, etc
  version: int("version").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Rendering = typeof renderings.$inferSelect;
export type InsertRendering = typeof renderings.$inferInsert;

// Iterations table
export const iterations = mysqlTable("iterations", {
  id: int("id").autoincrement().primaryKey(),
  designId: int("designId").notNull(),
  instruction: text("instruction"),
  parameterChanges: text("parameterChanges"), // JSON string
  imageUrl: varchar("imageUrl", { length: 1024 }),
  imageKey: varchar("imageKey", { length: 1024 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type Iteration = typeof iterations.$inferSelect;
export type InsertIteration = typeof iterations.$inferInsert;

// Materials table
export const materials = mysqlTable("materials", {
  id: int("id").autoincrement().primaryKey(),
  designId: int("designId").notNull(),
  materialName: varchar("materialName", { length: 255 }),
  category: varchar("category", { length: 100 }),
  quantity: decimal("quantity", { precision: 10, scale: 2 }),
  unit: varchar("unit", { length: 50 }),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }),
  totalPrice: decimal("totalPrice", { precision: 12, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = typeof materials.$inferInsert;

// Constructions table
export const constructions = mysqlTable("constructions", {
  id: int("id").autoincrement().primaryKey(),
  designId: int("designId").notNull(),
  dwgFileUrl: varchar("dwgFileUrl", { length: 1024 }),
  dwgFileKey: varchar("dwgFileKey", { length: 1024 }),
  pdfFileUrl: varchar("pdfFileUrl", { length: 1024 }),
  pdfFileKey: varchar("pdfFileKey", { length: 1024 }),
  version: int("version").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Construction = typeof constructions.$inferSelect;
export type InsertConstruction = typeof constructions.$inferInsert;

// Material library table
export const materialLibrary = mysqlTable("material_library", {
  id: int("id").autoincrement().primaryKey(),
  materialName: varchar("materialName", { length: 255 }),
  category: varchar("category", { length: 100 }),
  unit: varchar("unit", { length: 50 }),
  economyPrice: decimal("economyPrice", { precision: 10, scale: 2 }),
  standardPrice: decimal("standardPrice", { precision: 10, scale: 2 }),
  premiumPrice: decimal("premiumPrice", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MaterialLibraryItem = typeof materialLibrary.$inferSelect;
export type InsertMaterialLibraryItem = typeof materialLibrary.$inferInsert;