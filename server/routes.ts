import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { convertImageToIcon } from "./services/iconConverter";
import IconRefinementService from "./services/iconRefinement";
import { generateMultiVariantIcons } from "./services/multiVariantIconGenerator";
import { insertIconConversionSchema, insertIconVariantSchema } from "@shared/schema";
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
  
  // Multi-variant icon generation
  app.post('/api/generate-multi-variant-icons', upload.single('image'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const base64Image = req.file.buffer.toString('base64');
      const multiVariantResult = await generateMultiVariantIcons(req.file.originalname, base64Image);
      
      // Create main conversion record
      const conversion = await storage.createIconConversion({
        originalImageName: req.file.originalname,
        svgCode: multiVariantResult.variants['one-to-one'].svg, // Use one-to-one as primary
        validationResults: [], // Add validation later
        metadata: { approach: 'multi-variant' }
      });

      // Store all variants
      const storedVariants = await Promise.all([
        storage.createIconVariant({
          conversionId: conversion.id,
          variantType: 'one-to-one',
          svgCode: multiVariantResult.variants['one-to-one'].svg,
          explanation: multiVariantResult.variants['one-to-one'].explanation,
          confidence: multiVariantResult.variants['one-to-one'].confidence,
          metadata: multiVariantResult.variants['one-to-one'].metadata
        }),
        storage.createIconVariant({
          conversionId: conversion.id,
          variantType: 'ui-intent',
          svgCode: multiVariantResult.variants['ui-intent'].svg,
          explanation: multiVariantResult.variants['ui-intent'].explanation,
          confidence: multiVariantResult.variants['ui-intent'].confidence,
          metadata: multiVariantResult.variants['ui-intent'].metadata
        }),
        storage.createIconVariant({
          conversionId: conversion.id,
          variantType: 'material',
          svgCode: multiVariantResult.variants.material.svg,
          explanation: multiVariantResult.variants.material.explanation,
          confidence: multiVariantResult.variants.material.confidence,
          metadata: multiVariantResult.variants.material.metadata
        }),
        storage.createIconVariant({
          conversionId: conversion.id,
          variantType: 'carbon',
          svgCode: multiVariantResult.variants.carbon.svg,
          explanation: multiVariantResult.variants.carbon.explanation,
          confidence: multiVariantResult.variants.carbon.confidence,
          metadata: multiVariantResult.variants.carbon.metadata
        }),
        storage.createIconVariant({
          conversionId: conversion.id,
          variantType: 'pictogram',
          svgCode: multiVariantResult.variants.pictogram.svg,
          explanation: multiVariantResult.variants.pictogram.explanation,
          confidence: multiVariantResult.variants.pictogram.confidence,
          metadata: multiVariantResult.variants.pictogram.metadata
        })
      ]);

      res.json({
        conversionId: conversion.id,
        originalImageName: req.file.originalname,
        variants: {
          'one-to-one': {
            id: storedVariants[0].id,
            svg: storedVariants[0].svgCode,
            explanation: storedVariants[0].explanation,
            confidence: storedVariants[0].confidence,
            metadata: storedVariants[0].metadata
          },
          'ui-intent': {
            id: storedVariants[1].id,
            svg: storedVariants[1].svgCode,
            explanation: storedVariants[1].explanation,
            confidence: storedVariants[1].confidence,
            metadata: storedVariants[1].metadata
          },
          'material': {
            id: storedVariants[2].id,
            svg: storedVariants[2].svgCode,
            explanation: storedVariants[2].explanation,
            confidence: storedVariants[2].confidence,
            metadata: storedVariants[2].metadata
          },
          'carbon': {
            id: storedVariants[3].id,
            svg: storedVariants[3].svgCode,
            explanation: storedVariants[3].explanation,
            confidence: storedVariants[3].confidence,
            metadata: storedVariants[3].metadata
          },
          'pictogram': {
            id: storedVariants[4].id,
            svg: storedVariants[4].svgCode,
            explanation: storedVariants[4].explanation,
            confidence: storedVariants[4].confidence,
            metadata: storedVariants[4].metadata
          }
        }
      });
    } catch (error) {
      console.error('Multi-variant icon generation error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  // Convert image to icon (legacy single-variant route)
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
