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

export const iconVariants = pgTable("icon_variants", {
  id: serial("id").primaryKey(),
  conversionId: integer("conversion_id").references(() => iconConversions.id).notNull(),
  variantType: text("variant_type").notNull(), // '1-to-1', 'filename-based', 'common-ui', 'blended'
  svgCode: text("svg_code").notNull(),
  explanation: text("explanation").notNull(),
  confidence: integer("confidence").notNull(), // 0-100
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

export const insertIconVariantSchema = createInsertSchema(iconVariants).pick({
  conversionId: true,
  variantType: true,
  svgCode: true,
  explanation: true,
  confidence: true,
  metadata: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type IconConversion = typeof iconConversions.$inferSelect;
export type InsertIconConversion = z.infer<typeof insertIconConversionSchema>;
export type IconVariant = typeof iconVariants.$inferSelect;
export type InsertIconVariant = z.infer<typeof insertIconVariantSchema>;

// Multi-variant response type
export type IconVariantResponse = {
  variant: IconVariant;
  svg: string;
  explanation: string;
  confidence: number;
  metadata: any;
};

export type MultiVariantIconResponse = {
  conversionId: number;
  originalImageName: string;
  variants: {
    'one-to-one': IconVariantResponse;
    'ui-intent': IconVariantResponse;
    'material': IconVariantResponse;
    'carbon': IconVariantResponse;
    'pictogram': IconVariantResponse;
  };
};
