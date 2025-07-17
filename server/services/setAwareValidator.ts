/**
 * SET-AWARE DESIGN VALIDATOR
 * Ensures visual consistency across icon sets and prevents conflicts
 */

import { JSDOM } from 'jsdom';

export interface IconSetAnalysis {
  strokeWeightRange: { min: number; max: number; avg: number };
  cornerRadiusRange: { min: number; max: number; avg: number };
  complexityRange: { min: number; max: number; avg: number };
  dominantStyles: string[];
  commonMetaphors: string[];
  visualLanguage: 'geometric' | 'rounded' | 'mixed';
}

export interface SetConsistencyResult {
  isConsistent: boolean;
  consistencyScore: number; // 0-100
  violations: string[];
  recommendations: string[];
  visualSimilarity: number; // 0-100
  metaphorConflicts: string[];
}

export interface IconSetContext {
  existingIcons: Array<{
    svg: string;
    name: string;
    category: string;
    metaphor?: string;
  }>;
  targetStyle: 'material' | 'carbon' | 'generic';
  brandGuidelines?: {
    strokeWeight: number;
    cornerRadius: number;
    visualStyle: string;
  };
}

/**
 * Analyzes an existing icon set to understand its visual language
 */
export function analyzeIconSet(icons: Array<{ svg: string; name: string }>): IconSetAnalysis {
  const strokeWeights: number[] = [];
  const cornerRadii: number[] = [];
  const complexities: number[] = [];
  const styles: string[] = [];
  const metaphors: string[] = [];

  for (const icon of icons) {
    const analysis = analyzeIndividualIcon(icon.svg);
    
    if (analysis.strokeWeight > 0) strokeWeights.push(analysis.strokeWeight);
    if (analysis.cornerRadius > 0) cornerRadii.push(analysis.cornerRadius);
    complexities.push(analysis.complexity);
    styles.push(analysis.style);
    
    // Extract metaphor from name (simplified)
    const metaphor = extractMetaphorFromName(icon.name);
    if (metaphor) metaphors.push(metaphor);
  }

  return {
    strokeWeightRange: {
      min: Math.min(...strokeWeights),
      max: Math.max(...strokeWeights),
      avg: strokeWeights.reduce((sum, w) => sum + w, 0) / strokeWeights.length
    },
    cornerRadiusRange: {
      min: Math.min(...cornerRadii),
      max: Math.max(...cornerRadii),
      avg: cornerRadii.reduce((sum, r) => sum + r, 0) / cornerRadii.length
    },
    complexityRange: {
      min: Math.min(...complexities),
      max: Math.max(...complexities),
      avg: complexities.reduce((sum, c) => sum + c, 0) / complexities.length
    },
    dominantStyles: getDominantStyles(styles),
    commonMetaphors: getCommonMetaphors(metaphors),
    visualLanguage: determineVisualLanguage(styles, cornerRadii)
  };
}

/**
 * Validates if a new icon fits within an existing set
 */
export function validateIconAgainstSet(
  newIconSvg: string,
  newIconName: string,
  context: IconSetContext
): SetConsistencyResult {
  const violations: string[] = [];
  const recommendations: string[] = [];
  const metaphorConflicts: string[] = [];

  // Analyze the new icon
  const newIconAnalysis = analyzeIndividualIcon(newIconSvg);
  
  // Analyze the existing set
  const setAnalysis = analyzeIconSet(context.existingIcons);
  
  // Check stroke weight consistency
  const strokeWeightDiff = Math.abs(newIconAnalysis.strokeWeight - setAnalysis.strokeWeightRange.avg);
  if (strokeWeightDiff > 0.5) {
    violations.push(`Stroke weight (${newIconAnalysis.strokeWeight}dp) differs from set average (${setAnalysis.strokeWeightRange.avg.toFixed(1)}dp)`);
    recommendations.push(`Adjust stroke weight to ${setAnalysis.strokeWeightRange.avg.toFixed(1)}dp`);
  }

  // Check corner radius consistency
  const cornerRadiusDiff = Math.abs(newIconAnalysis.cornerRadius - setAnalysis.cornerRadiusRange.avg);
  if (cornerRadiusDiff > 1) {
    violations.push(`Corner radius (${newIconAnalysis.cornerRadius}dp) differs from set average (${setAnalysis.cornerRadiusRange.avg.toFixed(1)}dp)`);
    recommendations.push(`Adjust corner radius to ${setAnalysis.cornerRadiusRange.avg.toFixed(1)}dp`);
  }

  // Check complexity consistency
  const complexityDiff = Math.abs(newIconAnalysis.complexity - setAnalysis.complexityRange.avg);
  if (complexityDiff > 3) {
    violations.push(`Icon complexity (${newIconAnalysis.complexity}) differs significantly from set average (${setAnalysis.complexityRange.avg.toFixed(1)})`);
    recommendations.push(newIconAnalysis.complexity > setAnalysis.complexityRange.avg ? 
      'Simplify icon geometry' : 'Add more detail for consistency');
  }

  // Check visual style consistency
  if (!setAnalysis.dominantStyles.includes(newIconAnalysis.style)) {
    violations.push(`Visual style (${newIconAnalysis.style}) doesn't match set's dominant styles (${setAnalysis.dominantStyles.join(', ')})`);
    recommendations.push(`Adjust to match ${setAnalysis.dominantStyles[0]} style`);
  }

  // Check for metaphor conflicts
  const newMetaphor = extractMetaphorFromName(newIconName);
  if (newMetaphor) {
    for (const existingIcon of context.existingIcons) {
      const existingMetaphor = extractMetaphorFromName(existingIcon.name);
      if (existingMetaphor && areSimilarMetaphors(newMetaphor, existingMetaphor)) {
        metaphorConflicts.push(`Similar to existing icon "${existingIcon.name}" (${existingMetaphor})`);
      }
    }
  }

  // Check brand guidelines compliance
  if (context.brandGuidelines) {
    const { strokeWeight, cornerRadius, visualStyle } = context.brandGuidelines;
    
    if (Math.abs(newIconAnalysis.strokeWeight - strokeWeight) > 0.25) {
      violations.push(`Stroke weight doesn't match brand guidelines (${strokeWeight}dp)`);
    }
    
    if (Math.abs(newIconAnalysis.cornerRadius - cornerRadius) > 0.5) {
      violations.push(`Corner radius doesn't match brand guidelines (${cornerRadius}dp)`);
    }
    
    if (!newIconAnalysis.style.includes(visualStyle)) {
      violations.push(`Visual style doesn't match brand guidelines (${visualStyle})`);
    }
  }

  // Calculate scores
  const consistencyScore = Math.max(0, 100 - (violations.length * 15));
  const visualSimilarity = calculateVisualSimilarity(newIconAnalysis, setAnalysis);

  return {
    isConsistent: violations.length === 0 && metaphorConflicts.length === 0,
    consistencyScore,
    violations,
    recommendations,
    visualSimilarity,
    metaphorConflicts
  };
}

/**
 * Analyzes individual icon properties
 */
function analyzeIndividualIcon(svg: string): {
  strokeWeight: number;
  cornerRadius: number;
  complexity: number;
  style: string;
} {
  const dom = new JSDOM(svg);
  const svgElement = dom.window.document.querySelector('svg');
  
  if (!svgElement) {
    return { strokeWeight: 0, cornerRadius: 0, complexity: 0, style: 'unknown' };
  }

  // Analyze stroke weight
  const strokeElements = svgElement.querySelectorAll('[stroke-width]');
  const strokeWeights = Array.from(strokeElements).map(el => 
    parseFloat(el.getAttribute('stroke-width') || '0')
  );
  const avgStrokeWeight = strokeWeights.length > 0 ? 
    strokeWeights.reduce((sum, w) => sum + w, 0) / strokeWeights.length : 0;

  // Analyze corner radius
  const rectElements = svgElement.querySelectorAll('rect[rx]');
  const cornerRadii = Array.from(rectElements).map(el => 
    parseFloat(el.getAttribute('rx') || '0')
  );
  const avgCornerRadius = cornerRadii.length > 0 ? 
    cornerRadii.reduce((sum, r) => sum + r, 0) / cornerRadii.length : 0;

  // Analyze complexity (number of elements)
  const totalElements = svgElement.querySelectorAll('path, rect, circle, ellipse, line, polygon').length;

  // Determine style
  const style = determineIconStyle(svgElement);

  return {
    strokeWeight: avgStrokeWeight,
    cornerRadius: avgCornerRadius,
    complexity: totalElements,
    style
  };
}

/**
 * Determines the visual style of an icon
 */
function determineIconStyle(svgElement: Element): string {
  const hasStrokes = svgElement.querySelectorAll('[stroke]').length > 0;
  const hasFills = svgElement.querySelectorAll('[fill]:not([fill="none"])').length > 0;
  const hasRoundedCorners = svgElement.querySelectorAll('[rx]').length > 0;
  const hasCircles = svgElement.querySelectorAll('circle, ellipse').length > 0;

  if (hasStrokes && !hasFills) return 'outlined';
  if (hasFills && !hasStrokes) return 'filled';
  if (hasRoundedCorners || hasCircles) return 'rounded';
  return 'geometric';
}

/**
 * Gets dominant styles from a collection
 */
function getDominantStyles(styles: string[]): string[] {
  const counts: { [key: string]: number } = {};
  
  for (const style of styles) {
    counts[style] = (counts[style] || 0) + 1;
  }
  
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([style]) => style);
}

/**
 * Gets common metaphors from a collection
 */
function getCommonMetaphors(metaphors: string[]): string[] {
  const counts: { [key: string]: number } = {};
  
  for (const metaphor of metaphors) {
    counts[metaphor] = (counts[metaphor] || 0) + 1;
  }
  
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([metaphor]) => metaphor);
}

/**
 * Determines the overall visual language of a set
 */
function determineVisualLanguage(styles: string[], cornerRadii: number[]): 'geometric' | 'rounded' | 'mixed' {
  const geometricCount = styles.filter(s => s === 'geometric' || s === 'outlined').length;
  const roundedCount = styles.filter(s => s === 'rounded').length;
  const avgCornerRadius = cornerRadii.reduce((sum, r) => sum + r, 0) / cornerRadii.length;
  
  if (avgCornerRadius > 2 || roundedCount > geometricCount) return 'rounded';
  if (geometricCount > roundedCount * 2) return 'geometric';
  return 'mixed';
}

/**
 * Extracts metaphor from icon name
 */
function extractMetaphorFromName(name: string): string | null {
  // Simple extraction - in real implementation, this would be more sophisticated
  const cleanName = name.toLowerCase().replace(/[_\-]/g, ' ');
  const words = cleanName.split(' ');
  
  // Common icon metaphors
  const metaphors = ['add', 'delete', 'edit', 'save', 'user', 'folder', 'file', 'home', 'search', 'settings'];
  
  for (const word of words) {
    if (metaphors.includes(word)) {
      return word;
    }
  }
  
  return words[0] || null;
}

/**
 * Checks if two metaphors are similar
 */
function areSimilarMetaphors(metaphor1: string, metaphor2: string): boolean {
  // Simple similarity check
  const synonyms = {
    'add': ['create', 'new', 'plus'],
    'delete': ['remove', 'trash', 'bin'],
    'edit': ['modify', 'change', 'update'],
    'user': ['person', 'profile', 'account'],
    'folder': ['directory', 'collection'],
    'file': ['document', 'page']
  };
  
  if (metaphor1 === metaphor2) return true;
  
  for (const [primary, syns] of Object.entries(synonyms)) {
    if ((primary === metaphor1 && syns.includes(metaphor2)) || 
        (primary === metaphor2 && syns.includes(metaphor1))) {
      return true;
    }
  }
  
  return false;
}

/**
 * Calculates visual similarity between new icon and existing set
 */
function calculateVisualSimilarity(
  newIcon: { strokeWeight: number; cornerRadius: number; complexity: number; style: string },
  setAnalysis: IconSetAnalysis
): number {
  let similarity = 100;
  
  // Stroke weight similarity
  const strokeDiff = Math.abs(newIcon.strokeWeight - setAnalysis.strokeWeightRange.avg);
  similarity -= strokeDiff * 10;
  
  // Corner radius similarity
  const cornerDiff = Math.abs(newIcon.cornerRadius - setAnalysis.cornerRadiusRange.avg);
  similarity -= cornerDiff * 5;
  
  // Complexity similarity
  const complexityDiff = Math.abs(newIcon.complexity - setAnalysis.complexityRange.avg);
  similarity -= complexityDiff * 3;
  
  // Style similarity
  if (!setAnalysis.dominantStyles.includes(newIcon.style)) {
    similarity -= 20;
  }
  
  return Math.max(0, Math.min(100, similarity));
}

/**
 * Generates recommendations for improving set consistency
 */
export function generateSetConsistencyRecommendations(
  iconSet: Array<{ svg: string; name: string }>,
  targetStyle: 'material' | 'carbon' | 'generic'
): string[] {
  const recommendations: string[] = [];
  const analysis = analyzeIconSet(iconSet);
  
  // Check stroke weight consistency
  const strokeRange = analysis.strokeWeightRange.max - analysis.strokeWeightRange.min;
  if (strokeRange > 1) {
    recommendations.push(`Standardize stroke weights (current range: ${analysis.strokeWeightRange.min}-${analysis.strokeWeightRange.max}dp)`);
  }
  
  // Check corner radius consistency
  const cornerRange = analysis.cornerRadiusRange.max - analysis.cornerRadiusRange.min;
  if (cornerRange > 2) {
    recommendations.push(`Standardize corner radii (current range: ${analysis.cornerRadiusRange.min}-${analysis.cornerRadiusRange.max}dp)`);
  }
  
  // Check complexity consistency
  const complexityRange = analysis.complexityRange.max - analysis.complexityRange.min;
  if (complexityRange > 5) {
    recommendations.push(`Balance icon complexity (current range: ${analysis.complexityRange.min}-${analysis.complexityRange.max} elements)`);
  }
  
  // Style-specific recommendations
  if (targetStyle === 'material') {
    if (analysis.strokeWeightRange.avg !== 2) {
      recommendations.push('Use 2dp stroke weight for Material Design consistency');
    }
    if (analysis.cornerRadiusRange.avg !== 2) {
      recommendations.push('Use 2dp corner radius for Material Design consistency');
    }
  }
  
  if (targetStyle === 'carbon') {
    if (analysis.dominantStyles[0] !== 'outlined') {
      recommendations.push('Use outlined style for Carbon Design consistency');
    }
  }
  
  return recommendations;
}