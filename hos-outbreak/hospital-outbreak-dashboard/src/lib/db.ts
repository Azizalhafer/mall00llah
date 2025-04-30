import { drizzle } from 'drizzle-orm/d1';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import * as schema from './schema'; // Assuming schema definitions are in schema.ts

// Define types based on your schema
export type User = InferSelectModel<typeof schema.usersTable>;
export type NewUser = InferInsertModel<typeof schema.usersTable>;

export type Outbreak = InferSelectModel<typeof schema.outbreaksTable>;
export type NewOutbreak = InferInsertModel<typeof schema.outbreaksTable>;

export type Location = InferSelectModel<typeof schema.locationsTable>;
export type NewLocation = InferInsertModel<typeof schema.locationsTable>;

export type CaseDefinition = InferSelectModel<typeof schema.caseDefinitionsTable>;
export type NewCaseDefinition = InferInsertModel<typeof schema.caseDefinitionsTable>;

export type Case = InferSelectModel<typeof schema.casesTable>;
export type NewCase = InferInsertModel<typeof schema.casesTable>;

export type ControlAction = InferSelectModel<typeof schema.controlActionsTable>;
export type NewControlAction = InferInsertModel<typeof schema.controlActionsTable>;

export type Report = InferSelectModel<typeof schema.reportsTable>;
export type NewReport = InferInsertModel<typeof schema.reportsTable>;

export type Setting = InferSelectModel<typeof schema.settingsTable>;
export type NewSetting = InferInsertModel<typeof schema.settingsTable>;

export type Alert = InferSelectModel<typeof schema.alertsTable>;
export type NewAlert = InferInsertModel<typeof schema.alertsTable>;

// Function to get the Drizzle client
// The binding 'DB' comes from wrangler.toml
export const getDb = (d1: D1Database) => {
  return drizzle(d1, { schema });
};

// You might need to define the schema objects (e.g., usersTable) in a separate schema.ts file
// based on your migrations/0001_initial.sql
// For now, this sets up the basic structure and types.

