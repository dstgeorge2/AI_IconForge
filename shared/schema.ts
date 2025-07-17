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

// Icon refinement request schema
export const iconRefinementSchema = z.object({
  originalIconId: z.number(),
  feedback: z.string().min(1).max(500),
  refinementType: z.enum(['simplification', 'style_change', 'element_modification', 'design_system', 'general']).optional(),
});

export type IconRefinementRequest = z.infer<typeof iconRefinementSchema>;

// Complexity analysis schema
export const complexityAnalysisSchema = z.object({
  complexity_score: z.number().min(0).max(1),
  rating: z.enum(['low', 'medium', 'high']),
  flags: z.array(z.string()),
  recommend_simplification: z.boolean(),
  alternatives: z.array(z.object({
    type: z.string(),
    title: z.string(),
    description: z.string(),
    action: z.string(),
    confidence: z.number()
  })),
  feedback: z.array(z.object({
    type: z.string(),
    message: z.string(),
    severity: z.enum(['info', 'warning', 'error'])
  }))
});

export type ComplexityAnalysis = z.infer<typeof complexityAnalysisSchema>;
