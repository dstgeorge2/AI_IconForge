import { IMAGE_ANALYSIS_PROMPTS } from './contextualPrompts';

export interface ImageAnalysisResult {
  category: 'tech' | 'ui' | 'nature' | 'objects' | 'abstract' | 'people' | 'symbols';
  confidence: number;
  primaryFeatures: string[];
  suggestedMetaphor: string;
  contextualPrompt: string;
}

export function generateAdaptivePrompt(fileName: string, imageContext?: string): string {
  // Analyze filename for context clues
  const fileNameLower = fileName.toLowerCase();
  let category: ImageAnalysisResult['category'] = 'objects';
  let contextualPrompt = '';

  // Determine category from filename patterns
  if (fileNameLower.includes('icon') || fileNameLower.includes('ui') || fileNameLower.includes('button')) {
    category = 'ui';
    contextualPrompt = IMAGE_ANALYSIS_PROMPTS.ui;
  } else if (fileNameLower.includes('tech') || fileNameLower.includes('gear') || fileNameLower.includes('code')) {
    category = 'tech';
    contextualPrompt = IMAGE_ANALYSIS_PROMPTS.tech;
  } else if (fileNameLower.includes('nature') || fileNameLower.includes('tree') || fileNameLower.includes('plant')) {
    category = 'nature';
    contextualPrompt = IMAGE_ANALYSIS_PROMPTS.nature;
  } else if (fileNameLower.includes('abstract') || fileNameLower.includes('concept')) {
    category = 'abstract';
    contextualPrompt = IMAGE_ANALYSIS_PROMPTS.abstract;
  } else {
    category = 'objects';
    contextualPrompt = IMAGE_ANALYSIS_PROMPTS.objects;
  }

  return `
ADAPTIVE ANALYSIS FOR ${category.toUpperCase()} CATEGORY:

${contextualPrompt}

ENHANCED INSTRUCTIONS:
1. First, identify the primary subject and its essential characteristics
2. Consider the most universally recognizable icon metaphor for this concept
3. Apply geometric reduction while preserving key identifying features
4. Ensure the icon works at 16dp minimum size
5. Validate against Vectra style guide requirements

CATEGORY-SPECIFIC OPTIMIZATIONS:
${getCategorySpecificOptimizations(category)}

Remember: The goal is immediate recognition through simple geometry, not artistic representation.
`;
}

function getCategorySpecificOptimizations(category: ImageAnalysisResult['category']): string {
  switch (category) {
    case 'ui':
      return `
- Prioritize interface conventions (three lines = menu, magnifying glass = search)
- Use minimal detail with maximum clarity
- Ensure compatibility with common UI frameworks
- Test mental model against established patterns`;

    case 'tech':
      return `
- Focus on functional representation over aesthetic
- Use geometric abstractions that suggest technical concepts
- Avoid overly complex mechanical details
- Emphasize the "what it does" over "what it looks like"`;

    case 'nature':
      return `
- Reduce organic forms to geometric equivalents
- Maintain recognizable silhouettes (tree = triangle on rectangle)
- Use universal natural metaphors
- Balance abstraction with immediate recognition`;

    case 'objects':
      return `
- Focus on the most distinctive features of the object
- Use geometric simplification while preserving recognition
- Consider the object's primary function or use case
- Maintain proportional relationships between elements`;

    case 'abstract':
      return `
- Use established symbolic conventions (lightbulb = idea, arrow = direction)
- Rely on cultural universals rather than specific interpretations
- Create clear metaphorical connections
- Avoid ambiguous or overly stylized representations`;

    case 'people':
      return `
- Use simple geometric forms (circle for head, basic body shape)
- Focus on universal human characteristics
- Avoid specific cultural or demographic details
- Maintain respectful and inclusive representation`;

    case 'symbols':
      return `
- Preserve essential symbolic meaning
- Use established iconographic conventions
- Ensure cross-cultural recognition
- Maintain symbolic clarity at small sizes`;

    default:
      return `
- Identify the core concept and its most universal representation
- Use geometric primitives to maintain clarity
- Test recognition at minimum sizes
- Follow established icon conventions where applicable`;
  }
}

export const QUALITY_ASSURANCE_PROMPTS = {
  preGeneration: `
QUALITY CHECKLIST - VERIFY BEFORE GENERATING:
□ Image analysis complete - primary subject identified
□ Universal metaphor selected - culturally neutral
□ Geometric reduction planned - essential features preserved
□ Vectra compliance verified - all rules considered
□ Size testing considered - will work at 16dp minimum
`,

  postGeneration: `
VALIDATION CHECKLIST - VERIFY AFTER GENERATING:
□ ViewBox is exactly "0 0 24 24"
□ All stroke-width values are exactly "2"
□ Elements positioned within 20x20dp live area
□ No forbidden effects (gradients, shadows, filters)
□ Stroke color is black (#000000)
□ All coordinates are integers (no decimals)
□ Icon is immediately recognizable
□ JSON format is valid and complete
`
};