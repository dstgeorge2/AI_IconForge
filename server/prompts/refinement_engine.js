// REFINEMENT ENGINE - Interactive Icon Refinement System
// Purpose: Handle user feedback and iteratively improve icon generation

import ComplexityAnalyzer, { DesignSystemMatcher } from './complexity_analyzer.js';
import { TwoPassIconGenerator } from './icon_prompt_engine.js';
import parseIconName from './name_intent_parser.js';

export class RefinementEngine {
  constructor() {
    this.complexityAnalyzer = new ComplexityAnalyzer();
    this.designMatcher = new DesignSystemMatcher();
    this.generator = new TwoPassIconGenerator();
  }

  async processUserFeedback(originalIcon, feedback, semanticIntent) {
    const refinementType = this.categorizeFeedback(feedback);
    
    switch (refinementType.type) {
      case 'simplification':
        return await this.handleSimplificationRequest(originalIcon, feedback, semanticIntent);
      case 'style_change':
        return await this.handleStyleChangeRequest(originalIcon, feedback, semanticIntent);
      case 'element_modification':
        return await this.handleElementModification(originalIcon, feedback, semanticIntent);
      case 'design_system':
        return await this.handleDesignSystemRequest(originalIcon, feedback, semanticIntent);
      default:
        return await this.handleGeneralRefinement(originalIcon, feedback, semanticIntent);
    }
  }

  categorizeFeedback(feedback) {
    const feedbackLower = feedback.toLowerCase();
    
    // Simplification requests
    if (feedbackLower.includes('simpl') || feedbackLower.includes('less busy') || 
        feedbackLower.includes('minimal') || feedbackLower.includes('clean')) {
      return { type: 'simplification', confidence: 0.9 };
    }
    
    // Style system requests
    if (feedbackLower.includes('material') || feedbackLower.includes('google')) {
      return { type: 'design_system', system: 'material', confidence: 0.9 };
    }
    if (feedbackLower.includes('carbon') || feedbackLower.includes('ibm')) {
      return { type: 'design_system', system: 'carbon', confidence: 0.9 };
    }
    
    // Shape changes
    if (feedbackLower.includes('circle') || feedbackLower.includes('square') || 
        feedbackLower.includes('triangle') || feedbackLower.includes('rectangle')) {
      return { type: 'element_modification', target: 'shape', confidence: 0.8 };
    }
    
    // Position changes
    if (feedbackLower.includes('move') || feedbackLower.includes('position') || 
        feedbackLower.includes('center') || feedbackLower.includes('corner')) {
      return { type: 'element_modification', target: 'position', confidence: 0.8 };
    }
    
    // Style changes
    if (feedbackLower.includes('thicker') || feedbackLower.includes('thinner') || 
        feedbackLower.includes('bold') || feedbackLower.includes('stroke')) {
      return { type: 'style_change', target: 'stroke', confidence: 0.8 };
    }
    
    return { type: 'general', confidence: 0.5 };
  }

  async handleSimplificationRequest(originalIcon, feedback, semanticIntent) {
    const complexity = this.complexityAnalyzer.analyzeComplexity(originalIcon.svg, originalIcon.metadata);
    const suggestions = this.complexityAnalyzer.generateSimplificationSuggestions(
      this.complexityAnalyzer.parseSVGForGeometry(originalIcon.svg), 
      originalIcon.metadata
    );

    const simplificationPrompt = this.buildSimplificationPrompt(
      originalIcon, 
      feedback, 
      semanticIntent, 
      suggestions
    );

    return {
      type: 'simplification',
      prompt: simplificationPrompt,
      reasoning: 'Generating simplified version based on complexity analysis',
      suggestions: suggestions,
      complexity_analysis: complexity
    };
  }

  async handleStyleChangeRequest(originalIcon, feedback, semanticIntent) {
    const styleChanges = this.parseStyleChanges(feedback);
    const stylePrompt = this.buildStyleChangePrompt(originalIcon, styleChanges, semanticIntent);

    return {
      type: 'style_change',
      prompt: stylePrompt,
      reasoning: `Applying style changes: ${styleChanges.join(', ')}`,
      changes: styleChanges
    };
  }

  async handleElementModification(originalIcon, feedback, semanticIntent) {
    const modifications = this.parseElementModifications(feedback);
    const modificationPrompt = this.buildElementModificationPrompt(
      originalIcon, 
      modifications, 
      semanticIntent
    );

    return {
      type: 'element_modification',
      prompt: modificationPrompt,
      reasoning: `Modifying elements: ${modifications.join(', ')}`,
      modifications: modifications
    };
  }

  async handleDesignSystemRequest(originalIcon, feedback, semanticIntent) {
    const systemType = feedback.toLowerCase().includes('material') ? 'material' : 'carbon';
    const systemMatch = systemType === 'material' 
      ? this.designMatcher.findMaterialMatch(semanticIntent)
      : this.designMatcher.findCarbonMatch(semanticIntent);

    const systemPrompt = this.buildDesignSystemPrompt(
      originalIcon, 
      systemType, 
      systemMatch, 
      semanticIntent
    );

    return {
      type: 'design_system',
      prompt: systemPrompt,
      reasoning: `Applying ${systemType} design system patterns`,
      system: systemType,
      reference_icon: systemMatch
    };
  }

  async handleGeneralRefinement(originalIcon, feedback, semanticIntent) {
    const generalPrompt = this.buildGeneralRefinementPrompt(
      originalIcon, 
      feedback, 
      semanticIntent
    );

    return {
      type: 'general_refinement',
      prompt: generalPrompt,
      reasoning: 'Applying general user feedback',
      feedback: feedback
    };
  }

  buildSimplificationPrompt(originalIcon, feedback, semanticIntent, suggestions) {
    return `ICON REFINEMENT: SIMPLIFICATION REQUEST

ORIGINAL ICON ANALYSIS:
${originalIcon.svg}

USER FEEDBACK: "${feedback}"

SEMANTIC INTENT:
• Action: ${semanticIntent.action}
• Object: ${semanticIntent.object}
• Context: ${semanticIntent.contextual_scope}

SIMPLIFICATION STRATEGY:
${suggestions.map(s => `• ${s.description} (${s.impact} impact)`).join('\n')}

REFINEMENT INSTRUCTIONS:
1. Identify the core metaphor that must be preserved
2. Remove decorative elements and secondary details
3. Combine overlapping or redundant shapes
4. Ensure minimum element size of 2dp for 16dp scaling
5. Increase whitespace around elements
6. Maintain 2dp stroke width throughout
7. Keep only essential elements for recognition

SPECIFIC SIMPLIFICATION RULES:
• Maximum 2 main elements (1 primary + 1 supporting)
• Remove sparkles, dots, and decorative elements
• Convert complex curves to simple geometric shapes
• Ensure 30% minimum whitespace ratio
• Focus on universal metaphor recognition

Generate a simplified version that maintains the core concept while dramatically reducing visual complexity. Return JSON format with simplified SVG and updated metadata.`;
  }

  buildStyleChangePrompt(originalIcon, styleChanges, semanticIntent) {
    return `ICON REFINEMENT: STYLE MODIFICATION

ORIGINAL ICON:
${originalIcon.svg}

REQUESTED STYLE CHANGES:
${styleChanges.map(change => `• ${change}`).join('\n')}

SEMANTIC INTENT:
• Action: ${semanticIntent.action}
• Object: ${semanticIntent.object}
• Metaphor: ${semanticIntent.metaphor}

STYLE MODIFICATION INSTRUCTIONS:
1. Preserve the core metaphor and layout
2. Apply requested style changes while maintaining consistency
3. Ensure all changes comply with 2dp stroke width rule
4. Maintain geometric precision (integer coordinates)
5. Keep elements within 20x20dp live area

Apply the requested style changes while maintaining the Vectra design system compliance. Return JSON format with updated SVG.`;
  }

  buildElementModificationPrompt(originalIcon, modifications, semanticIntent) {
    return `ICON REFINEMENT: ELEMENT MODIFICATION

ORIGINAL ICON:
${originalIcon.svg}

REQUESTED MODIFICATIONS:
${modifications.map(mod => `• ${mod}`).join('\n')}

SEMANTIC INTENT:
• Action: ${semanticIntent.action}
• Object: ${semanticIntent.object}
• Metaphor: ${semanticIntent.metaphor}

ELEMENT MODIFICATION INSTRUCTIONS:
1. Identify elements to be modified
2. Apply changes while maintaining metaphor clarity
3. Ensure all modifications follow geometric constraints
4. Maintain visual balance and hierarchy
5. Keep 2dp stroke width and integer coordinates

Apply the requested element modifications while preserving the icon's semantic meaning and design system compliance. Return JSON format with modified SVG.`;
  }

  buildDesignSystemPrompt(originalIcon, systemType, referenceIcon, semanticIntent) {
    const systemName = systemType === 'material' ? 'Google Material Design' : 'IBM Carbon Design';
    const systemPrinciples = systemType === 'material' 
      ? 'Rounded corners, filled states, consistent proportions, 24dp grid'
      : 'Sharp corners, outlined states, precise geometry, 16dp grid adapted to 24dp';

    return `ICON REFINEMENT: ${systemName.toUpperCase()} STYLE

ORIGINAL ICON:
${originalIcon.svg}

TARGET DESIGN SYSTEM: ${systemName}
REFERENCE ICON: ${referenceIcon || 'Generic pattern'}

SEMANTIC INTENT:
• Action: ${semanticIntent.action}
• Object: ${semanticIntent.object}
• Metaphor: ${semanticIntent.metaphor}

${systemName.toUpperCase()} STYLE PRINCIPLES:
• ${systemPrinciples}
• Maintain semantic clarity and universal recognition
• Follow ${systemType} iconography patterns

DESIGN SYSTEM ADAPTATION INSTRUCTIONS:
1. Analyze the reference ${systemType} icon pattern
2. Adapt current icon to match ${systemType} visual language
3. Maintain core metaphor while adopting ${systemType} styling
4. Ensure compatibility with our 24dp Vectra system
5. Keep 2dp stroke width for consistency

Transform the icon to match ${systemName} style while maintaining Vectra system compatibility. Return JSON format with redesigned SVG.`;
  }

  buildGeneralRefinementPrompt(originalIcon, feedback, semanticIntent) {
    return `ICON REFINEMENT: GENERAL FEEDBACK

ORIGINAL ICON:
${originalIcon.svg}

USER FEEDBACK: "${feedback}"

SEMANTIC INTENT:
• Action: ${semanticIntent.action}
• Object: ${semanticIntent.object}
• Metaphor: ${semanticIntent.metaphor}

GENERAL REFINEMENT INSTRUCTIONS:
1. Carefully analyze the user's feedback
2. Identify specific changes requested
3. Apply changes while maintaining design system compliance
4. Preserve core metaphor and semantic meaning
5. Ensure all modifications follow geometric constraints
6. Maintain 2dp stroke width and integer coordinates
7. Keep elements within 20x20dp live area

Apply the user's feedback thoughtfully while maintaining icon clarity and design system compliance. Return JSON format with refined SVG.`;
  }

  parseStyleChanges(feedback) {
    const changes = [];
    const feedbackLower = feedback.toLowerCase();
    
    if (feedbackLower.includes('thicker') || feedbackLower.includes('bold')) {
      changes.push('Increase visual weight');
    }
    if (feedbackLower.includes('thinner') || feedbackLower.includes('light')) {
      changes.push('Decrease visual weight');
    }
    if (feedbackLower.includes('rounded') || feedbackLower.includes('soft')) {
      changes.push('Add rounded corners');
    }
    if (feedbackLower.includes('sharp') || feedbackLower.includes('angular')) {
      changes.push('Use sharp corners');
    }
    if (feedbackLower.includes('filled') || feedbackLower.includes('solid')) {
      changes.push('Add fill to elements');
    }
    if (feedbackLower.includes('outline') || feedbackLower.includes('hollow')) {
      changes.push('Use outline only');
    }
    
    return changes;
  }

  parseElementModifications(feedback) {
    const modifications = [];
    const feedbackLower = feedback.toLowerCase();
    
    // Shape changes
    if (feedbackLower.includes('circle')) {
      modifications.push('Change primary shape to circle');
    }
    if (feedbackLower.includes('square')) {
      modifications.push('Change primary shape to square');
    }
    if (feedbackLower.includes('triangle')) {
      modifications.push('Change primary shape to triangle');
    }
    
    // Position changes
    if (feedbackLower.includes('center')) {
      modifications.push('Center elements');
    }
    if (feedbackLower.includes('top')) {
      modifications.push('Move elements to top');
    }
    if (feedbackLower.includes('bottom')) {
      modifications.push('Move elements to bottom');
    }
    if (feedbackLower.includes('left')) {
      modifications.push('Move elements to left');
    }
    if (feedbackLower.includes('right')) {
      modifications.push('Move elements to right');
    }
    
    // Size changes
    if (feedbackLower.includes('larger') || feedbackLower.includes('bigger')) {
      modifications.push('Increase element size');
    }
    if (feedbackLower.includes('smaller') || feedbackLower.includes('tiny')) {
      modifications.push('Decrease element size');
    }
    
    return modifications;
  }

  // Generate alternative suggestions based on complexity
  generateComplexityBasedAlternatives(complexityScore, semanticIntent) {
    const alternatives = [];
    
    if (complexityScore > 0.7) {
      alternatives.push({
        title: 'Simplified Core Metaphor',
        description: 'Use only the essential shape for this concept',
        type: 'simplification',
        confidence: 0.9
      });
    }
    
    if (complexityScore > 0.5) {
      const materialMatch = this.designMatcher.findMaterialMatch(semanticIntent);
      const carbonMatch = this.designMatcher.findCarbonMatch(semanticIntent);
      
      if (materialMatch) {
        alternatives.push({
          title: 'Material Design Style',
          description: `Based on Material's ${materialMatch} pattern`,
          type: 'design_system',
          system: 'material',
          reference: materialMatch,
          confidence: 0.8
        });
      }
      
      if (carbonMatch) {
        alternatives.push({
          title: 'Carbon Design Style',
          description: `Based on Carbon's ${carbonMatch} pattern`,
          type: 'design_system',
          system: 'carbon',
          reference: carbonMatch,
          confidence: 0.8
        });
      }
    }
    
    return alternatives;
  }
}

export default RefinementEngine;