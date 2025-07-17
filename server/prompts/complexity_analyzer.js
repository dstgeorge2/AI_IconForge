// COMPLEXITY ANALYZER - Smart Icon Complexity Rating System
// Purpose: Analyze generated icons for complexity and provide intelligent feedback/alternatives

import { parseSVGForGeometry } from './geometry_validator.js';

export class ComplexityAnalyzer {
  constructor() {
    this.thresholds = {
      low: 0.4,
      medium: 0.7,
      high: 1.0
    };
    
    this.complexityFactors = {
      elementCount: 0.3,
      metaphorClarity: 0.25,
      visualBalance: 0.2,
      smallSizeReadability: 0.15,
      strokeComplexity: 0.1
    };
  }

  analyzeComplexity(svgString, metadata = {}) {
    const shapes = parseSVGForGeometry(svgString);
    const analysis = {
      complexity_score: 0,
      rating: 'low',
      flags: [],
      recommend_simplification: false,
      alternatives: [],
      feedback: []
    };

    // Factor 1: Element Count Analysis
    const elementScore = this.analyzeElementCount(shapes);
    analysis.complexity_score += elementScore * this.complexityFactors.elementCount;

    // Factor 2: Metaphor Clarity
    const metaphorScore = this.analyzeMetaphorClarity(shapes, metadata);
    analysis.complexity_score += metaphorScore * this.complexityFactors.metaphorClarity;

    // Factor 3: Visual Balance
    const balanceScore = this.analyzeVisualBalance(shapes);
    analysis.complexity_score += balanceScore * this.complexityFactors.visualBalance;

    // Factor 4: Small Size Readability
    const readabilityScore = this.analyzeSmallSizeReadability(shapes);
    analysis.complexity_score += readabilityScore * this.complexityFactors.smallSizeReadability;

    // Factor 5: Stroke Complexity
    const strokeScore = this.analyzeStrokeComplexity(svgString);
    analysis.complexity_score += strokeScore * this.complexityFactors.strokeComplexity;

    // Determine rating and recommendations
    analysis.rating = this.determineRating(analysis.complexity_score);
    analysis.flags = this.generateFlags(shapes, svgString, metadata);
    analysis.recommend_simplification = analysis.complexity_score > this.thresholds.medium;
    analysis.alternatives = this.generateAlternatives(analysis.complexity_score, metadata);
    analysis.feedback = this.generateFeedback(analysis.complexity_score, analysis.flags);

    return analysis;
  }

  analyzeElementCount(shapes) {
    const mainElements = shapes.filter(s => !s.isDecoration).length;
    const decorativeElements = shapes.filter(s => s.isDecoration).length;
    
    // Score based on element count
    let score = 0;
    if (mainElements > 3) score += 0.3;
    if (mainElements > 5) score += 0.4;
    if (decorativeElements > 2) score += 0.2;
    if (decorativeElements > 4) score += 0.3;
    
    return Math.min(score, 1.0);
  }

  analyzeMetaphorClarity(shapes, metadata) {
    let score = 0;
    
    // Multiple competing metaphors
    const primaryElements = shapes.filter(s => s.isPrimary);
    if (primaryElements.length > 1) score += 0.4;
    
    // Unclear primary shape
    if (!metadata.primaryShape || metadata.primaryShape.length < 10) score += 0.3;
    
    // Too many different shape types
    const shapeTypes = [...new Set(shapes.map(s => s.type))];
    if (shapeTypes.length > 4) score += 0.2;
    
    return Math.min(score, 1.0);
  }

  analyzeVisualBalance(shapes) {
    let score = 0;
    
    // Calculate visual weight distribution
    const totalArea = shapes.reduce((sum, s) => sum + (s.width * s.height), 0);
    const avgArea = totalArea / shapes.length;
    
    // Check for heavily imbalanced elements
    const imbalancedElements = shapes.filter(s => 
      (s.width * s.height) > avgArea * 3 || (s.width * s.height) < avgArea * 0.3
    );
    
    if (imbalancedElements.length > 0) score += 0.3;
    
    // Check for overlapping elements
    const overlaps = this.findOverlaps(shapes);
    if (overlaps.length > 2) score += 0.4;
    
    return Math.min(score, 1.0);
  }

  analyzeSmallSizeReadability(shapes) {
    let score = 0;
    
    // Elements too small for 16dp scaling
    const tooSmallElements = shapes.filter(s => 
      Math.min(s.width, s.height) < 2
    );
    
    if (tooSmallElements.length > 0) score += 0.5;
    
    // Too many fine details
    const fineDetails = shapes.filter(s => 
      s.width < 4 || s.height < 4
    );
    
    if (fineDetails.length > 2) score += 0.3;
    
    return Math.min(score, 1.0);
  }

  analyzeStrokeComplexity(svgString) {
    let score = 0;
    
    // Count path commands (indicates complexity)
    const pathCommands = (svgString.match(/[MLHVCSQTA]/g) || []).length;
    if (pathCommands > 20) score += 0.3;
    if (pathCommands > 40) score += 0.4;
    
    // Check for curves vs straight lines
    const curveCommands = (svgString.match(/[CSQ]/g) || []).length;
    const straightCommands = (svgString.match(/[MLH]/g) || []).length;
    
    if (curveCommands > straightCommands) score += 0.2;
    
    return Math.min(score, 1.0);
  }

  determineRating(score) {
    if (score <= this.thresholds.low) return 'low';
    if (score <= this.thresholds.medium) return 'medium';
    return 'high';
  }

  generateFlags(shapes, svgString, metadata) {
    const flags = [];
    
    // Element count flags
    const mainElements = shapes.filter(s => !s.isDecoration).length;
    if (mainElements > 3) flags.push('Too many main elements');
    if (mainElements > 5) flags.push('Excessive element count');
    
    // Size flags
    const tooSmall = shapes.filter(s => Math.min(s.width, s.height) < 2);
    if (tooSmall.length > 0) flags.push('Elements too small for 16dp scaling');
    
    // Metaphor flags
    const primaryElements = shapes.filter(s => s.isPrimary);
    if (primaryElements.length > 1) flags.push('Multiple competing metaphors');
    if (primaryElements.length === 0) flags.push('No clear primary element');
    
    // Balance flags
    const overlaps = this.findOverlaps(shapes);
    if (overlaps.length > 2) flags.push('Too many overlapping elements');
    
    // Stroke complexity flags
    const pathCommands = (svgString.match(/[MLHVCSQTA]/g) || []).length;
    if (pathCommands > 30) flags.push('Stroke paths too complex');
    
    // Whitespace flags
    const totalShapeArea = shapes.reduce((sum, s) => sum + (s.width * s.height), 0);
    const canvasArea = 24 * 24;
    const whitespaceRatio = (canvasArea - totalShapeArea) / canvasArea;
    if (whitespaceRatio < 0.3) flags.push('Insufficient whitespace');
    
    return flags;
  }

  generateAlternatives(complexityScore, metadata) {
    const alternatives = [];
    
    if (complexityScore > this.thresholds.medium) {
      alternatives.push({
        type: 'simplified',
        title: 'Simplified Version',
        description: 'Auto-generate using only core metaphor',
        action: 'regenerate_simplified',
        confidence: 0.9
      });
    }
    
    if (complexityScore > this.thresholds.low) {
      alternatives.push({
        type: 'material_style',
        title: 'Material Design Style',
        description: 'Use Google Material icon patterns',
        action: 'apply_material_style',
        confidence: 0.8
      });
      
      alternatives.push({
        type: 'carbon_style',
        title: 'IBM Carbon Style',
        description: 'Use IBM Carbon icon patterns',
        action: 'apply_carbon_style',
        confidence: 0.8
      });
    }
    
    alternatives.push({
      type: 'custom_refinement',
      title: 'Custom Refinement',
      description: 'Provide text instructions for modifications',
      action: 'accept_text_refinement',
      confidence: 0.7
    });
    
    return alternatives;
  }

  generateFeedback(complexityScore, flags) {
    const feedback = [];
    
    if (complexityScore <= this.thresholds.low) {
      feedback.push({
        type: 'success',
        message: 'Icon complexity is optimal for UI use',
        severity: 'info'
      });
    } else if (complexityScore <= this.thresholds.medium) {
      feedback.push({
        type: 'warning',
        message: 'Icon may be slightly complex for small sizes (≤16dp)',
        severity: 'warning'
      });
    } else {
      feedback.push({
        type: 'error',
        message: 'Icon is too complex for clarity at small sizes',
        severity: 'error'
      });
    }
    
    // Specific feedback based on flags
    if (flags.includes('Too many main elements')) {
      feedback.push({
        type: 'suggestion',
        message: 'Consider combining elements into a single unified shape',
        severity: 'warning'
      });
    }
    
    if (flags.includes('Elements too small for 16dp scaling')) {
      feedback.push({
        type: 'suggestion',
        message: 'Increase minimum element size to 2dp for better scaling',
        severity: 'error'
      });
    }
    
    if (flags.includes('Multiple competing metaphors')) {
      feedback.push({
        type: 'suggestion',
        message: 'Choose one primary metaphor and make supporting elements secondary',
        severity: 'warning'
      });
    }
    
    if (flags.includes('Insufficient whitespace')) {
      feedback.push({
        type: 'suggestion',
        message: 'Add more whitespace around elements for better clarity',
        severity: 'warning'
      });
    }
    
    return feedback;
  }

  findOverlaps(shapes) {
    const overlaps = [];
    
    for (let i = 0; i < shapes.length; i++) {
      for (let j = i + 1; j < shapes.length; j++) {
        const shape1 = shapes[i];
        const shape2 = shapes[j];
        
        // Simple bounding box overlap detection
        if (shape1.x < shape2.x + shape2.width &&
            shape1.x + shape1.width > shape2.x &&
            shape1.y < shape2.y + shape2.height &&
            shape1.y + shape1.height > shape2.y) {
          overlaps.push([i, j]);
        }
      }
    }
    
    return overlaps;
  }

  // Generate simplified version suggestions
  generateSimplificationSuggestions(shapes, metadata) {
    const suggestions = [];
    
    // Remove decorative elements
    const decorativeCount = shapes.filter(s => s.isDecoration).length;
    if (decorativeCount > 0) {
      suggestions.push({
        type: 'remove_decorations',
        description: `Remove ${decorativeCount} decorative elements`,
        impact: 'medium'
      });
    }
    
    // Combine overlapping elements
    const overlaps = this.findOverlaps(shapes);
    if (overlaps.length > 0) {
      suggestions.push({
        type: 'combine_overlapping',
        description: 'Combine overlapping elements into single shapes',
        impact: 'high'
      });
    }
    
    // Simplify complex paths
    suggestions.push({
      type: 'simplify_paths',
      description: 'Convert complex curves to simple geometric shapes',
      impact: 'medium'
    });
    
    return suggestions;
  }
}

// Material Design and Carbon Design pattern matching
export class DesignSystemMatcher {
  constructor() {
    this.materialPatterns = {
      'add': 'add_circle_outline',
      'edit': 'edit',
      'delete': 'delete_outline',
      'save': 'save',
      'copy': 'content_copy',
      'user': 'person_outline',
      'settings': 'settings',
      'file': 'description',
      'folder': 'folder_outline'
    };
    
    this.carbonPatterns = {
      'add': 'add',
      'edit': 'edit',
      'delete': 'trash-can',
      'save': 'save',
      'copy': 'copy',
      'user': 'user',
      'settings': 'settings',
      'file': 'document',
      'folder': 'folder'
    };
  }

  findMaterialMatch(semanticIntent) {
    const action = semanticIntent.action;
    const object = semanticIntent.object;
    
    return this.materialPatterns[action] || this.materialPatterns[object] || null;
  }

  findCarbonMatch(semanticIntent) {
    const action = semanticIntent.action;
    const object = semanticIntent.object;
    
    return this.carbonPatterns[action] || this.carbonPatterns[object] || null;
  }
}

export default ComplexityAnalyzer;