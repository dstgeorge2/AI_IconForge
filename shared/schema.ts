import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const iconConversions = pgTable("icon_conversions", {
  id: serial("id").primaryKey(),
  originalImageName: text("original_image_name").notNull(),
  svgCode: text("svg_code").notNull(),
  validationResults: jsonb("validation_results").notNull(),
  metadata: jsonb("metadata").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertIconConversionSchema = createInsertSchema(iconConversions).pick({
  originalImageName: true,
  svgCode: true,
  validationResults: true,
  metadata: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type IconConversion = typeof iconConversions.$inferSelect;
export type InsertIconConversion = z.infer<typeof insertIconConversionSchema>;
