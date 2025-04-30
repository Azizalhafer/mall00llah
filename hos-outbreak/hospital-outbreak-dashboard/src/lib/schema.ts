import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, primaryKey, uniqueIndex } from "drizzle-orm/sqlite-core";

// Users table
export const usersTable = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    username: text("username").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    fullName: text("full_name"),
    role: text("role", { enum: ["admin", "investigator", "viewer"] }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
});

// Outbreaks table
export const outbreaksTable = sqliteTable("outbreaks", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    description: text("description"),
    pathogen: text("pathogen"),
    startDate: integer("start_date", { mode: "timestamp_ms" }), // Store dates as numbers (milliseconds since epoch)
    endDate: integer("end_date", { mode: "timestamp_ms" }),
    status: text("status", { enum: ["active", "monitoring", "closed"] }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
});

// Locations table
export const locationsTable = sqliteTable("locations", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),
    type: text("type"),
    description: text("description"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
});

// Case Definitions table
export const caseDefinitionsTable = sqliteTable("case_definitions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    outbreakId: integer("outbreak_id").notNull().references(() => outbreaksTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    criteria: text("criteria").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
});

// Cases table (Line List)
export const casesTable = sqliteTable("cases", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    outbreakId: integer("outbreak_id").notNull().references(() => outbreaksTable.id, { onDelete: "cascade" }),
    caseDefinitionId: integer("case_definition_id").references(() => caseDefinitionsTable.id, { onDelete: "set null" }),
    patientMrn: text("patient_mrn"),
    patientName: text("patient_name"),
    dateOfBirth: integer("date_of_birth", { mode: "timestamp_ms" }),
    gender: text("gender", { enum: ["male", "female", "other"] }),
    admissionDate: integer("admission_date", { mode: "timestamp_ms" }),
    symptomOnsetDate: integer("symptom_onset_date", { mode: "timestamp_ms" }),
    diagnosisDate: integer("diagnosis_date", { mode: "timestamp_ms" }),
    labResult: text("lab_result"),
    labResultDate: integer("lab_result_date", { mode: "timestamp_ms" }),
    locationId: integer("location_id").references(() => locationsTable.id, { onDelete: "set null" }),
    outcome: text("outcome", { enum: ["recovered", "deceased", "transferred", "ongoing"] }),
    notes: text("notes"),
    reportedToSeha: integer("reported_to_seha", { mode: "boolean" }).default(false),
    sehaReportId: text("seha_report_id"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
});

// Control Actions table
export const controlActionsTable = sqliteTable("control_actions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    outbreakId: integer("outbreak_id").notNull().references(() => outbreaksTable.id, { onDelete: "cascade" }),
    actionType: text("action_type").notNull(),
    description: text("description").notNull(),
    startDate: integer("start_date", { mode: "timestamp_ms" }),
    completionDate: integer("completion_date", { mode: "timestamp_ms" }),
    responsiblePerson: text("responsible_person"),
    status: text("status", { enum: ["planned", "in_progress", "completed", "cancelled"] }).notNull(),
    effectivenessNotes: text("effectiveness_notes"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
});

// Reports table
export const reportsTable = sqliteTable("reports", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    outbreakId: integer("outbreak_id").references(() => outbreaksTable.id, { onDelete: "set null" }),
    reportType: text("report_type").notNull(),
    generationDate: integer("generation_date", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
    generatedByUserId: integer("generated_by_user_id").references(() => usersTable.id, { onDelete: "set null" }),
    filePath: text("file_path"),
    notes: text("notes"),
});

// Settings table
export const settingsTable = sqliteTable("settings", {
    key: text("key").primaryKey(),
    value: text("value").notNull(),
    description: text("description"),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
});

// Alerts table
export const alertsTable = sqliteTable("alerts", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    alertType: text("alert_type").notNull(),
    message: text("message").notNull(),
    relatedOutbreakId: integer("related_outbreak_id").references(() => outbreaksTable.id, { onDelete: "set null" }),
    relatedCaseId: integer("related_case_id").references(() => casesTable.id, { onDelete: "set null" }),
    status: text("status", { enum: ["new", "acknowledged", "resolved"] }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
    acknowledgedAt: integer("acknowledged_at", { mode: "timestamp" }),
    resolvedAt: integer("resolved_at", { mode: "timestamp" }),
});

