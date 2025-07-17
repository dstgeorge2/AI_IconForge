import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { convertImageToIcon } from "./services/iconConverter";
import { insertIconConversionSchema, iconRefinementSchema } from "@shared/schema";
import RefinementEngine from './prompts/refinement_engine.js';
import multer from "multer";
import { z } from "zod";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Convert image to icon
  app.post('/api/convert-icon', upload.single('image'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const result = await convertImageToIcon(req.file.buffer, req.file.originalname);
      
      // Store the conversion result
      const conversion = await storage.createIconConversion({
        originalImageName: req.file.originalname,
        svgCode: result.svg,
        validationResults: result.validationResults,
        metadata: result.metadata
      });

      res.json({
        id: conversion.id,
        svg: result.svg,
        metadata: result.metadata,
        validationResults: result.validationResults
      });
    } catch (error) {
      console.error('Icon conversion error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Get conversion by ID
  app.get('/api/conversion/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const conversion = await storage.getIconConversion(id);
      
      if (!conversion) {
        return res.status(404).json({ error: 'Conversion not found' });
      }

      res.json(conversion);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Get recent conversions
  app.get('/api/conversions/recent', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const conversions = await storage.getRecentIconConversions(limit);
      res.json(conversions);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Icon refinement endpoint
  app.post('/api/refine-icon', async (req: Request, res: Response) => {
    try {
      const refinementData = iconRefinementSchema.parse(req.body);
      
      // Get original icon
      const originalIcon = await storage.getIconConversion(refinementData.originalIconId);
      if (!originalIcon) {
        return res.status(404).json({ error: 'Original icon not found' });
      }

      // Initialize refinement engine
      const refinementEngine = new (RefinementEngine as any)();
      
      // Process user feedback
      const refinementResult = await refinementEngine.processUserFeedback(
        originalIcon,
        refinementData.feedback,
        (originalIcon.metadata as any)?.semanticIntent
      );

      res.json({
        refinementType: refinementResult.type,
        reasoning: refinementResult.reasoning,
        prompt: refinementResult.prompt,
        suggestions: refinementResult.suggestions || [],
        modifications: refinementResult.modifications || [],
        changes: refinementResult.changes || []
      });
    } catch (error) {
      console.error('Icon refinement error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
