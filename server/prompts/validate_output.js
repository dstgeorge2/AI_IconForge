// SVG OUTPUT VALIDATOR
// Purpose: Validate generated SVG icons against comprehensive ruleset
// Used in 2-pass generation system for quality assurance

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load ruleset configurations
function loadRuleset(filename) {
  try {
    const path = join(__dirname, 'ruleset', filename);
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    console.warn(`Failed to load ruleset ${filename}:`, error.message);
    return {};
  }
}

const rules = {
  stroke: loadRuleset('stroke_and_line_rules.json'),
  grid: loadRuleset('grid_and_alignment.json'),
  shape: loadRuleset('shape_and_structure_rules.json'),
  perspective: loadRuleset('perspective_and_dimensionality.json'),
  output: loadRuleset('output_and_accessibility.json'),
  principles: loadRuleset('icon_principles.json')
};

// Validation categories
const ValidationCategories = {
  CRITICAL: 'CRITICAL',
  WARNING: 'WARNING',
  INFO: 'INFO'
};

class SVGValidator {
  constructor() {
    this.rules = rules;
    this.issues = [];
  }

  validateSVG(svgString, metadata = {}) {
    this.issues = [];
    
    // Parse SVG for analysis
    const svgData = this.parseSVG(svgString);
    
    // Run validation checks
    this.validateGeometry(svgData);
    this.validateStroke(svgData);
    this.validateGrid(svgData);
    this.validatePerspective(svgData);
    this.validateAccessibility(svgData);
    this.validateSemantics(svgData, metadata);
    
    return {
      isValid: this.issues.filter(i => i.category === ValidationCategories.CRITICAL).length === 0,
      issues: this.issues,
      summary: this.generateSummary(),
      repromptSuggestions: this.generateRepromptSuggestions()
    };
  }

  parseSVG(svgString) {
    const data = {
      viewBox: this.extractViewBox(svgString),
      strokeWidths: this.extractStrokeWidths(svgString),
      strokeColors: this.extractStrokeColors(svgString),
      elements: this.extractElements(svgString),
      coordinates: this.extractCoordinates(svgString),
      fills: this.extractFills(svgString),
      forbiddenEffects: this.checkForbiddenEffects(svgString),
      cornerRadii: this.extractCornerRadii(svgString)
    };
    
    return data;
  }

  extractViewBox(svg) {
    const match = svg.match(/viewBox=["']([^"']+)["']/);
    return match ? match[1] : null;
  }

  extractStrokeWidths(svg) {
    const matches = svg.matchAll(/stroke-width=["']([^"']+)["']/g);
    return Array.from(matches).map(match => parseFloat(match[1]));
  }

  extractStrokeColors(svg) {
    const matches = svg.matchAll(/stroke=["']([^"']+)["']/g);
    return Array.from(matches).map(match => match[1]);
  }

  extractElements(svg) {
    const matches = svg.matchAll(/<(\w+)(?:\s|>)/g);
    return Array.from(matches).map(match => match[1]);
  }

  extractCoordinates(svg) {
    const matches = svg.matchAll(/(?:x|y|cx|cy|x1|y1|x2|y2)=["']([^"']+)["']/g);
    return Array.from(matches).map(match => parseFloat(match[1]));
  }

  extractFills(svg) {
    const matches = svg.matchAll(/fill=["']([^"']+)["']/g);
    return Array.from(matches).map(match => match[1]);
  }

  checkForbiddenEffects(svg) {
    const forbidden = ['gradient', 'filter', 'shadow', 'defs', 'mask', 'clipPath', 'pattern'];
    return forbidden.filter(effect => svg.includes(effect));
  }

  extractCornerRadii(svg) {
    const matches = svg.matchAll(/(?:rx|ry)=["']([^"']+)["']/g);
    return Array.from(matches).map(match => parseFloat(match[1]));
  }

  validateGeometry(data) {
    // ViewBox validation
    if (data.viewBox !== '0 0 24 24') {
      this.addIssue(
        ValidationCategories.CRITICAL,
        'Invalid ViewBox',
        `ViewBox must be "0 0 24 24", found "${data.viewBox}"`,
        'geometry'
      );
    }

    // Coordinate validation
    const nonIntegerCoords = data.coordinates.filter(coord => coord % 1 !== 0);
    if (nonIntegerCoords.length > 0) {
      this.addIssue(
        ValidationCategories.CRITICAL,
        'Non-integer coordinates',
        `All coordinates must be integers. Found: ${nonIntegerCoords.join(', ')}`,
        'geometry'
      );
    }

    // Live area validation
    const outsideLiveArea = data.coordinates.filter(coord => coord < 2 || coord > 22);
    if (outsideLiveArea.length > 0) {
      this.addIssue(
        ValidationCategories.WARNING,
        'Live area violation',
        `Some elements may be outside 20x20dp live area. Coordinates: ${outsideLiveArea.join(', ')}`,
        'geometry'
      );
    }
  }

  validateStroke(data) {
    const expectedStrokeWidth = this.rules.stroke.stroke?.default_weight || '2dp';
    const expectedStrokeColor = this.rules.stroke.stroke?.color || '#000000';
    
    // Stroke width validation
    const invalidWidths = data.strokeWidths.filter(width => width !== 2);
    if (invalidWidths.length > 0) {
      this.addIssue(
        ValidationCategories.CRITICAL,
        'Invalid stroke width',
        `All strokes must be 2dp. Found: ${invalidWidths.join(', ')}`,
        'stroke'
      );
    }

    // Stroke color validation
    const invalidColors = data.strokeColors.filter(color => 
      color !== '#000000' && color !== 'black' && color !== 'currentColor'
    );
    if (invalidColors.length > 0) {
      this.addIssue(
        ValidationCategories.WARNING,
        'Non-standard stroke color',
        `Stroke should be black. Found: ${invalidColors.join(', ')}`,
        'stroke'
      );
    }

    // Corner radius validation
    const invalidRadii = data.cornerRadii.filter(radius => radius !== 0 && radius !== 2);
    if (invalidRadii.length > 0) {
      this.addIssue(
        ValidationCategories.WARNING,
        'Non-standard corner radius',
        `Corner radii should be 0 or 2dp. Found: ${invalidRadii.join(', ')}`,
        'stroke'
      );
    }
  }

  validateGrid(data) {
    // Element count validation
    const elementCount = data.elements.filter(el => ['rect', 'circle', 'line', 'path'].includes(el)).length;
    const maxElements = this.rules.shape.element_hierarchy?.supporting_limit + 1 || 3;
    
    if (elementCount > maxElements) {
      this.addIssue(
        ValidationCategories.WARNING,
        'Too many elements',
        `Icon should have maximum ${maxElements} main elements. Found: ${elementCount}`,
        'composition'
      );
    }

    // Allowed elements validation
    const allowedElements = ['svg', 'g', 'rect', 'circle', 'line', 'path', 'polygon', 'polyline'];
    const disallowedElements = data.elements.filter(el => !allowedElements.includes(el));
    
    if (disallowedElements.length > 0) {
      this.addIssue(
        ValidationCategories.WARNING,
        'Non-standard elements',
        `Using non-standard SVG elements: ${disallowedElements.join(', ')}`,
        'elements'
      );
    }
  }

  validatePerspective(data) {
    // Check for forbidden effects
    if (data.forbiddenEffects.length > 0) {
      this.addIssue(
        ValidationCategories.CRITICAL,
        'Forbidden visual effects',
        `Flat perspective only. Found: ${data.forbiddenEffects.join(', ')}`,
        'perspective'
      );
    }

    // Fill validation
    const problematicFills = data.fills.filter(fill => 
      fill !== 'none' && fill !== 'transparent' && !fill.startsWith('#')
    );
    if (problematicFills.length > 0) {
      this.addIssue(
        ValidationCategories.WARNING,
        'Complex fill patterns',
        `Simple fills preferred. Found: ${problematicFills.join(', ')}`,
        'perspective'
      );
    }
  }

  validateAccessibility(data) {
    const contrastMin = this.rules.output.accessibility_requirements?.contrast_ratio_min || '4.5:1';
    
    // Basic accessibility checks
    if (data.fills.some(fill => fill !== 'none' && fill !== 'transparent')) {
      this.addIssue(
        ValidationCategories.INFO,
        'Fill usage detected',
        'Ensure filled areas meet contrast requirements',
        'accessibility'
      );
    }

    // Size scalability check
    const minCoordDiff = Math.min(...data.coordinates.map((coord, i, arr) => 
      Math.abs(coord - arr[i + 1])
    ).filter(diff => diff > 0));
    
    if (minCoordDiff < 2) {
      this.addIssue(
        ValidationCategories.WARNING,
        'Small details may not scale',
        `Minimum detail size is ${minCoordDiff}dp. Consider 2dp minimum for 16dp scaling`,
        'accessibility'
      );
    }
  }

  validateSemantics(data, metadata) {
    // Validate metadata completeness
    if (!metadata.primaryShape) {
      this.addIssue(
        ValidationCategories.WARNING,
        'Missing metadata',
        'Primary shape description is missing',
        'semantics'
      );
    }

    if (!metadata.conceptualPurpose) {
      this.addIssue(
        ValidationCategories.WARNING,
        'Missing conceptual purpose',
        'Conceptual purpose explanation is missing',
        'semantics'
      );
    }

    // Decoration validation
    if (metadata.decorations && metadata.decorations.length > 0) {
      const sparkleCount = metadata.decorations
        .filter(d => d.type === 'sparkle')
        .reduce((sum, d) => sum + d.count, 0);
      
      if (sparkleCount > 3) {
        this.addIssue(
          ValidationCategories.WARNING,
          'Too many sparkles',
          `Maximum 3 sparkles allowed. Found: ${sparkleCount}`,
          'decoration'
        );
      }
    }
  }

  addIssue(category, title, message, type) {
    this.issues.push({
      category,
      title,
      message,
      type,
      timestamp: new Date().toISOString()
    });
  }

  generateSummary() {
    const critical = this.issues.filter(i => i.category === ValidationCategories.CRITICAL).length;
    const warnings = this.issues.filter(i => i.category === ValidationCategories.WARNING).length;
    const info = this.issues.filter(i => i.category === ValidationCategories.INFO).length;
    
    return {
      critical,
      warnings,
      info,
      total: this.issues.length,
      status: critical > 0 ? 'FAILED' : warnings > 0 ? 'WARNING' : 'PASSED'
    };
  }

  generateRepromptSuggestions() {
    const criticalIssues = this.issues.filter(i => i.category === ValidationCategories.CRITICAL);
    
    if (criticalIssues.length === 0) {
      return null;
    }

    return {
      shouldReprompt: true,
      corrections: criticalIssues.map(issue => ({
        rule: issue.title,
        correction: this.generateCorrection(issue)
      })),
      priority: 'high'
    };
  }

  generateCorrection(issue) {
    const corrections = {
      'Invalid ViewBox': 'Set viewBox="0 0 24 24"',
      'Invalid stroke width': 'Set all stroke-width="2"',
      'Non-integer coordinates': 'Round all coordinates to integers',
      'Forbidden visual effects': 'Remove gradients, filters, shadows, and other effects',
      'Invalid stroke color': 'Set stroke="#000000" or stroke="black"'
    };

    return corrections[issue.title] || `Fix: ${issue.message}`;
  }
}

export default SVGValidator;
export { ValidationCategories };