import { z } from 'zod';

/*
 * ICON VALIDATION ENGINE
 * Implements hard constraints and soft guardrails for production-grade icon generation
 * Based on Material Design, Carbon Design, and industry best practices
 */

// Hard constraints (non-negotiable)
export const HARD_CONSTRAINTS = {
  COLOR: {
    rule: 'monochrome_only',
    description: 'All icons must be black (#000) or monochrome vector only',
    validator: (svg: string) => !svg.includes('fill="') || svg.includes('fill="none"') || svg.includes('fill="#000"') || svg.includes('fill="black"')
  },
  GEOMETRY: {
    rule: 'recognizable_metaphor',
    description: 'All geometry must represent a recognizable concept or metaphor',
    validator: (svg: string) => svg.includes('<path') || svg.includes('<rect') || svg.includes('<circle') || svg.includes('<line')
  },
  CANVAS: {
    rule: 'canvas_bounds',
    description: 'Icon must fit on 24x24dp canvas',
    validator: (svg: string) => {
      const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
      if (!viewBoxMatch) return false;
      const [x, y, width, height] = viewBoxMatch[1].split(' ').map(Number);
      return width <= 24 && height <= 24;
    }
  },
  STROKE_WEIGHT: {
    rule: 'consistent_stroke',
    description: 'Fixed 2dp stroke weight must be consistent',
    validator: (svg: string) => {
      const strokeMatches = svg.match(/stroke-width="([^"]+)"/g);
      if (!strokeMatches) return true; // No strokes is valid
      const weights = strokeMatches.map(match => match.match(/stroke-width="([^"]+)"/)?.[1]);
      return weights.every(weight => weight === weights[0]); // All weights must be same
    }
  },
  PERSPECTIVE: {
    rule: 'flat_frontal',
    description: 'Must be flat or front-facing, no isometric or skewed angles',
    validator: (svg: string) => !svg.includes('transform="rotate') && !svg.includes('transform="skew')
  },
  ALIGNMENT: {
    rule: 'pixel_grid',
    description: 'Geometry must align to pixel grid (whole integers)',
    validator: (svg: string) => {
      const coords = svg.match(/[xy]="([^"]+)"/g);
      if (!coords) return true;
      return coords.every(coord => {
        const value = coord.match(/[xy]="([^"]+)"/)?.[1];
        return value ? Number.isInteger(Number(value)) : true;
      });
    }
  }
};

// Soft guardrails (strong recommendations)
export const SOFT_GUARDRAILS = {
  LIVE_AREA: {
    rule: 'live_area_usage',
    description: 'Content should remain inside 20x20dp live area with 2dp padding',
    weight: 0.8
  },
  VISUAL_WEIGHT: {
    rule: 'balanced_composition',
    description: 'Balance all elements visually—avoid one-sided density',
    weight: 0.9
  },
  RECOGNIZABILITY: {
    rule: 'instant_recognition',
    description: 'Icon should be immediately recognizable without labels',
    weight: 0.95
  },
  SYSTEM_CONSISTENCY: {
    rule: 'shared_geometry',
    description: 'Use shared geometry patterns across icon sets',
    weight: 0.7
  }
};

// Icon semantic types
export const ICON_TYPES = {
  ACTION: 'action',
  OBJECT: 'object',
  STATUS: 'status',
  NAVIGATION: 'navigation',
  TOOL: 'tool',
  DATA: 'data',
  COMMUNICATION: 'communication',
  USER: 'user',
  SYSTEM: 'system',
  EDITOR: 'editor',
  FILE: 'file',
  DEVICE: 'device',
  MEDIA: 'media',
  INTERFACE: 'interface',
  LAYOUT: 'layout'
} as const;

// Validation result schema
export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  score: z.number().min(0).max(100),
  hardConstraintViolations: z.array(z.object({
    rule: z.string(),
    description: z.string(),
    severity: z.literal('error')
  })),
  softGuardrailWarnings: z.array(z.object({
    rule: z.string(),
    description: z.string(),
    severity: z.literal('warning'),
    weight: z.number()
  })),
  recommendations: z.array(z.string()),
  iconType: z.enum(Object.values(ICON_TYPES) as [string, ...string[]]).optional()
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

/**
 * Validates an SVG icon against hard constraints and soft guardrails
 */
export function validateIcon(svg: string, targetSystem: 'material' | 'carbon' | 'generic' = 'generic'): ValidationResult {
  const violations: ValidationResult['hardConstraintViolations'] = [];
  const warnings: ValidationResult['softGuardrailWarnings'] = [];
  const recommendations: string[] = [];

  // Check hard constraints
  for (const [key, constraint] of Object.entries(HARD_CONSTRAINTS)) {
    if (!constraint.validator(svg)) {
      violations.push({
        rule: constraint.rule,
        description: constraint.description,
        severity: 'error'
      });
    }
  }

  // Check soft guardrails
  if (targetSystem === 'material') {
    if (!svg.includes('stroke-width="2"')) {
      warnings.push({
        rule: 'material_stroke_weight',
        description: 'Material Design recommends 2dp stroke weight',
        severity: 'warning',
        weight: 0.8
      });
    }
    
    if (!svg.includes('rx="2"') && svg.includes('<rect')) {
      warnings.push({
        rule: 'material_corner_radius',
        description: 'Material Design recommends 2dp corner radius',
        severity: 'warning',
        weight: 0.7
      });
    }
  }

  if (targetSystem === 'carbon') {
    if (!svg.includes('fill="none"')) {
      warnings.push({
        rule: 'carbon_no_fill',
        description: 'Carbon Design uses outline style (no fill)',
        severity: 'warning',
        weight: 0.9
      });
    }
  }

  // Generate recommendations
  if (violations.length > 0) {
    recommendations.push('Fix all hard constraint violations before deployment');
  }
  
  if (warnings.length > 0) {
    recommendations.push('Address soft guardrail warnings to improve icon quality');
  }

  if (violations.length === 0 && warnings.length === 0) {
    recommendations.push('Icon meets all validation criteria - ready for production');
  }

  // Calculate score
  const hardConstraintScore = violations.length === 0 ? 100 : Math.max(0, 100 - (violations.length * 20));
  const softGuardrailScore = warnings.length === 0 ? 100 : Math.max(0, 100 - (warnings.reduce((sum, w) => sum + (w.weight * 10), 0)));
  const finalScore = Math.round((hardConstraintScore * 0.7) + (softGuardrailScore * 0.3));

  return {
    isValid: violations.length === 0,
    score: finalScore,
    hardConstraintViolations: violations,
    softGuardrailWarnings: warnings,
    recommendations,
    iconType: detectIconType(svg)
  };
}

/**
 * Detects the semantic type of an icon based on its geometry
 */
function detectIconType(svg: string): keyof typeof ICON_TYPES | undefined {
  // Simple heuristics for icon type detection
  if (svg.includes('plus') || svg.includes('+')) return 'ACTION';
  if (svg.includes('rect') && svg.includes('folder')) return 'OBJECT';
  if (svg.includes('circle') && svg.includes('check')) return 'STATUS';
  if (svg.includes('arrow')) return 'NAVIGATION';
  if (svg.includes('gear') || svg.includes('settings')) return 'TOOL';
  
  return undefined;
}

/**
 * Optical correction utilities
 */
export const OpticalCorrections = {
  // Shift elements slightly off-center for visual balance
  visualCenter: (x: number, y: number) => ({
    x: x + 0.5,
    y: y - 0.5
  }),
  
  // Adjust stroke weight for visual balance
  adjustStrokeWeight: (baseWeight: number, complexity: 'simple' | 'complex') => {
    return complexity === 'complex' ? Math.max(1, baseWeight - 0.5) : baseWeight;
  },
  
  // Scale inner elements for optical balance
  scaleInnerElements: (scale: number) => Math.max(0.8, scale * 0.95)
};

/**
 * Grid and keyline templates for different design systems
 */
export const GridTemplates = {
  material: {
    canvas: 24,
    liveArea: 20,
    padding: 2,
    keylineShapes: {
      square: { width: 18, height: 18 },
      circle: { radius: 10 },
      verticalRect: { width: 16, height: 20 },
      horizontalRect: { width: 20, height: 16 }
    }
  },
  carbon: {
    canvas: 24,
    liveArea: 20,
    padding: 2,
    strokeWeight: 2,
    cornerRadius: 2,
    terminals: 'square'
  }
};