/**
 * Prompt Generation API Routes
 * RESTful endpoints for structured icon prompt generation
 */

import { Router, Request, Response } from 'express';
import { 
  buildIconPrompt, 
  buildCreativeIconPrompt,
  parseInputToConfig,
  validateIconConfig,
  generatePromptVariants,
  STYLE_PRESETS,
  IconConfig
} from '../services/iconPromptBuilder';

const router = Router();

/**
 * POST /api/generate-prompt
 * Generate a structured prompt from icon configuration
 */
router.post('/generate-prompt', (req: Request, res: Response) => {
  try {
    const validation = validateIconConfig(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid configuration',
        details: validation.errors
      });
    }

    const config = validation.data!;
    const prompt = buildIconPrompt(config);
    
    res.json({
      prompt,
      config,
      metadata: {
        promptLength: prompt.length,
        generatedAt: new Date().toISOString(),
        version: '1.0'
      }
    });

  } catch (error) {
    console.error('Prompt generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate prompt',
      message: (error as Error).message
    });
  }
});

/**
 * POST /api/generate-creative-prompt
 * Generate a creative-enhanced prompt with personality
 */
router.post('/generate-creative-prompt', (req: Request, res: Response) => {
  try {
    const validation = validateIconConfig(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid configuration',
        details: validation.errors
      });
    }

    const config = validation.data!;
    const prompt = buildCreativeIconPrompt(config);
    
    res.json({
      prompt,
      config,
      creative: true,
      metadata: {
        promptLength: prompt.length,
        generatedAt: new Date().toISOString(),
        version: '1.0-creative'
      }
    });

  } catch (error) {
    console.error('Creative prompt generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate creative prompt',
      message: (error as Error).message
    });
  }
});

/**
 * POST /api/parse-input
 * Convert keywords or filename to icon configuration
 */
router.post('/parse-input', (req: Request, res: Response) => {
  try {
    const { input, preset = 'material-design' } = req.body;
    
    if (!input || typeof input !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid input string'
      });
    }

    if (!(preset in STYLE_PRESETS)) {
      return res.status(400).json({
        error: 'Invalid preset',
        availablePresets: Object.keys(STYLE_PRESETS)
      });
    }

    const partialConfig = parseInputToConfig(input, preset);
    
    // Fill in defaults for complete config
    const validation = validateIconConfig({
      ...partialConfig,
      dimensions: { canvasSize: 24, padding: 2, liveArea: 20 },
      doNotInclude: ['text', 'labels', 'background'],
      output: { format: 'SVG', background: 'transparent', colorMode: 'monochrome' },
      targetUse: 'stock icon for interface'
    });

    if (!validation.success) {
      return res.status(400).json({
        error: 'Failed to create valid configuration',
        details: validation.errors
      });
    }

    res.json({
      originalInput: input,
      parsedConfig: validation.data,
      preset: preset,
      suggestions: {
        relatedIcons: [], // Could be expanded with semantic matching
        alternativeNames: []
      }
    });

  } catch (error) {
    console.error('Input parsing error:', error);
    res.status(500).json({ 
      error: 'Failed to parse input',
      message: (error as Error).message
    });
  }
});

/**
 * GET /api/presets
 * Get available style presets
 */
router.get('/presets', (req: Request, res: Response) => {
  try {
    const presets = Object.entries(STYLE_PRESETS).map(([key, style]) => ({
      id: key,
      name: key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      style,
      description: getPresetDescription(key)
    }));

    res.json({
      presets,
      total: presets.length,
      default: 'material-design'
    });

  } catch (error) {
    console.error('Presets fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch presets',
      message: (error as Error).message
    });
  }
});

/**
 * POST /api/generate-variants
 * Generate multiple prompt variants for A/B testing
 */
router.post('/generate-variants', (req: Request, res: Response) => {
  try {
    const validation = validateIconConfig(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid configuration',
        details: validation.errors
      });
    }

    const config = validation.data!;
    const variants = generatePromptVariants(config);
    
    res.json({
      config,
      variants,
      metadata: {
        totalVariants: Object.keys(variants).length,
        generatedAt: new Date().toISOString(),
        version: '1.0'
      }
    });

  } catch (error) {
    console.error('Variant generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate variants',
      message: (error as Error).message
    });
  }
});

/**
 * POST /api/feedback
 * Store feedback on prompt performance
 */
router.post('/feedback', (req: Request, res: Response) => {
  try {
    const { promptId, config, rating, comments, generatedIconUrl } = req.body;
    
    // In a real implementation, this would store to database
    // For now, just log the feedback
    console.log('Prompt feedback received:', {
      promptId,
      config: config?.name,
      rating,
      comments,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      message: 'Feedback recorded successfully',
      feedbackId: `fb_${Date.now()}`,
      status: 'received'
    });

  } catch (error) {
    console.error('Feedback recording error:', error);
    res.status(500).json({ 
      error: 'Failed to record feedback',
      message: (error as Error).message
    });
  }
});

function getPresetDescription(preset: string): string {
  const descriptions = {
    'material-design': 'Google Material Design specifications with 2dp strokes and rounded corners',
    'windchill-enterprise': 'PTC Windchill enterprise standards with bold strokes and sharp precision',
    'creative-hand-drawn': 'Playful isometric style with organic personality and decorative elements',
    'carbon-design': 'IBM Carbon Design system with mixed corners and technical precision',
    'pixel-art': 'Retro pixel-perfect style with sharp edges and filled shapes'
  };
  
  return descriptions[preset] || 'Custom style preset';
}

export default router;