// ICON PROMPT ENGINE v1.0
// Purpose: Generate high-quality UI icons using semantic layering, AI prompting, and visual rulesets
// Based on: IBM Carbon, Google Material Icons, CDS token overlays

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import parseIconName from './name_intent_parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ------------------------------------------------------------
// 📁 LOAD MODULAR RULESETS
// ------------------------------------------------------------

function loadRuleset(filename) {
  try {
    const path = join(__dirname, 'ruleset', filename);
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    console.warn(`Failed to load ruleset ${filename}:`, error.message);
    return {};
  }
}

const rulesets = {
  principles: loadRuleset('icon_principles.json'),
  stroke: loadRuleset('stroke_and_line_rules.json'),
  grid: loadRuleset('grid_and_alignment.json'),
  shape: loadRuleset('shape_and_structure_rules.json'),
  semantic: loadRuleset('semantic_and_context_rules.json'),
  perspective: loadRuleset('perspective_and_dimensionality.json'),
  output: loadRuleset('output_and_accessibility.json'),
  enhanced_ui: loadRuleset('enhanced_ui_rules.json')
};

// ------------------------------------------------------------
// 🧠 UNIVERSAL SYSTEM THINKING
// ------------------------------------------------------------

const systemThinking = {
  icon_type: "UI_ICON",
  principles: [
    "Icons are not illustrations — they are compact functional symbols.",
    "Design for recognizability and clarity at small sizes (16dp minimum).",
    "Use strong metaphors that communicate instantly.",
    "Icons must be stylistically consistent across size, stroke, and shape.",
    "Flat, 2D orthographic perspective only. No shadows or dimensional illusions.",
    "Icons must snap to grid, align to keylines, and be pixel-perfect."
  ],
  influenced_by: ["IBM Carbon Icons", "Google Material Icons", "FontAwesome"],
  quality_gates: [
    "squint_test: Must be recognizable when squinting",
    "16dp_test: Must be clear at minimum size",
    "metaphor_test: Must use universal symbols",
    "consistency_test: Must match system patterns"
  ]
};

// ------------------------------------------------------------
// 🎯 ENHANCED SEMANTIC INTENT PARSER
// ------------------------------------------------------------

class SemanticIntentParser {
  constructor() {
    this.contextMapping = rulesets.semantic.filename_to_context || {};
  }

  parseFromFilename(filename) {
    // Use enhanced name parsing with comprehensive object mapping
    const parsed = parseIconName(filename);
    
    return {
      filename: parsed.name,
      original_filename: parsed.original_filename,
      action: parsed.action,
      object: parsed.object,
      modifier: parsed.modifier,
      intent: parsed.intent,
      icon_role: parsed.icon_role,
      contextual_scope: parsed.contextual_scope,
      metaphor: parsed.metaphor,
      complexity_level: parsed.complexity_level,
      semantic_tags: parsed.semantic_tags
    };
  }

  determineIconRole(action) {
    const roleMap = {
      'add': 'action-button',
      'edit': 'action-button',
      'delete': 'action-button',
      'view': 'navigation',
      'open': 'state-indicator',
      'close': 'state-indicator'
    };
    return roleMap[action] || 'general-icon';
  }

  determineContext(object) {
    const contextMap = {
      'desk': 'workspace layout, IT tool, CAD system',
      'node': 'network topology, system architecture',
      'file': 'document management, file system',
      'folder': 'organization, hierarchy',
      'user': 'identity, permissions, profiles',
      'workspace': 'environment, containers, contexts'
    };
    return contextMap[object] || 'general interface';
  }
}

// ------------------------------------------------------------
// 🏗️ ICON SPECIFICATION BUILDER
// ------------------------------------------------------------

class IconSpecBuilder {
  constructor(semanticIntent) {
    this.intent = semanticIntent;
    this.rules = rulesets;
  }

  buildVisualSpec() {
    const primaryShape = this.determinePrimaryShape();
    const modifier = this.determineModifier();
    
    return {
      canvas: this.rules.grid.canvas?.size || "24dp",
      live_area: this.rules.grid.canvas?.live_area || "20dp",
      padding: this.rules.grid.canvas?.padding || "2dp",
      alignment: "centered",
      primary_shape: primaryShape,
      modifier: modifier,
      stroke: {
        weight: this.rules.stroke.stroke?.default_weight || "2dp",
        color: this.rules.stroke.stroke?.color || "#000000",
        style: this.rules.stroke.stroke?.style || "solid",
        terminals: this.rules.stroke.stroke?.terminals || ["squared"],
        corner_radius: this.rules.stroke.stroke?.corner_radius || { outer: "2dp", inner: "square" }
      },
      decorations: this.determineDecorations(),
      angle_resolution: this.rules.stroke.angle_resolution?.allowed || [15, 30, 45, 90]
    };
  }

  determinePrimaryShape() {
    const { object, action } = this.intent;
    
    const shapeMap = {
      'desk': 'horizontal rectangle (14dp wide) with two vertical legs (2dp each)',
      'node': 'circle (12dp diameter) with optional connection points',
      'file': 'vertical rectangle (12dp × 16dp) with folded corner',
      'folder': 'trapezoid container with tab',
      'user': 'circle (8dp) for head, simplified body outline',
      'workspace': 'rounded rectangle container (16dp × 12dp)',
      'document': 'rectangle with corner fold and horizontal lines',
      'image': 'rectangle with mountain/triangle shape inside',
      'data': 'stack of horizontal rectangles with spacing'
    };
    
    return shapeMap[object] || 'geometric primitive representing the concept';
  }

  determineModifier() {
    const { action, modifier } = this.intent;
    
    const modifierMap = {
      'add': 'plus sign (4dp) positioned at top-right or center',
      'edit': 'pencil or edit lines overlay',
      'delete': 'x mark or trash indicator',
      'create': 'plus sign with sparkle decoration',
      'remove': 'minus sign or deletion indicator',
      'update': 'refresh arrow or indicator',
      'view': 'eye icon or viewing indicator',
      'open': 'opening indicator or arrow',
      'close': 'closing indicator or x',
      'save': 'down arrow or save indicator'
    };
    
    let result = modifierMap[action] || 'no modifier';
    
    if (modifier) {
      result += ` with ${modifier} styling`;
    }
    
    return result;
  }

  determineDecorations() {
    const { action } = this.intent;
    const decorationRules = this.rules.shape.decoration_rules || {};
    
    const needsSparkles = ['add', 'create', 'new'].includes(action);
    const needsDots = ['active', 'processing', 'live'].includes(action);
    
    return {
      sparkles: needsSparkles && decorationRules.sparkles?.allowed,
      sparkle_count: needsSparkles ? Math.min(decorationRules.sparkles?.max_count || 3, 2) : 0,
      dots: needsDots && decorationRules.dots?.allowed,
      dot_count: needsDots ? Math.min(decorationRules.dots?.max_count || 5, 3) : 0
    };
  }
}

// ------------------------------------------------------------
// 🎨 PROMPT GENERATOR
// ------------------------------------------------------------

class PromptGenerator {
  constructor() {
    this.parser = new SemanticIntentParser();
  }

  generatePrompt(filename, imageDescription = null) {
    // Pass 1: Semantic Intent Analysis
    const semanticIntent = this.parser.parseFromFilename(filename);
    const specBuilder = new IconSpecBuilder(semanticIntent);
    const visualSpec = specBuilder.buildVisualSpec();
    
    // Build comprehensive prompt
    const prompt = this.buildPromptStructure(semanticIntent, visualSpec, imageDescription);
    
    return {
      semanticIntent,
      visualSpec,
      prompt,
      validation: this.getValidationChecklist()
    };
  }

  buildPromptStructure(intent, spec, imageDescription) {
    return `${this.getSystemPrompt()}

${this.getSemanticAnalysis(intent, imageDescription)}

${this.getVisualSpecification(spec)}

${this.getRulesetInstructions()}

${this.getQualityAssurance()}

${this.getOutputFormat()}`;
  }

  getSystemPrompt() {
    return `You are an expert UI icon designer following the design principles of IBM Carbon Icons, Google Material Icons, and a custom enterprise design system.

SYSTEM PRINCIPLES:
${systemThinking.principles.map(p => `• ${p}`).join('\n')}

QUALITY GATES:
${systemThinking.quality_gates.map(g => `• ${g}`).join('\n')}

Your task is to create a pixel-perfect, scalable UI icon that communicates clearly and follows strict geometric constraints.`;
  }

  getSemanticAnalysis(intent, imageDescription) {
    return `SEMANTIC INTENT ANALYSIS:
• Filename: ${intent.filename}
• Action: ${intent.action}
• Object: ${intent.object}
• Intent: ${intent.intent}
• Icon Role: ${intent.icon_role}
• Context: ${intent.contextual_scope}
${imageDescription ? `• Image Description: ${imageDescription}` : ''}

METAPHOR SELECTION:
Choose the most universally recognized icon metaphor for "${intent.intent}". Consider cultural universality and immediate recognition.`;
  }

  getVisualSpecification(spec) {
    return `VISUAL SPECIFICATION:
• Canvas: ${spec.canvas} (viewBox="0 0 24 24")
• Live Area: ${spec.live_area} centered with ${spec.padding} padding
• Primary Shape: ${spec.primary_shape}
• Modifier: ${spec.modifier}
• Stroke Weight: ${spec.stroke.weight}
• Stroke Color: ${spec.stroke.color}
• Corner Radius: ${spec.stroke.corner_radius.outer} outer, ${spec.stroke.corner_radius.inner} inner
• Decorations: ${spec.decorations.sparkles ? `${spec.decorations.sparkle_count} sparkles` : 'none'} ${spec.decorations.dots ? `${spec.decorations.dot_count} dots` : ''}
• Angle Resolution: ${spec.angle_resolution.join(', ')}°`;
  }

  getRulesetInstructions() {
    const actionPatterns = rulesets.enhanced_ui.ui_icon_specific_rules?.recognition_patterns?.action_icons || {};
    const objectPatterns = rulesets.enhanced_ui.ui_icon_specific_rules?.recognition_patterns?.object_icons || {};
    
    return `STRICT RULESET COMPLIANCE:
• ${rulesets.principles.principles ? Object.values(rulesets.principles.principles).join('\n• ') : 'Follow clarity and consistency principles'}
• Stroke: ${rulesets.stroke.stroke?.default_weight || '2dp'} width, ${rulesets.stroke.stroke?.color || 'black'} color, ${rulesets.stroke.stroke?.style || 'solid'} style
• Perspective: ${rulesets.perspective.perspective || 'orthographic'} only, no ${rulesets.perspective.allow_3d ? '' : '3D, '}${rulesets.perspective.allow_tilt ? '' : 'tilt, '}depth effects
• Elements: Primary shape required, max ${rulesets.shape.elements?.supporting_limit || 2} supporting elements
• Grid: All coordinates must be integers, snap to pixel grid
• Accessibility: ${rulesets.output.contrast_ratio_min || '4.5:1'} contrast ratio minimum

ENHANCED UI ICON PATTERNS:
${this.getSpecificPatternGuidance(actionPatterns, objectPatterns)}

QUALITY METRICS:
• Immediate recognition: 95% recognition rate target
• Scale performance: 100% clarity at 16dp minimum
• Accessibility: WCAG 2.1 AA compliance
• Consistency: 90% visual consistency with system`;
  }

  getSpecificPatternGuidance(actionPatterns, objectPatterns) {
    const intent = this.intent;
    const guidance = [];
    
    if (actionPatterns[intent.action]) {
      guidance.push(`ACTION PATTERN: ${actionPatterns[intent.action]}`);
    }
    
    if (objectPatterns[intent.object]) {
      guidance.push(`OBJECT PATTERN: ${objectPatterns[intent.object]}`);
    }
    
    return guidance.join('\n') || 'Use universally recognized patterns for this concept';
  }

  getQualityAssurance() {
    return `QUALITY ASSURANCE PROCESS:
1. VISUAL ANALYSIS: Examine image for primary subject and context
2. CONCEPT IDENTIFICATION: Determine core concept and function
3. METAPHOR SELECTION: Choose universally recognized symbol
4. GEOMETRIC REDUCTION: Simplify to essential geometric primitives
5. COMPOSITION PLANNING: Center within live area with optical balance
6. STROKE APPLICATION: Apply consistent ${rulesets.stroke.stroke?.default_weight || '2dp'} stroke
7. VALIDATION: Verify against all ruleset requirements

CRITICAL SUCCESS FACTORS:
• Immediate recognition at 16dp minimum size
• Cultural universality (works globally)
• Geometric precision (integer coordinates only)
• Consistent stroke width throughout
• No forbidden effects (gradients, shadows, filters)
• Passes "squint test" for instant recognition`;
  }

  getOutputFormat() {
    return `OUTPUT REQUIREMENTS:
Return a JSON object with these exact fields:
{
  "svg": "complete SVG code with viewBox='0 0 24 24'",
  "primaryShape": "description of main geometric form",
  "decorations": [{"type": "sparkle|dot", "count": number, "placement": "description"}],
  "strokeWidth": 2,
  "canvasSize": 24,
  "fillUsed": boolean,
  "conceptualPurpose": "why this metaphor represents the concept",
  "validation": {
    "squint_test": "pass|fail",
    "16dp_test": "pass|fail",
    "metaphor_clarity": "pass|fail",
    "rule_compliance": "pass|fail"
  }
}

Return ONLY the JSON object with no additional text or formatting.`;
  }

  getValidationChecklist() {
    return {
      geometry: [
        "ViewBox is exactly '0 0 24 24'",
        "All stroke-width values are exactly '2'",
        "Elements positioned within 20x20dp live area",
        "All coordinates are integers (no decimals)"
      ],
      visual: [
        "No gradients, shadows, or filters",
        "Stroke color is black (#000000)",
        "Corner radius follows 2dp outer, square inner rule",
        "Flat orthographic perspective only"
      ],
      semantic: [
        "Icon represents the intended concept clearly",
        "Uses universal metaphors",
        "Immediately recognizable at 16dp",
        "Passes squint test"
      ],
      system: [
        "Follows IBM Carbon and Material Design principles",
        "Consistent with design system patterns",
        "Meets accessibility requirements",
        "Proper JSON format returned"
      ]
    };
  }
}

// ------------------------------------------------------------
// 🔄 2-PASS GENERATION SYSTEM
// ------------------------------------------------------------

export class TwoPassIconGenerator {
  constructor() {
    this.promptGenerator = new PromptGenerator();
  }

  async generateIcon(filename, imageDescription = null) {
    // Pass 1: Generate initial prompt and attempt
    const pass1 = this.promptGenerator.generatePrompt(filename, imageDescription);
    
    console.log('🎯 Pass 1 - Semantic Intent:', pass1.semanticIntent);
    console.log('🎨 Pass 1 - Visual Spec:', pass1.visualSpec);
    
    return {
      pass1,
      prompt: pass1.prompt,
      validation: pass1.validation
    };
  }

  validateOutput(svgOutput) {
    const issues = [];
    
    // Stroke width validation
    if (!svgOutput.includes('stroke-width="2"')) {
      issues.push("Stroke width must be exactly 2dp");
    }
    
    // ViewBox validation
    if (!svgOutput.includes('viewBox="0 0 24 24"')) {
      issues.push("ViewBox must be exactly '0 0 24 24'");
    }
    
    // Forbidden effects
    const forbiddenEffects = ['gradient', 'filter', 'shadow', 'fill="url('];
    forbiddenEffects.forEach(effect => {
      if (svgOutput.includes(effect)) {
        issues.push(`Forbidden effect detected: ${effect}`);
      }
    });
    
    return {
      valid: issues.length === 0,
      issues
    };
  }

  generateReprompt(issues, originalPrompt) {
    const corrections = issues.map(issue => `- ${issue}`).join('\n');
    
    return `${originalPrompt}

CRITICAL CORRECTIONS REQUIRED:
The previous icon generation violated the following rules:
${corrections}

Please regenerate the icon ensuring:
- Exact 2dp stroke width throughout
- ViewBox="0 0 24 24"
- No gradients, shadows, or filters
- Flat orthographic perspective only
- All coordinates are integers
- Centered within 20x20dp live area

Return ONLY the corrected JSON object.`;
  }
}

// ------------------------------------------------------------
// 🧪 EXPORT FOR REPLIT INTEGRATION
// ------------------------------------------------------------

export default TwoPassIconGenerator;
export { PromptGenerator, SemanticIntentParser, IconSpecBuilder };