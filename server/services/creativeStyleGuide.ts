/**
 * Creative Hand-Drawn Isometric Style Guide
 * Implements playful, energetic icon generation with isometric perspective
 */

export interface CreativeStyleGuide {
  style_guide: {
    line_style: {
      weight: string;
      color: string;
      stroke_type: string;
      corner_style: string;
    };
    perspective: {
      type: string;
      angle: string;
      depth_effect: boolean;
    };
    shapes: {
      style: string;
      appearance: string;
      primary_elements: string;
      supporting_elements: string;
      decoration_elements: string;
    };
    icons_and_objects: {
      main_elements: {
        centerpiece: string;
        supporting_objects: string;
      };
      decorations: {
        sparkles: {
          style: string;
          size_variation: string;
          random_rotation: boolean;
          placement: string;
        };
        dots: {
          size: string;
          placement: string;
        };
      };
    };
    shading_and_fills: {
      fill_color: string;
      shading: string;
      depth_hinting: string;
    };
    composition: {
      layout: string;
      centering: string;
      motion_hint: string;
    };
    vibe: {
      feel: string;
      formality: string;
    };
    general_rules: {
      no_text: string;
      style_consistency: string;
      hand_drawn_feel: string;
      concept_flexibility: string;
    };
  };
}

export const CREATIVE_STYLE_GUIDE: CreativeStyleGuide = {
  style_guide: {
    line_style: {
      weight: "bold",
      color: "black",
      stroke_type: "solid",
      corner_style: "rounded"
    },
    perspective: {
      type: "isometric_tilt",
      angle: "slight",
      depth_effect: true
    },
    shapes: {
      style: "hand-drawn geometric",
      appearance: "slightly organic, not perfectly symmetrical",
      primary_elements: "main concept object related to the tool",
      supporting_elements: "simple related shapes that enhance the concept",
      decoration_elements: "sparkles, dots, simple accents"
    },
    icons_and_objects: {
      main_elements: {
        centerpiece: "visual representation of the tool or concept",
        supporting_objects: "minimal related objects if needed (optional)"
      },
      decorations: {
        sparkles: {
          style: "four-pointed stars",
          size_variation: "small to medium",
          random_rotation: true,
          placement: "around the main object, balanced"
        },
        dots: {
          size: "small",
          placement: "balanced but random for lively feel"
        }
      }
    },
    shading_and_fills: {
      fill_color: "white background",
      shading: "minimal",
      depth_hinting: "use bold shadows or thicker lines on one side"
    },
    composition: {
      layout: "square",
      centering: "main object roughly centered, with natural dynamic balance",
      motion_hint: "slight forward tilt or implied motion where appropriate"
    },
    vibe: {
      feel: "playful, creative, energetic",
      formality: "casual but clean"
    },
    general_rules: {
      no_text: "Don't include any text in the image",
      style_consistency: "all icons must follow the same line thickness, decoration style, and perspective",
      hand_drawn_feel: "allow small imperfections for personality",
      concept_flexibility: "adapt centerpiece objects according to the tool or idea theme without changing core style"
    }
  }
};

/**
 * Generate Creative Style Guide prompts for different approaches
 */
export function getCreativeStylePrompt(approach: string, context?: any): string {
  const baseCreativePrompt = `
## CREATIVE HAND-DRAWN ISOMETRIC STYLE GUIDE

### LINE STYLE
- **Weight**: Bold stroke weight (2-3px)
- **Color**: Pure black (#000000)
- **Type**: Solid, continuous lines
- **Corners**: Rounded corners for organic feel

### PERSPECTIVE & DEPTH
- **Type**: Slight isometric tilt for dynamic energy
- **Angle**: Subtle 15-20 degree rotation
- **Depth**: Use bold shadows or thicker lines on one side
- **3D Effect**: Minimal but present for visual interest

### SHAPES & GEOMETRY
- **Style**: Hand-drawn geometric with organic imperfections
- **Appearance**: Slightly asymmetrical, not perfectly rigid
- **Primary**: Main concept object (tool, action, or idea)
- **Supporting**: Simple complementary shapes
- **Decorations**: Four-pointed star sparkles, small dots, simple accents

### COMPOSITION & LAYOUT
- **Canvas**: 24x24dp square format
- **Centering**: Natural dynamic balance (not rigid center)
- **Motion**: Subtle forward tilt or implied movement
- **Live Area**: 20x20dp with 2dp padding

### DECORATIVE ELEMENTS
- **Sparkles**: Four-pointed stars, varied sizes, random rotation
- **Dots**: Small circular accents for liveliness  
- **Placement**: Balanced around main object, not overwhelming
- **Style**: Consistent with main line weight and style

### VISUAL PERSONALITY
- **Feel**: Playful, creative, energetic
- **Formality**: Casual but clean and professional
- **Imperfections**: Allow slight hand-drawn variations
- **Character**: Warm, approachable, distinctive

### TECHNICAL REQUIREMENTS
- No text or typography
- White/transparent background
- Consistent line thickness throughout
- Minimal shading (depth hints only)
- All elements must scale clearly to 16px minimum

## OUTPUT FORMAT
Generate a complete SVG icon following this creative style guide. The SVG must be:
- Valid XML with proper viewBox="0 0 24 24"
- Clean, optimized code structure
- Black strokes on transparent/white background
- Playful yet functional for UI use

Respond with JSON:
{
  "svg": "Complete SVG code here",
  "explanation": "Brief description of the creative design approach"
}
`;

  switch (approach) {
    case 'creative-one-to-one':
      return `${baseCreativePrompt}

## CREATIVE 1:1 APPROACH
Analyze the image and recreate it using the creative hand-drawn isometric style:
- Maintain the core recognizable elements from the image
- Apply slight isometric tilt and organic imperfections
- Add appropriate sparkles and decorative accents
- Keep the essential function while adding creative personality`;

    case 'creative-ui-intent':
      return `${baseCreativePrompt}

## CREATIVE UI INTENT APPROACH
Combine image analysis with semantic understanding:
- Interpret both visual elements and intended UI function
- Create a playful yet clear representation of the action/object
- Balance creativity with UI usability requirements
- Add personality while maintaining icon recognition`;

    case 'creative-material':
      return `${baseCreativePrompt}

## CREATIVE MATERIAL DESIGN FUSION
Blend Material Design principles with creative style:
- Use Material's structural approach as foundation
- Apply creative hand-drawn treatment over clean geometry
- Maintain Material's 24dp grid system
- Add organic touches while keeping Material's clarity`;

    case 'creative-carbon':
      return `${baseCreativePrompt}

## CREATIVE IBM CARBON FUSION
Combine Carbon Design precision with creative energy:
- Start with Carbon's geometric precision
- Apply hand-drawn organic treatment
- Maintain Carbon's technical clarity
- Add playful elements without losing professional feel`;

    case 'creative-filled':
      return `${baseCreativePrompt}

## CREATIVE FILLED APPROACH
Create high-contrast filled version with creative personality:
- Use solid fills with creative outlines
- Apply hand-drawn borders around filled shapes
- Maintain isometric perspective in filled forms
- Balance boldness with creative charm`;

    default:
      return baseCreativePrompt;
  }
}

/**
 * Validate SVG against creative style guide requirements
 */
export function validateCreativeStyle(svg: string): {
  valid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check for basic SVG structure
  if (!svg.includes('viewBox="0 0 24 24"')) {
    issues.push('Missing proper viewBox');
  }

  // Check for stroke properties
  if (!svg.includes('stroke=') && !svg.includes('fill=')) {
    issues.push('No visible strokes or fills detected');
  }

  // Check for creative elements (sparkles, dots, organic shapes)
  const hasCreativeElements = 
    svg.includes('star') || 
    svg.includes('circle') ||
    svg.includes('polygon') ||
    svg.match(/[Cc]urve|[Rr]ounded/);

  if (!hasCreativeElements) {
    suggestions.push('Consider adding creative elements like sparkles or organic curves');
  }

  // Check for isometric hints (transforms, rotations)
  const hasIsometricHints = 
    svg.includes('transform') ||
    svg.includes('rotate') ||
    svg.includes('skew');

  if (!hasIsometricHints) {
    suggestions.push('Consider adding subtle isometric perspective transforms');
  }

  return {
    valid: issues.length === 0,
    issues,
    suggestions
  };
}

export default {
  CREATIVE_STYLE_GUIDE,
  getCreativeStylePrompt,
  validateCreativeStyle
};