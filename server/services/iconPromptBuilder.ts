/**
 * Icon Prompt Builder - Configuration-based prompt generation for AI models
 * Implements structured prompt generation with schema validation
 */

import { z } from 'zod';

// Schema for icon configuration
export const IconConfigSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  style: z.object({
    strokeWeight: z.enum(['thin', '2dp', 'bold', 'variable']).default('2dp'),
    fill: z.enum(['outline', 'filled', 'duotone', 'none']).default('outline'),
    cornerStyle: z.enum(['rounded', 'sharp', 'mixed']).default('rounded'),
    perspective: z.enum(['flat', 'isometric', 'slight-tilt', 'orthographic']).default('flat'),
    gridAlignment: z.enum(['pixel-perfect', 'optical', 'loose']).default('pixel-perfect'),
    shading: z.enum(['none', 'minimal', 'soft', 'realistic']).default('none'),
    decorativeElements: z.enum(['none', 'sparkles', 'dots', 'organic-accents']).default('none')
  }),
  dimensions: z.object({
    canvasSize: z.number().positive().default(24),
    padding: z.number().min(0).default(2),
    liveArea: z.number().positive().default(20)
  }),
  doNotInclude: z.array(z.string()).default([
    'text',
    'labels',
    'background',
    'realistic shading',
    'bitmap elements'
  ]),
  output: z.object({
    format: z.enum(['SVG', 'PNG', 'vector']).default('SVG'),
    background: z.enum(['transparent', 'white', 'none']).default('transparent'),
    colorMode: z.enum(['monochrome', 'colored', 'duotone']).default('monochrome')
  }),
  targetUse: z.string().default('stock icon for interface'),
  tags: z.array(z.string()).optional(),
  relatedIcons: z.array(z.string()).optional()
});

export type IconConfig = z.infer<typeof IconConfigSchema>;

/**
 * Style Presets for different design systems
 */
export const STYLE_PRESETS = {
  'material-design': {
    strokeWeight: '2dp' as const,
    fill: 'outline' as const,
    cornerStyle: 'rounded' as const,
    perspective: 'flat' as const,
    gridAlignment: 'pixel-perfect' as const,
    shading: 'none' as const,
    decorativeElements: 'none' as const
  },
  'windchill-enterprise': {
    strokeWeight: 'bold' as const,
    fill: 'outline' as const,
    cornerStyle: 'sharp' as const,
    perspective: 'orthographic' as const,
    gridAlignment: 'pixel-perfect' as const,
    shading: 'minimal' as const,
    decorativeElements: 'none' as const
  },
  'creative-hand-drawn': {
    strokeWeight: 'bold' as const,
    fill: 'outline' as const,
    cornerStyle: 'rounded' as const,
    perspective: 'slight-tilt' as const,
    gridAlignment: 'optical' as const,
    shading: 'minimal' as const,
    decorativeElements: 'sparkles' as const
  },
  'carbon-design': {
    strokeWeight: '2dp' as const,
    fill: 'outline' as const,
    cornerStyle: 'mixed' as const,
    perspective: 'flat' as const,
    gridAlignment: 'pixel-perfect' as const,
    shading: 'none' as const,
    decorativeElements: 'none' as const
  },
  'pixel-art': {
    strokeWeight: 'thin' as const,
    fill: 'filled' as const,
    cornerStyle: 'sharp' as const,
    perspective: 'flat' as const,
    gridAlignment: 'pixel-perfect' as const,
    shading: 'none' as const,
    decorativeElements: 'none' as const
  }
};

/**
 * Build structured prompt for AI icon generation
 */
export function buildIconPrompt(config: IconConfig): string {
  const {
    name,
    description,
    style,
    dimensions,
    doNotInclude,
    output,
    targetUse,
  } = config;

  return `
Generate a professional ${targetUse} for "${name}". ${description}

## VISUAL STYLE REQUIREMENTS
- **Stroke Weight**: ${style.strokeWeight}
- **Fill Style**: ${style.fill}
- **Corner Treatment**: ${style.cornerStyle}
- **Perspective**: ${style.perspective}
- **Grid Alignment**: ${style.gridAlignment}
- **Shading**: ${style.shading}
- **Decorative Elements**: ${style.decorativeElements}

## CANVAS SPECIFICATIONS
- **Canvas Size**: ${dimensions.canvasSize}×${dimensions.canvasSize}px
- **Padding**: ${dimensions.padding}px on all sides
- **Live Area**: ${dimensions.liveArea}×${dimensions.liveArea}px (usable space)

## OUTPUT REQUIREMENTS
- **Format**: ${output.format} with proper structure
- **Background**: ${output.background}
- **Color Mode**: ${output.colorMode}
- **Scalability**: Must be crisp at 16px, 24px, and 48px sizes

## STRICT EXCLUSIONS
Do NOT include: ${doNotInclude.join(', ')}

## VALIDATION CHECKLIST
- [ ] Icon represents the concept clearly
- [ ] Follows specified style guidelines exactly
- [ ] Fits within live area constraints
- [ ] No prohibited elements included
- [ ] Proper ${output.format} structure with viewBox

Generate the icon following these specifications exactly.
`.trim();
}

/**
 * Build creative-specific prompt with enhanced personality
 */
export function buildCreativeIconPrompt(config: IconConfig): string {
  const basePrompt = buildIconPrompt(config);
  
  const creativeEnhancements = `

## CREATIVE PERSONALITY GUIDELINES
- **Hand-drawn Character**: Allow slight organic imperfections and asymmetry
- **Playful Energy**: Add dynamic tilts and implied motion where appropriate  
- **Decorative Accents**: Include ${style.decorativeElements} balanced around main elements
- **Organic Curves**: Use flowing lines instead of rigid geometry
- **Visual Warmth**: Create approachable, friendly character while maintaining clarity

## ISOMETRIC CREATIVE TREATMENT
- Apply subtle 15-20 degree perspective tilt for depth
- Add depth hints with bold shadows or thicker lines on one side
- Maintain recognizable silhouette from multiple angles
- Balance playfulness with professional usability

The icon should have distinctive creative personality while remaining functionally clear for UI use.
`;

  return basePrompt + creativeEnhancements;
}

/**
 * Parse keywords or filename into icon config
 */
export function parseInputToConfig(input: string, preset: keyof typeof STYLE_PRESETS = 'material-design'): Partial<IconConfig> {
  // Clean and normalize input
  const normalized = input.toLowerCase()
    .replace(/[_-]/g, ' ')
    .replace(/\.(svg|png|jpg|jpeg)$/, '')
    .trim();

  // Extract semantic meaning
  const semanticMap = {
    'download': 'Arrow pointing down into a horizontal base or tray',
    'upload': 'Arrow pointing up from a horizontal base',
    'save': 'Floppy disk or download arrow into container',
    'edit': 'Pencil or pen with editing indication',
    'delete': 'Trash can or X mark for removal',
    'search': 'Magnifying glass for finding content',
    'settings': 'Gear or cog for configuration',
    'user': 'Person silhouette or avatar circle',
    'calendar': 'Calendar grid with date indication',
    'email': 'Envelope for messaging',
    'notification': 'Bell or alert indicator',
    'home': 'House outline for navigation',
    'menu': 'Three horizontal lines for navigation',
    'close': 'X mark for closing',
    'check': 'Checkmark for confirmation',
    'warning': 'Triangle with exclamation point',
    'info': 'Circle with i for information',
    'help': 'Question mark for assistance',
    'lock': 'Padlock for security',
    'unlock': 'Open padlock for access'
  };

  // Find matching semantic description
  const matchedKey = Object.keys(semanticMap).find(key => 
    normalized.includes(key) || key.includes(normalized)
  );

  const description = semanticMap[matchedKey] || `Visual representation of ${normalized}`;
  const name = matchedKey || normalized;

  return {
    name,
    description,
    style: STYLE_PRESETS[preset],
    tags: normalized.split(' ').filter(word => word.length > 2)
  };
}

/**
 * Validate icon configuration
 */
export function validateIconConfig(config: unknown): { 
  success: boolean; 
  data?: IconConfig; 
  errors?: string[] 
} {
  try {
    const validated = IconConfigSchema.parse(config);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`) 
      };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

/**
 * Generate prompt variants for A/B testing
 */
export function generatePromptVariants(config: IconConfig): {
  standard: string;
  detailed: string;
  creative: string;
  minimal: string;
} {
  const standard = buildIconPrompt(config);
  
  const detailed = buildIconPrompt({
    ...config,
    description: `${config.description}. Focus on clarity and professional appearance with precise geometric construction.`
  });

  const creative = buildCreativeIconPrompt(config);

  const minimal = `Create a ${config.output.format} icon for "${config.name}": ${config.description}. Style: ${config.style.strokeWeight} strokes, ${config.style.fill} fill, ${config.style.cornerStyle} corners. Canvas: ${config.dimensions.canvasSize}px. No text or labels.`;

  return { standard, detailed, creative, minimal };
}

export default {
  buildIconPrompt,
  buildCreativeIconPrompt,
  parseInputToConfig,
  validateIconConfig,
  generatePromptVariants,
  STYLE_PRESETS,
  IconConfigSchema
};