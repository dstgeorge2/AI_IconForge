// REPROMPT FIXER - 2nd Pass Issue Corrector
// Purpose: Generate corrective prompts for failed icon generation attempts
// Used when validation fails to guide AI toward compliant output

import SVGValidator from './validate_output.js';

class RepromptFixer {
  constructor() {
    this.validator = new SVGValidator();
    this.correctionTemplates = {
      geometry: {
        'Invalid ViewBox': 'Ensure the SVG uses exactly viewBox="0 0 24 24"',
        'Non-integer coordinates': 'Round all coordinate values to integers (no decimals)',
        'Live area violation': 'Position all elements within the 20x20dp live area (2dp padding from edges)'
      },
      stroke: {
        'Invalid stroke width': 'Set all stroke-width attributes to exactly "2"',
        'Non-standard stroke color': 'Use stroke="#000000" or stroke="black" for all elements',
        'Non-standard corner radius': 'Use rx="2" ry="2" for outer corners, rx="0" ry="0" for inner corners'
      },
      perspective: {
        'Forbidden visual effects': 'Remove all gradients, filters, shadows, and 3D effects',
        'Complex fill patterns': 'Use only solid fills or fill="none"'
      },
      composition: {
        'Too many elements': 'Simplify to maximum 3 main elements (1 primary + 2 supporting)',
        'Non-standard elements': 'Use only rect, circle, line, path, and basic SVG elements'
      }
    };
  }

  generateReprompt(originalPrompt, svgOutput, metadata = {}) {
    const validation = this.validator.validateSVG(svgOutput, metadata);
    
    if (validation.isValid) {
      return null; // No reprompt needed
    }

    const corrections = this.buildCorrections(validation.issues);
    const reprompt = this.buildRepromptStructure(originalPrompt, corrections, validation);
    
    return {
      needsReprompt: true,
      validation: validation,
      corrections: corrections,
      reprompt: reprompt,
      priority: this.determinePriority(validation.issues),
      attempt: 2
    };
  }

  buildCorrections(issues) {
    const corrections = {
      critical: [],
      warnings: [],
      suggestions: []
    };

    issues.forEach(issue => {
      const correction = this.generateCorrection(issue);
      
      switch (issue.category) {
        case 'CRITICAL':
          corrections.critical.push(correction);
          break;
        case 'WARNING':
          corrections.warnings.push(correction);
          break;
        case 'INFO':
          corrections.suggestions.push(correction);
          break;
      }
    });

    return corrections;
  }

  generateCorrection(issue) {
    const categoryTemplates = this.correctionTemplates[issue.type] || {};
    const template = categoryTemplates[issue.title];
    
    return {
      rule: issue.title,
      instruction: template || `Fix: ${issue.message}`,
      example: this.getExample(issue.type, issue.title),
      priority: issue.category
    };
  }

  getExample(type, title) {
    const examples = {
      geometry: {
        'Invalid ViewBox': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">',
        'Non-integer coordinates': '<rect x="4" y="6" width="16" height="12" stroke-width="2"/>',
        'Live area violation': '<!-- Keep all elements within x=2-22, y=2-22 -->'
      },
      stroke: {
        'Invalid stroke width': '<path stroke-width="2" stroke="#000000" fill="none"/>',
        'Non-standard stroke color': '<circle stroke="#000000" fill="none"/>',
        'Non-standard corner radius': '<rect rx="2" ry="2" stroke-width="2"/>'
      },
      perspective: {
        'Forbidden visual effects': '<!-- Use only stroke and fill, no gradients or filters -->',
        'Complex fill patterns': '<rect fill="none" stroke="#000000" stroke-width="2"/>'
      }
    };

    return examples[type]?.[title] || '';
  }

  buildRepromptStructure(originalPrompt, corrections, validation) {
    const criticalCorrections = corrections.critical.map(c => `- ${c.instruction}`).join('\n');
    const warningCorrections = corrections.warnings.map(c => `- ${c.instruction}`).join('\n');
    
    return `${originalPrompt}

CRITICAL CORRECTIONS REQUIRED:
The previous icon generation failed validation with ${validation.summary.critical} critical issues and ${validation.summary.warnings} warnings.

MANDATORY FIXES:
${criticalCorrections}

${warningCorrections ? `RECOMMENDED IMPROVEMENTS:\n${warningCorrections}` : ''}

VALIDATION REQUIREMENTS:
- ViewBox must be exactly "0 0 24 24"
- All stroke-width values must be exactly "2"
- All coordinates must be integers
- No gradients, filters, shadows, or 3D effects
- All elements within 20x20dp live area (2dp padding)
- Use only basic SVG elements (rect, circle, line, path)
- Stroke color must be "#000000" or "black"

QUALITY CHECKLIST:
□ Icon is immediately recognizable
□ Works at 16dp minimum size
□ Uses universal metaphors
□ Follows flat design principles
□ Meets geometric precision requirements

Please regenerate the icon with these corrections applied. Return ONLY the corrected JSON object with no additional text.`;
  }

  determinePriority(issues) {
    const critical = issues.filter(i => i.category === 'CRITICAL').length;
    const warnings = issues.filter(i => i.category === 'WARNING').length;
    
    if (critical > 0) return 'HIGH';
    if (warnings > 2) return 'MEDIUM';
    return 'LOW';
  }

  generateSpecificFixes(issues) {
    const fixes = {
      stroke_width: null,
      viewbox: null,
      coordinates: null,
      effects: null,
      accessibility: null
    };

    issues.forEach(issue => {
      switch (issue.type) {
        case 'geometry':
          if (issue.title.includes('ViewBox')) {
            fixes.viewbox = 'Set viewBox="0 0 24 24"';
          }
          if (issue.title.includes('coordinates')) {
            fixes.coordinates = 'Round all coordinates to integers';
          }
          break;
        case 'stroke':
          if (issue.title.includes('stroke width')) {
            fixes.stroke_width = 'Set all stroke-width="2"';
          }
          break;
        case 'perspective':
          if (issue.title.includes('effects')) {
            fixes.effects = 'Remove all gradients, filters, and shadows';
          }
          break;
      }
    });

    return Object.entries(fixes)
      .filter(([_, fix]) => fix !== null)
      .map(([type, fix]) => ({ type, fix }));
  }

  generateContextualGuidance(semanticIntent, issues) {
    const guidance = [];
    
    // Add context-specific guidance based on intent
    if (semanticIntent.action === 'add') {
      guidance.push('For add actions, use a clear plus sign (+) as modifier');
    }
    
    if (semanticIntent.object === 'desk') {
      guidance.push('For desk icons, use horizontal rectangle with vertical legs');
    }
    
    // Add guidance based on common issues
    if (issues.some(i => i.type === 'geometry')) {
      guidance.push('Focus on proper geometric alignment and integer coordinates');
    }
    
    if (issues.some(i => i.type === 'perspective')) {
      guidance.push('Maintain strict flat design - no depth, shadows, or 3D effects');
    }
    
    return guidance;
  }

  logRepromptAttempt(attempt, validation, corrections) {
    console.log(`🔄 Reprompt Attempt ${attempt}:`);
    console.log(`   Critical Issues: ${validation.summary.critical}`);
    console.log(`   Warnings: ${validation.summary.warnings}`);
    console.log(`   Corrections Applied: ${corrections.critical.length + corrections.warnings.length}`);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('   Issues:', validation.issues.map(i => `${i.title}: ${i.message}`));
    }
  }
}

export default RepromptFixer;

// Utility functions for common correction patterns
export const CommonFixes = {
  enforceStrokeWidth: (svg) => {
    return svg.replace(/stroke-width="[^"]*"/g, 'stroke-width="2"');
  },
  
  enforceViewBox: (svg) => {
    return svg.replace(/viewBox="[^"]*"/g, 'viewBox="0 0 24 24"');
  },
  
  removeGradients: (svg) => {
    return svg.replace(/<defs>[\s\S]*?<\/defs>/g, '')
              .replace(/fill="url\([^)]*\)"/g, 'fill="none"');
  },
  
  roundCoordinates: (svg) => {
    return svg.replace(/(\w+)="(\d+\.\d+)"/g, (match, attr, value) => {
      if (['x', 'y', 'cx', 'cy', 'x1', 'y1', 'x2', 'y2'].includes(attr)) {
        return `${attr}="${Math.round(parseFloat(value))}"`;
      }
      return match;
    });
  }
};