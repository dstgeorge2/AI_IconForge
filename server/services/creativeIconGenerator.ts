/**
 * Creative Hand-Drawn Isometric Icon Generator
 * Implements playful, energetic icon generation with organic personality
 */

import Anthropic from '@anthropic-ai/sdk';
import { getCreativeStylePrompt, validateCreativeStyle } from './creativeStyleGuide';
import { ensureValidDownloadableSVG } from './svgOptimizer';
import { validateWindchillIcon, WindchillIconMetadata } from './windchillIconValidator';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "dummy_key",
});

export interface CreativeVariantResponse {
  svg: string;
  explanation: string;
  confidence: number;
  metadata: {
    approach: string;
    source: string;
    size: string;
    optimized: boolean;
    model: string;
    creativeStyle: {
      isometric: boolean;
      handDrawn: boolean;
      decorativeElements: string[];
      personality: string;
    };
    windchillCompliance?: {
      score: number;
      valid: boolean;
      errors: string[];
      warnings: string[];
    };
  };
}

export interface CreativeMultiVariantResponse {
  variants: {
    'creative-one-to-one': CreativeVariantResponse;
    'creative-ui-intent': CreativeVariantResponse;
    'creative-material': CreativeVariantResponse;
    'creative-carbon': CreativeVariantResponse;
    'creative-filled': CreativeVariantResponse;
  };
  processingTime: number;
  totalSize: string;
  model: string;
  styleGuide: string;
}

/**
 * Generate a single creative icon variant using Claude
 */
async function generateCreativeIconVariant(
  imageName: string,
  base64Image: string,
  approach: string,
  additionalPrompt: string = ''
): Promise<CreativeVariantResponse> {
  try {
    console.log(`🎨 Creative Generation - Starting ${approach} variant...`);
    const startTime = Date.now();

    // Get creative style prompt
    const creativePrompt = getCreativeStylePrompt(approach);

    const message = await anthropic.messages.create({
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `${creativePrompt}

## IMAGE ANALYSIS CONTEXT
Generate a creative hand-drawn isometric style icon based on this image: "${imageName}"

${additionalPrompt ? `## ADDITIONAL CONTEXT\n${additionalPrompt}` : ''}

Create an icon that captures the essence while adding creative personality through:
- Slight isometric tilt for dynamic energy
- Hand-drawn organic imperfections  
- Four-pointed star sparkles as accents
- Bold black strokes with rounded corners
- Playful yet professional character

The icon should be immediately recognizable while having distinctive creative flair.`
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image
              }
            }
          ]
        }
      ],
      // "claude-sonnet-4-20250514" (Updated to use latest model)
      model: "claude-3-5-sonnet-20241022",
    });

    const result = parseCreativeIconResponse(message.content[0].text);
    
    // Validate creative style
    const creativeValidation = validateCreativeStyle(result.svg);
    
    // Ensure valid downloadable SVG
    const validSVG = ensureValidDownloadableSVG(result.svg);
    
    // Windchill compliance validation
    const windchillMetadata: WindchillIconMetadata = {
      domain: 'creative',
      function: approach.replace('-', '_'),
      userRole: 'designer',
      iconType: 'creative_object',
      systemArea: 'ui',
      description: result.explanation
    };
    const windchillValidation = validateWindchillIcon(validSVG, windchillMetadata);

    // Calculate creative confidence
    const baseConfidence = 85;
    const creativeBonus = creativeValidation.valid ? 10 : 0;
    const finalConfidence = Math.min(95, baseConfidence + creativeBonus);

    const processingTime = Date.now() - startTime;
    console.log(`✨ Creative Generation - ${approach} complete in ${processingTime}ms`);

    return {
      svg: validSVG,
      explanation: result.explanation || "Creative hand-drawn isometric icon with playful personality.",
      confidence: finalConfidence,
      metadata: {
        approach,
        source: 'claude-creative',
        size: `${(validSVG.length / 1024).toFixed(1)}KB`,
        optimized: true,
        model: 'claude-3-5-sonnet',
        creativeStyle: {
          isometric: validSVG.includes('transform') || validSVG.includes('rotate'),
          handDrawn: true,
          decorativeElements: extractDecorativeElements(validSVG),
          personality: 'playful-energetic'
        },
        windchillCompliance: {
          score: windchillValidation.score,
          valid: windchillValidation.valid,
          errors: windchillValidation.errors,
          warnings: windchillValidation.warnings
        }
      }
    };

  } catch (error) {
    console.error(`❌ Creative Generation - ${approach} failed:`, error);
    return {
      svg: generateCreativeFallback(approach),
      explanation: `Creative generation failed for ${approach} variant. Using playful fallback with hand-drawn style.`,
      confidence: 40,
      metadata: {
        approach,
        source: 'creative-fallback',
        size: '1.5KB',
        optimized: false,
        model: 'claude-fallback',
        creativeStyle: {
          isometric: true,
          handDrawn: true,
          decorativeElements: ['sparkles', 'organic-curves'],
          personality: 'playful-fallback'
        },
        windchillCompliance: {
          score: 60,
          valid: false,
          errors: ['Generation failed'],
          warnings: ['Using creative fallback SVG']
        }
      }
    };
  }
}

/**
 * Generate all 5 creative icon variants
 */
export async function generateCreativeMultiVariantIcons(
  imageName: string,
  base64Image: string,
  additionalPrompt: string = ''
): Promise<CreativeMultiVariantResponse> {
  console.log('🎨 Creative Multi-Variant Generation - Starting...');
  const startTime = Date.now();
  
  try {
    // Generate all creative variants in parallel
    const [creativeOneToOne, creativeUiIntent, creativeMaterial, creativeCarbon, creativeFilled] = await Promise.all([
      generateCreativeIconVariant(imageName, base64Image, 'creative-one-to-one', additionalPrompt),
      generateCreativeIconVariant(imageName, base64Image, 'creative-ui-intent', additionalPrompt),
      generateCreativeIconVariant(imageName, base64Image, 'creative-material', additionalPrompt),
      generateCreativeIconVariant(imageName, base64Image, 'creative-carbon', additionalPrompt),
      generateCreativeIconVariant(imageName, base64Image, 'creative-filled', additionalPrompt)
    ]);

    const processingTime = Date.now() - startTime;
    
    // Calculate total optimized size
    const totalSizeBytes = [creativeOneToOne, creativeUiIntent, creativeMaterial, creativeCarbon, creativeFilled]
      .map(v => parseFloat(v.metadata.size.replace('KB', '')) * 1024)
      .reduce((sum, size) => sum + size, 0);
    const totalSize = `${(totalSizeBytes / 1024).toFixed(1)}KB`;

    console.log(`✨ Creative Multi-Variant Generation - Complete in ${processingTime}ms`);

    return {
      variants: {
        'creative-one-to-one': creativeOneToOne,
        'creative-ui-intent': creativeUiIntent,
        'creative-material': creativeMaterial,
        'creative-carbon': creativeCarbon,
        'creative-filled': creativeFilled
      },
      processingTime,
      totalSize,
      model: 'claude-creative-3-5-sonnet',
      styleGuide: 'creative-hand-drawn-isometric'
    };

  } catch (error) {
    console.error('❌ Creative Multi-Variant Generation - Failed:', error);
    throw new Error(`Creative multi-variant generation failed: ${error.message}`);
  }
}

/**
 * Generate creative icons from text description
 */
export async function generateCreativeIconsFromText(textDescription: string): Promise<CreativeMultiVariantResponse> {
  console.log('🎯 Creative Text-based Generation - Starting...');
  const startTime = Date.now();

  try {
    const variants = await Promise.all([
      generateCreativeTextVariant('creative-one-to-one', textDescription),
      generateCreativeTextVariant('creative-ui-intent', textDescription),
      generateCreativeTextVariant('creative-material', textDescription),
      generateCreativeTextVariant('creative-carbon', textDescription),
      generateCreativeTextVariant('creative-filled', textDescription)
    ]);

    const processingTime = Date.now() - startTime;
    const totalSizeBytes = variants.map(v => parseFloat(v.metadata.size.replace('KB', '')) * 1024).reduce((sum, size) => sum + size, 0);
    const totalSize = `${(totalSizeBytes / 1024).toFixed(1)}KB`;

    console.log(`✨ Creative Text-based Generation - Complete in ${processingTime}ms`);

    return {
      variants: {
        'creative-one-to-one': variants[0],
        'creative-ui-intent': variants[1],
        'creative-material': variants[2],
        'creative-carbon': variants[3],
        'creative-filled': variants[4]
      },
      processingTime,
      totalSize,
      model: 'claude-creative-text',
      styleGuide: 'creative-hand-drawn-isometric'
    };

  } catch (error) {
    console.error('❌ Creative Text Generation - Failed:', error);
    throw new Error(`Creative text generation failed: ${error.message}`);
  }
}

async function generateCreativeTextVariant(approach: string, textDescription: string): Promise<CreativeVariantResponse> {
  const prompt = getCreativeStylePrompt(approach);

  const message = await anthropic.messages.create({
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `${prompt}

## TEXT DESCRIPTION TO INTERPRET
"${textDescription}"

Create a creative hand-drawn isometric icon that represents this concept with playful personality and organic charm.`
      }
    ],
    // "claude-sonnet-4-20250514" (Updated to use latest model)
    model: "claude-3-5-sonnet-20241022",
  });

  const result = parseCreativeIconResponse(message.content[0].text);
  const validSVG = ensureValidDownloadableSVG(result.svg);
  
  // Windchill validation for text-based creative icons
  const windchillMetadata: WindchillIconMetadata = {
    domain: 'creative',
    function: textDescription.toLowerCase().replace(/\s+/g, '_'),
    userRole: 'designer',
    iconType: 'creative_object',
    systemArea: 'ui',
    description: result.explanation
  };
  const windchillValidation = validateWindchillIcon(validSVG, windchillMetadata);

  return {
    svg: validSVG,
    explanation: result.explanation,
    confidence: 88,
    metadata: {
      approach,
      source: 'claude-creative-text',
      size: `${(validSVG.length / 1024).toFixed(1)}KB`,
      optimized: true,
      model: 'claude-3-5-sonnet',
      creativeStyle: {
        isometric: validSVG.includes('transform') || validSVG.includes('rotate'),
        handDrawn: true,
        decorativeElements: extractDecorativeElements(validSVG),
        personality: 'playful-creative'
      },
      windchillCompliance: {
        score: windchillValidation.score,
        valid: windchillValidation.valid,
        errors: windchillValidation.errors,
        warnings: windchillValidation.warnings
      }
    }
  };
}

function parseCreativeIconResponse(content: string): { svg: string; explanation: string } {
  try {
    // Try to parse as JSON first
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.svg && parsed.explanation) {
        return { svg: parsed.svg, explanation: parsed.explanation };
      }
    }
    
    // Extract SVG from content
    const svgMatch = content.match(/<svg[^>]*>[\s\S]*?<\/svg>/i);
    if (svgMatch) {
      return {
        svg: svgMatch[0],
        explanation: 'Creative hand-drawn isometric icon with organic personality'
      };
    }
    
    throw new Error('No valid SVG found in response');
  } catch (error) {
    console.error('Failed to parse creative response:', error);
    return {
      svg: generateCreativeFallback('creative-generic'),
      explanation: 'Creative fallback icon with hand-drawn style'
    };
  }
}

function generateCreativeFallback(approach: string): string {
  const creativeElements = {
    'creative-one-to-one': `
      <circle cx="12" cy="11" r="6" stroke-width="2.5" transform="rotate(-15 12 11)"/>
      <circle cx="8" cy="7" r="1" fill="currentColor"/>
      <circle cx="16" cy="15" r="0.5" fill="currentColor"/>
      <path d="M6 6l2 2M18 6l-2 2M6 18l2-2M18 18l-2-2" stroke-width="1.5" stroke-linecap="round"/>`,
    'creative-ui-intent': `
      <rect x="5" y="8" width="14" height="8" rx="2" stroke-width="2.5" transform="skewX(-10)"/>
      <circle cx="10" cy="5" r="1" fill="currentColor"/>
      <circle cx="14" cy="19" r="0.5" fill="currentColor"/>
      <path d="M4 4l2 2M20 4l-2 2" stroke-width="1.5"/>`,
    'creative-material': `
      <path d="M12 4l6 6-6 6-6-6z" stroke-width="2.5" transform="rotate(10 12 10)"/>
      <circle cx="7" cy="7" r="0.5" fill="currentColor"/>
      <circle cx="17" cy="17" r="1" fill="currentColor"/>
      <path d="M3 12h2M19 12h2M12 3v2M12 19v2" stroke-width="1.5"/>`,
    'creative-carbon': `
      <rect x="6" y="6" width="12" height="12" rx="2" stroke-width="2.5" transform="rotate(-5 12 12)"/>
      <circle cx="9" cy="9" r="0.5" fill="currentColor"/>
      <circle cx="15" cy="15" r="1" fill="currentColor"/>
      <path d="M3 3l3 3M18 3l3 3M3 21l3-3M21 21l-3-3" stroke-width="1"/>`,
    'creative-filled': `
      <circle cx="12" cy="12" r="7" fill="currentColor" transform="rotate(20 12 12)"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
      <circle cx="8" cy="6" r="0.5" fill="currentColor"/>
      <circle cx="16" cy="18" r="1" fill="currentColor"/>`
  };

  const fallbackContent = creativeElements[approach] || creativeElements['creative-one-to-one'];
  
  return ensureValidDownloadableSVG(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    ${fallbackContent}
  </svg>`);
}

function extractDecorativeElements(svg: string): string[] {
  const elements: string[] = [];
  
  if (svg.includes('circle') && svg.includes('fill')) {
    elements.push('dots');
  }
  if (svg.includes('star') || svg.includes('polygon')) {
    elements.push('sparkles');
  }
  if (svg.includes('transform') || svg.includes('rotate')) {
    elements.push('isometric-tilt');
  }
  if (svg.includes('rx=') || svg.includes('stroke-linecap="round"')) {
    elements.push('organic-curves');
  }
  
  return elements.length > 0 ? elements : ['hand-drawn'];
}

export default { generateCreativeMultiVariantIcons, generateCreativeIconsFromText };