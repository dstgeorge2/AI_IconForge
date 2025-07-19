/**
 * OpenAI-powered Icon Generation Service
 * Optimized for GPT-4o Vision API with Windchill compliance
 */

import OpenAI from 'openai';
import { IconVariantResponse, MultiVariantIconResponse } from '../../shared/schema';
import { optimizeSVG } from './svgOptimizer';
import { validateSVG } from './svgValidation';
import { validateIcon } from './iconValidation';
import { validateIconAtMultipleSizes } from './previewValidator';
import { generateIntelligentPrompt } from './intelligentPrompting';
import { validateWindchillIcon, WindchillIconMetadata } from './windchillIconValidator';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy_key",
});

export interface OpenAIVariantResponse {
  svg: string;
  explanation: string;
  confidence: number;
  metadata: {
    approach: string;
    source: string;
    size: string;
    optimized: boolean;
    model: string;
    windchillCompliance?: {
      score: number;
      valid: boolean;
      errors: string[];
      warnings: string[];
    };
  };
}

export interface OpenAIMultiVariantResponse {
  variants: {
    'one-to-one': OpenAIVariantResponse;
    'ui-intent': OpenAIVariantResponse;
    'material': OpenAIVariantResponse;
    'carbon': OpenAIVariantResponse;
    'filled': OpenAIVariantResponse;
  };
  processingTime: number;
  totalSize: string;
  model: string;
}

/**
 * Generate a single icon variant using OpenAI GPT-4o
 */
async function generateOpenAIIconVariant(
  imageName: string,
  base64Image: string,
  approach: string,
  additionalPrompt: string = ''
): Promise<OpenAIVariantResponse> {
  try {
    console.log(`🤖 OpenAI Generation - Starting ${approach} variant...`);
    const startTime = Date.now();

    // Generate intelligent prompt
    const intelligentPrompt = await generateIntelligentPrompt(imageName, base64Image, additionalPrompt);
    
    // Get approach-specific prompt
    const systemPrompt = getOpenAIPromptForApproach(approach, intelligentPrompt);

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Latest OpenAI model with vision capabilities
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Generate a Windchill-compliant SVG icon based on this image. ${additionalPrompt ? `Additional context: ${additionalPrompt}` : ''}`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000
    });

    const result = parseOpenAIIconResponse(response.choices[0].message.content);
    
    // Validate and optimize SVG
    const svgValidation = await validateSVG(result.svg);
    const validation = await validateIcon(result.svg);
    const previewValidation = await validateIconAtMultipleSizes(result.svg);
    
    // Optimize SVG for production
    const optimizedSVG = optimizeSVG(result.svg);
    
    // Windchill compliance validation
    const windchillMetadata: WindchillIconMetadata = {
      domain: 'workflow',
      function: approach.replace('-', '_'),
      userRole: 'engineer',
      iconType: approach.includes('action') ? 'action' : 'object',
      systemArea: 'general',
      description: result.explanation
    };
    const windchillValidation = validateWindchillIcon(optimizedSVG.svg, windchillMetadata);
    
    // Use best available SVG
    const finalSVG = svgValidation.isValid ? optimizedSVG.svg : generateOpenAIFallback();

    // Calculate confidence
    const baseConfidence = 88; // OpenAI tends to be more consistent
    const adjustedConfidence = Math.min(baseConfidence, validation.overallScore, svgValidation.confidence);

    const processingTime = Date.now() - startTime;
    console.log(`✅ OpenAI Generation - ${approach} complete in ${processingTime}ms`);

    return {
      svg: finalSVG,
      explanation: result.explanation || "Optimized geometric icon generated using OpenAI GPT-4o vision analysis.",
      confidence: adjustedConfidence,
      metadata: {
        approach,
        source: 'openai-gpt4o',
        size: optimizedSVG.metadata.size,
        optimized: true,
        model: 'gpt-4o',
        windchillCompliance: {
          score: windchillValidation.score,
          valid: windchillValidation.valid,
          errors: windchillValidation.errors,
          warnings: windchillValidation.warnings
        }
      }
    };

  } catch (error) {
    console.error(`❌ OpenAI Generation - ${approach} failed:`, error);
    return {
      svg: generateOpenAIFallback(),
      explanation: `OpenAI generation failed for ${approach} variant. Error: ${error.message}`,
      confidence: 25,
      metadata: {
        approach,
        source: 'openai-fallback',
        size: '1.2KB',
        optimized: false,
        model: 'gpt-4o-fallback',
        windchillCompliance: {
          score: 50,
          valid: false,
          errors: ['Generation failed'],
          warnings: ['Using fallback SVG']
        }
      }
    };
  }
}

/**
 * Generate all 5 icon variants using OpenAI
 */
export async function generateOpenAIMultiVariantIcons(
  imageName: string,
  base64Image: string,
  additionalPrompt: string = ''
): Promise<OpenAIMultiVariantResponse> {
  console.log('🚀 OpenAI Multi-Variant Generation - Starting...');
  const startTime = Date.now();
  
  try {
    // Generate all variants in parallel for better performance
    const [oneToOne, uiIntent, material, carbon, filled] = await Promise.all([
      generateOpenAIIconVariant(imageName, base64Image, 'one-to-one', additionalPrompt),
      generateOpenAIIconVariant(imageName, base64Image, 'ui-intent', additionalPrompt),
      generateOpenAIIconVariant(imageName, base64Image, 'material', additionalPrompt),
      generateOpenAIIconVariant(imageName, base64Image, 'carbon', additionalPrompt),
      generateOpenAIIconVariant(imageName, base64Image, 'filled', additionalPrompt)
    ]);

    const processingTime = Date.now() - startTime;
    
    // Calculate total optimized size
    const totalSizeBytes = [oneToOne, uiIntent, material, carbon, filled]
      .map(v => parseFloat(v.metadata.size.replace('KB', '')) * 1024)
      .reduce((sum, size) => sum + size, 0);
    const totalSize = `${(totalSizeBytes / 1024).toFixed(1)}KB`;

    console.log(`✅ OpenAI Multi-Variant Generation - Complete in ${processingTime}ms`);

    return {
      variants: {
        'one-to-one': oneToOne,
        'ui-intent': uiIntent,
        'material': material,
        'carbon': carbon,
        'filled': filled
      },
      processingTime,
      totalSize,
      model: 'gpt-4o'
    };

  } catch (error) {
    console.error('❌ OpenAI Multi-Variant Generation - Failed:', error);
    throw new Error(`OpenAI multi-variant generation failed: ${error.message}`);
  }
}

/**
 * Generate icons from text description using OpenAI
 */
export async function generateOpenAIIconsFromText(textDescription: string): Promise<OpenAIMultiVariantResponse> {
  console.log('🎯 OpenAI Text-based Generation - Starting...');
  const startTime = Date.now();

  try {
    const variants = await Promise.all([
      generateOpenAITextVariant('one-to-one', textDescription),
      generateOpenAITextVariant('ui-intent', textDescription),
      generateOpenAITextVariant('material', textDescription),
      generateOpenAITextVariant('carbon', textDescription),
      generateOpenAITextVariant('filled', textDescription)
    ]);

    const processingTime = Date.now() - startTime;
    const totalSizeBytes = variants.map(v => parseFloat(v.metadata.size.replace('KB', '')) * 1024).reduce((sum, size) => sum + size, 0);
    const totalSize = `${(totalSizeBytes / 1024).toFixed(1)}KB`;

    console.log(`✅ OpenAI Text-based Generation - Complete in ${processingTime}ms`);

    return {
      variants: {
        'one-to-one': variants[0],
        'ui-intent': variants[1],
        'material': variants[2],
        'carbon': variants[3],
        'filled': variants[4]
      },
      processingTime,
      totalSize,
      model: 'gpt-4o-text'
    };

  } catch (error) {
    console.error('❌ OpenAI Text Generation - Failed:', error);
    throw new Error(`OpenAI text generation failed: ${error.message}`);
  }
}

async function generateOpenAITextVariant(approach: string, textDescription: string): Promise<OpenAIVariantResponse> {
  const prompt = getOpenAITextPromptForApproach(approach, textDescription);

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: prompt
      },
      {
        role: "user",
        content: `Generate a Windchill-compliant SVG icon for: "${textDescription}"`
      }
    ],
    response_format: { type: "json_object" },
    max_tokens: 2000
  });

  const result = parseOpenAIIconResponse(response.choices[0].message.content);
  const optimizedSVG = optimizeSVG(result.svg);
  
  // Windchill validation for text-based icons
  const windchillMetadata: WindchillIconMetadata = {
    domain: 'workflow',
    function: textDescription.toLowerCase().replace(/\s+/g, '_'),
    userRole: 'engineer',
    iconType: 'object',
    systemArea: 'general',
    description: result.explanation
  };
  const windchillValidation = validateWindchillIcon(optimizedSVG.svg, windchillMetadata);

  return {
    svg: optimizedSVG.svg,
    explanation: result.explanation,
    confidence: 85,
    metadata: {
      approach,
      source: 'openai-gpt4o-text',
      size: optimizedSVG.metadata.size,
      optimized: true,
      model: 'gpt-4o',
      windchillCompliance: {
        score: windchillValidation.score,
        valid: windchillValidation.valid,
        errors: windchillValidation.errors,
        warnings: windchillValidation.warnings
      }
    }
  };
}

/**
 * Get OpenAI-optimized prompts for each approach
 */
function getOpenAIPromptForApproach(approach: string, intelligentPrompt: any): string {
  const baseRequirements = `
## WINDCHILL ENTERPRISE REQUIREMENTS
- 24x24dp canvas, 20x20dp live area, 2dp padding
- 2dp black stroke weight, square stroke endings
- Orthographic perspective only (no 3D/isometric)
- Pixel-snapped geometry for technical precision
- Single recognizable metaphor
- No gradients, shadows, or decorative elements
- Must be readable at 16dp minimum size
- Function-first design for enterprise workflows
- Role-aware for engineers, planners, manufacturers
- Industrial tone suitable for manufacturing environments

## OUTPUT FORMAT
Respond with a JSON object containing:
{
  "svg": "Complete SVG code with viewBox='0 0 24 24'",
  "explanation": "Clear description of the icon design and purpose"
}
`;

  switch (approach) {
    case 'one-to-one':
      return `# 1:1 VISUAL RECONSTRUCTION - WINDCHILL ENTERPRISE
You are an expert icon designer creating enterprise-grade icons for PTC Windchill manufacturing software.

Analyze the image and recreate it as a precise technical icon following Windchill design standards.

## ANALYSIS CONTEXT
- Primary Subject: ${intelligentPrompt.imageAnalysis.primarySubject}
- Visual Elements: ${intelligentPrompt.imageAnalysis.visualElements.join(', ')}
- Key Features: ${intelligentPrompt.imageAnalysis.recognizableFeatures.join(', ')}

${baseRequirements}`;

    case 'ui-intent':
      return `# UI INTENT FUSION - WINDCHILL ENTERPRISE
You are an expert icon designer creating enterprise-grade icons for PTC Windchill manufacturing software.

Combine image analysis with filename semantics to create an icon for complex enterprise workflows.

## SEMANTIC CONTEXT
- Filename: ${intelligentPrompt.semanticAnalysis.filename}
- Detected Action: ${intelligentPrompt.semanticAnalysis.detectedAction}
- Detected Object: ${intelligentPrompt.semanticAnalysis.detectedObject}
- Intent: ${intelligentPrompt.semanticAnalysis.universalMetaphor}

## VISUAL CONTEXT
- Image Shows: ${intelligentPrompt.imageAnalysis.primarySubject}
- Visual Elements: ${intelligentPrompt.imageAnalysis.visualElements.join(', ')}

${baseRequirements}`;

    case 'material':
      return `# MATERIAL DESIGN - WINDCHILL ADAPTED
You are an expert icon designer creating enterprise-grade icons for PTC Windchill manufacturing software.

Create an icon following Google Material Design principles adapted for Windchill enterprise use.

## MATERIAL ADAPTATIONS FOR WINDCHILL
- Variable Font Attributes: Weight 400, Fill 0, Grade 0, Optical Size 24dp
- Square stroke endings (adapted from Material's rounded style)
- Enterprise precision over consumer aesthetics
- Suitable for dense technical interfaces

${baseRequirements}`;

    case 'carbon':
      return `# IBM CARBON DESIGN - WINDCHILL ENTERPRISE
You are an expert icon designer creating enterprise-grade icons for PTC Windchill manufacturing software.

Create an icon following IBM Carbon Design system enhanced for Windchill enterprise complexity.

## CARBON PRINCIPLES FOR WINDCHILL
- 2dp stroke weight with sharp, precise lines
- Geometric precision suitable for technical workflows
- Enhanced precision for CAD/manufacturing context
- Support for object-heavy UIs (BOMs, change controls)

${baseRequirements}`;

    case 'filled':
      return `# FILLED STYLE - WINDCHILL HIGH CONTRAST
You are an expert icon designer creating enterprise-grade icons for PTC Windchill manufacturing software.

Create a high-contrast filled icon for enterprise interfaces.

## FILLED PRINCIPLES FOR WINDCHILL
- Solid filled shapes with minimal outlines
- Industrial-strength contrast for various lighting conditions
- Suitable for active/selected states in complex interfaces
- Enhanced visibility for manufacturing floor use

${baseRequirements}`;

    default:
      return baseRequirements;
  }
}

function getOpenAITextPromptForApproach(approach: string, textDescription: string): string {
  const baseRequirements = `
## WINDCHILL ENTERPRISE REQUIREMENTS
- 24x24dp canvas, 20x20dp live area, 2dp padding
- 2dp black stroke weight, square stroke endings
- Orthographic perspective only (no 3D/isometric)
- Pixel-snapped geometry for technical precision
- Single recognizable metaphor
- No gradients, shadows, or decorative elements
- Must be readable at 16dp minimum size
- Function-first design for enterprise workflows

## OUTPUT FORMAT
Respond with a JSON object containing:
{
  "svg": "Complete SVG code with viewBox='0 0 24 24'",
  "explanation": "Clear description of the icon design and purpose"
}

## TEXT DESCRIPTION TO INTERPRET
"${textDescription}"
`;

  return `You are an expert icon designer creating enterprise-grade icons for PTC Windchill manufacturing software. Create a ${approach} style icon based on the text description.${baseRequirements}`;
}

function parseOpenAIIconResponse(content: string): { svg: string; explanation: string } {
  try {
    const parsed = JSON.parse(content);
    return {
      svg: parsed.svg || generateOpenAIFallback(),
      explanation: parsed.explanation || 'OpenAI generated icon'
    };
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error);
    return {
      svg: generateOpenAIFallback(),
      explanation: 'Failed to parse OpenAI response'
    };
  }
}

function generateOpenAIFallback(): string {
  return `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M9 9l6 6m0-6l-6 6"/>
  </svg>`;
}

export default { generateOpenAIMultiVariantIcons, generateOpenAIIconsFromText };