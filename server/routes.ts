import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { convertImageToIcon } from "./services/iconConverter";
import IconRefinementService from "./services/iconRefinement";
import { generateMultiVariantIcons, generateMultiVariantIconsFromText } from "./services/multiVariantIconGenerator";
import { generateOptimizedMultiVariantIcons } from "./services/optimizedIconGenerator";
import { generateOpenAIMultiVariantIcons, generateOpenAIIconsFromText } from "./services/openaiIconGenerator";
import { generateCreativeMultiVariantIcons, generateCreativeIconsFromText } from "./services/creativeIconGenerator";
import { generateRevisedIcon } from "./services/iconRevision";
import { insertIconConversionSchema, insertIconVariantSchema } from "@shared/schema";
import promptGenerationRoutes from "./routes/prompt-generation";
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
  // Register prompt generation routes
  app.use('/api', promptGenerationRoutes);
  
  // Initialize refinement service
  const refinementService = new IconRefinementService();
  
  // Icon revision endpoint
  app.post('/api/revise-icon', upload.fields([
    { name: 'originalImage', maxCount: 1 },
    { name: 'referenceIcon', maxCount: 1 }
  ]), async (req: Request, res: Response) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { variantType, customPrompt, originalVariant } = req.body;
      
      if (!files.originalImage || !files.originalImage[0]) {
        return res.status(400).json({ error: 'Original image is required' });
      }
      
      if (!customPrompt && (!files.referenceIcon || !files.referenceIcon[0])) {
        return res.status(400).json({ error: 'Either custom prompt or reference icon is required' });
      }
      
      const originalImageBase64 = files.originalImage[0].buffer.toString('base64');
      const referenceIconBase64 = files.referenceIcon && files.referenceIcon[0] 
        ? files.referenceIcon[0].buffer.toString('base64')
        : null;
      
      // Parse the original variant data
      const originalVariantData = JSON.parse(originalVariant);
      
      // Generate revised icon with weighted user input
      const revisedIcon = await generateRevisedIcon({
        originalImageBase64,
        referenceIconBase64,
        customPrompt,
        variantType,
        originalVariant: originalVariantData,
        originalImageName: files.originalImage[0].originalname
      });
      
      // Store the revised variant
      const conversion = await storage.createIconConversion({
        originalImageName: files.originalImage[0].originalname,
        svgCode: revisedIcon.svg,
        validationResults: [],
        metadata: { approach: 'revision', parentVariant: variantType }
      });
      
      const storedVariant = await storage.createIconVariant({
        conversionId: conversion.id,
        variantType: `${variantType}-revised`,
        svgCode: revisedIcon.svg,
        explanation: revisedIcon.explanation,
        confidence: revisedIcon.confidence,
        metadata: revisedIcon.metadata
      });
      
      res.json({
        id: storedVariant.id,
        svg: storedVariant.svgCode,
        explanation: storedVariant.explanation,
        confidence: storedVariant.confidence,
        metadata: storedVariant.metadata
      });
      
    } catch (error) {
      console.error('Icon revision error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  // Multi-variant icon generation
  app.post('/api/generate-multi-variant-icons', upload.single('image'), async (req: Request, res: Response) => {
    try {
      let multiVariantResult;
      let originalName;
      
      if (req.body.textDescription) {
        // Text description mode
        const textDescription = req.body.textDescription;
        originalName = 'text-description.txt';
        multiVariantResult = await generateMultiVariantIconsFromText(textDescription);
      } else {
        // Image file mode
        if (!req.file) {
          return res.status(400).json({ error: 'No image file or text description provided' });
        }
        const base64Image = req.file.buffer.toString('base64');
        originalName = req.file.originalname;
        const additionalPrompt = req.body.prompt || '';
        multiVariantResult = await generateOptimizedMultiVariantIcons(originalName, base64Image, additionalPrompt);
      }
      
      // Create main conversion record
      const conversion = await storage.createIconConversion({
        originalImageName: originalName,
        svgCode: multiVariantResult.variants['one-to-one'].svg, // Use one-to-one as primary
        validationResults: [], // Add validation later
        metadata: { 
          approach: 'multi-variant-optimized',
          processingTime: multiVariantResult.processingTime,
          totalSize: multiVariantResult.totalSize,
          optimized: true
        }
      });

      // Store all variants
      const storedVariants = await Promise.all([
        storage.createIconVariant({
          conversionId: conversion.id,
          variantType: 'one-to-one',
          svgCode: multiVariantResult.variants['one-to-one'].svg,
          explanation: multiVariantResult.variants['one-to-one'].explanation,
          confidence: Math.round(multiVariantResult.variants['one-to-one'].confidence * 100),
          metadata: multiVariantResult.variants['one-to-one'].metadata
        }),
        storage.createIconVariant({
          conversionId: conversion.id,
          variantType: 'ui-intent',
          svgCode: multiVariantResult.variants['ui-intent'].svg,
          explanation: multiVariantResult.variants['ui-intent'].explanation,
          confidence: Math.round(multiVariantResult.variants['ui-intent'].confidence * 100),
          metadata: multiVariantResult.variants['ui-intent'].metadata
        }),
        storage.createIconVariant({
          conversionId: conversion.id,
          variantType: 'material',
          svgCode: multiVariantResult.variants.material.svg,
          explanation: multiVariantResult.variants.material.explanation,
          confidence: Math.round(multiVariantResult.variants.material.confidence * 100),
          metadata: multiVariantResult.variants.material.metadata
        }),
        storage.createIconVariant({
          conversionId: conversion.id,
          variantType: 'carbon',
          svgCode: multiVariantResult.variants.carbon.svg,
          explanation: multiVariantResult.variants.carbon.explanation,
          confidence: Math.round(multiVariantResult.variants.carbon.confidence * 100),
          metadata: multiVariantResult.variants.carbon.metadata
        }),
        storage.createIconVariant({
          conversionId: conversion.id,
          variantType: 'filled',
          svgCode: multiVariantResult.variants.filled.svg,
          explanation: multiVariantResult.variants.filled.explanation,
          confidence: Math.round(multiVariantResult.variants.filled.confidence * 100),
          metadata: multiVariantResult.variants.filled.metadata
        })
      ]);

      res.json({
        conversionId: conversion.id,
        originalImageName: originalName,
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
          'filled': {
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

  // OpenAI Multi-variant icon generation
  app.post('/api/generate-openai-multi-variant-icons', upload.single('image'), async (req: Request, res: Response) => {
    try {
      let multiVariantResult;
      let originalName;
      
      if (req.body.textDescription) {
        // Text description mode
        const textDescription = req.body.textDescription;
        originalName = 'openai-text-description.txt';
        multiVariantResult = await generateOpenAIIconsFromText(textDescription);
      } else {
        // Image file mode
        if (!req.file) {
          return res.status(400).json({ error: 'No image file or text description provided' });
        }
        const base64Image = req.file.buffer.toString('base64');
        originalName = req.file.originalname;
        const additionalPrompt = req.body.prompt || '';
        multiVariantResult = await generateOpenAIMultiVariantIcons(originalName, base64Image, additionalPrompt);
      }
      
      // Create main conversion record
      const conversion = await storage.createIconConversion({
        originalImageName: originalName,
        svgCode: multiVariantResult.variants['one-to-one'].svg,
        validationResults: [],
        metadata: { 
          approach: 'openai-multi-variant',
          processingTime: multiVariantResult.processingTime,
          totalSize: multiVariantResult.totalSize,
          model: multiVariantResult.model,
          optimized: true
        }
      });

      // Store all variants
      const storedVariants = await Promise.all([
        storage.createIconVariant({
          conversionId: conversion.id,
          variantType: 'one-to-one',
          svgCode: multiVariantResult.variants['one-to-one'].svg,
          explanation: multiVariantResult.variants['one-to-one'].explanation,
          confidence: Math.round(multiVariantResult.variants['one-to-one'].confidence),
          metadata: multiVariantResult.variants['one-to-one'].metadata
        }),
        storage.createIconVariant({
          conversionId: conversion.id,
          variantType: 'ui-intent',
          svgCode: multiVariantResult.variants['ui-intent'].svg,
          explanation: multiVariantResult.variants['ui-intent'].explanation,
          confidence: Math.round(multiVariantResult.variants['ui-intent'].confidence),
          metadata: multiVariantResult.variants['ui-intent'].metadata
        }),
        storage.createIconVariant({
          conversionId: conversion.id,
          variantType: 'material',
          svgCode: multiVariantResult.variants.material.svg,
          explanation: multiVariantResult.variants.material.explanation,
          confidence: Math.round(multiVariantResult.variants.material.confidence),
          metadata: multiVariantResult.variants.material.metadata
        }),
        storage.createIconVariant({
          conversionId: conversion.id,
          variantType: 'carbon',
          svgCode: multiVariantResult.variants.carbon.svg,
          explanation: multiVariantResult.variants.carbon.explanation,
          confidence: Math.round(multiVariantResult.variants.carbon.confidence),
          metadata: multiVariantResult.variants.carbon.metadata
        }),
        storage.createIconVariant({
          conversionId: conversion.id,
          variantType: 'filled',
          svgCode: multiVariantResult.variants.filled.svg,
          explanation: multiVariantResult.variants.filled.explanation,
          confidence: Math.round(multiVariantResult.variants.filled.confidence),
          metadata: multiVariantResult.variants.filled.metadata
        })
      ]);

      res.json({
        conversionId: conversion.id,
        originalImageName: originalName,
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
          'filled': {
            id: storedVariants[4].id,
            svg: storedVariants[4].svgCode,
            explanation: storedVariants[4].explanation,
            confidence: storedVariants[4].confidence,
            metadata: storedVariants[4].metadata
          }
        },
        processingTime: multiVariantResult.processingTime,
        totalSize: multiVariantResult.totalSize,
        model: multiVariantResult.model
      });
    } catch (error) {
      console.error('OpenAI multi-variant icon generation error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Creative Multi-variant icon generation
  app.post('/api/generate-creative-multi-variant-icons', upload.single('image'), async (req: Request, res: Response) => {
    try {
      let multiVariantResult;
      let originalName;
      
      if (req.body.textDescription) {
        // Text description mode
        const textDescription = req.body.textDescription;
        originalName = 'creative-text-description.txt';
        multiVariantResult = await generateCreativeIconsFromText(textDescription);
      } else {
        // Image file mode
        if (!req.file) {
          return res.status(400).json({ error: 'No image file or text description provided' });
        }
        const base64Image = req.file.buffer.toString('base64');
        originalName = req.file.originalname;
        const additionalPrompt = req.body.prompt || '';
        multiVariantResult = await generateCreativeMultiVariantIcons(originalName, base64Image, additionalPrompt);
      }
      
      // Create main conversion record
      const conversion = await storage.createIconConversion({
        originalImageName: originalName,
        svgCode: multiVariantResult.variants['creative-one-to-one'].svg,
        validationResults: [],
        metadata: { 
          approach: 'creative-multi-variant',
          processingTime: multiVariantResult.processingTime,
          totalSize: multiVariantResult.totalSize,
          model: multiVariantResult.model,
          styleGuide: multiVariantResult.styleGuide,
          optimized: true
        }
      });

      // Store all creative variants
      const storedVariants = await Promise.all([
        storage.createIconVariant({
          conversionId: conversion.id,
          variantType: 'creative-one-to-one',
          svgCode: multiVariantResult.variants['creative-one-to-one'].svg,
          explanation: multiVariantResult.variants['creative-one-to-one'].explanation,
          confidence: Math.round(multiVariantResult.variants['creative-one-to-one'].confidence),
          metadata: multiVariantResult.variants['creative-one-to-one'].metadata
        }),
        storage.createIconVariant({
          conversionId: conversion.id,
          variantType: 'creative-ui-intent',
          svgCode: multiVariantResult.variants['creative-ui-intent'].svg,
          explanation: multiVariantResult.variants['creative-ui-intent'].explanation,
          confidence: Math.round(multiVariantResult.variants['creative-ui-intent'].confidence),
          metadata: multiVariantResult.variants['creative-ui-intent'].metadata
        }),
        storage.createIconVariant({
          conversionId: conversion.id,
          variantType: 'creative-material',
          svgCode: multiVariantResult.variants['creative-material'].svg,
          explanation: multiVariantResult.variants['creative-material'].explanation,
          confidence: Math.round(multiVariantResult.variants['creative-material'].confidence),
          metadata: multiVariantResult.variants['creative-material'].metadata
        }),
        storage.createIconVariant({
          conversionId: conversion.id,
          variantType: 'creative-carbon',
          svgCode: multiVariantResult.variants['creative-carbon'].svg,
          explanation: multiVariantResult.variants['creative-carbon'].explanation,
          confidence: Math.round(multiVariantResult.variants['creative-carbon'].confidence),
          metadata: multiVariantResult.variants['creative-carbon'].metadata
        }),
        storage.createIconVariant({
          conversionId: conversion.id,
          variantType: 'creative-filled',
          svgCode: multiVariantResult.variants['creative-filled'].svg,
          explanation: multiVariantResult.variants['creative-filled'].explanation,
          confidence: Math.round(multiVariantResult.variants['creative-filled'].confidence),
          metadata: multiVariantResult.variants['creative-filled'].metadata
        })
      ]);

      res.json({
        conversionId: conversion.id,
        originalImageName: originalName,
        variants: {
          'creative-one-to-one': {
            id: storedVariants[0].id,
            svg: storedVariants[0].svgCode,
            explanation: storedVariants[0].explanation,
            confidence: storedVariants[0].confidence,
            metadata: storedVariants[0].metadata
          },
          'creative-ui-intent': {
            id: storedVariants[1].id,
            svg: storedVariants[1].svgCode,
            explanation: storedVariants[1].explanation,
            confidence: storedVariants[1].confidence,
            metadata: storedVariants[1].metadata
          },
          'creative-material': {
            id: storedVariants[2].id,
            svg: storedVariants[2].svgCode,
            explanation: storedVariants[2].explanation,
            confidence: storedVariants[2].confidence,
            metadata: storedVariants[2].metadata
          },
          'creative-carbon': {
            id: storedVariants[3].id,
            svg: storedVariants[3].svgCode,
            explanation: storedVariants[3].explanation,
            confidence: storedVariants[3].confidence,
            metadata: storedVariants[3].metadata
          },
          'creative-filled': {
            id: storedVariants[4].id,
            svg: storedVariants[4].svgCode,
            explanation: storedVariants[4].explanation,
            confidence: storedVariants[4].confidence,
            metadata: storedVariants[4].metadata
          }
        },
        processingTime: multiVariantResult.processingTime,
        totalSize: multiVariantResult.totalSize,
        model: multiVariantResult.model,
        styleGuide: multiVariantResult.styleGuide
      });
    } catch (error) {
      console.error('Creative multi-variant icon generation error:', error);
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
