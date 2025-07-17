import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { convertImageToIcon } from "./services/iconConverter";
import IconRefinementService from "./services/iconRefinement";
import { insertIconConversionSchema } from "@shared/schema";
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
  // Initialize refinement service
  const refinementService = new IconRefinementService();
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

  // Refine existing icon
  app.post('/api/refine-icon', async (req: Request, res: Response) => {
    try {
      const refinementRequest = z.object({
        originalSvg: z.string(),
        originalMetadata: z.object({}).passthrough(),
        refinementType: z.enum(['ui_controls', 'custom_prompt', 'preset']),
        parameters: z.object({
          strokeWeight: z.number().optional(),
          styleVariation: z.enum(['minimal', 'detailed', 'bold']).optional(),
          elementCount: z.enum(['fewer', 'more', 'same']).optional(),
          customPrompt: z.string().optional(),
          preset: z.string().optional()
        }),
        userContext: z.string().optional()
      }).parse(req.body);

      const result = await refinementService.refineIcon(refinementRequest);
      
      // Store the refined conversion
      const refinedConversion = await storage.createIconConversion({
        originalImageName: `refined_${Date.now()}.svg`,
        svgCode: result.refinedSvg,
        validationResults: result.validationResults,
        metadata: result.refinedMetadata
      });

      res.json({
        id: refinedConversion.id,
        svg: result.refinedSvg,
        metadata: result.refinedMetadata,
        validationResults: result.validationResults,
        changes: result.changes,
        refinementHistory: result.refinementHistory
      });
    } catch (error) {
      console.error('Icon refinement error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Get refinement presets
  app.get('/api/refinement-presets', (req: Request, res: Response) => {
    res.json(IconRefinementService.REFINEMENT_PRESETS);
  });

  const httpServer = createServer(app);
  return httpServer;
}
