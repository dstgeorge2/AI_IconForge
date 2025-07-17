/**
 * PREVIEW VALIDATOR SERVICE
 * Tests icon recognizability at multiple sizes (16px, 20px, 24px, 32px, 48px)
 */

import { JSDOM } from 'jsdom';

export interface PreviewValidationResult {
  size: number;
  isRecognizable: boolean;
  clarity: number; // 0-100 score
  issues: string[];
  recommendations: string[];
}

export interface MultiSizeValidationResult {
  overallScore: number;
  passedSizes: number[];
  failedSizes: number[];
  results: PreviewValidationResult[];
  recommendations: string[];
}

const PREVIEW_SIZES = [16, 20, 24, 32, 48];

/**
 * Validates icon at multiple preview sizes
 */
export async function validateIconAtMultipleSizes(svg: string): Promise<MultiSizeValidationResult> {
  const results: PreviewValidationResult[] = [];
  
  for (const size of PREVIEW_SIZES) {
    const result = await validateIconAtSize(svg, size);
    results.push(result);
  }
  
  const passedSizes = results.filter(r => r.isRecognizable).map(r => r.size);
  const failedSizes = results.filter(r => !r.isRecognizable).map(r => r.size);
  const overallScore = Math.round(results.reduce((sum, r) => sum + r.clarity, 0) / results.length);
  
  const recommendations = generateRecommendations(results);
  
  return {
    overallScore,
    passedSizes,
    failedSizes,
    results,
    recommendations
  };
}

/**
 * Validates icon at a specific size
 */
async function validateIconAtSize(svg: string, size: number): Promise<PreviewValidationResult> {
  const issues: string[] = [];
  let clarity = 100;
  
  // Parse SVG
  const dom = new JSDOM(svg);
  const svgElement = dom.window.document.querySelector('svg');
  
  if (!svgElement) {
    return {
      size,
      isRecognizable: false,
      clarity: 0,
      issues: ['Invalid SVG format'],
      recommendations: ['Fix SVG structure']
    };
  }
  
  // Check stroke weight relative to size
  const strokeElements = svgElement.querySelectorAll('[stroke-width]');
  const strokeWeights = Array.from(strokeElements).map(el => 
    parseFloat(el.getAttribute('stroke-width') || '0')
  );
  
  if (strokeWeights.length > 0) {
    const avgStrokeWeight = strokeWeights.reduce((sum, w) => sum + w, 0) / strokeWeights.length;
    const relativeStrokeWeight = (avgStrokeWeight / size) * 100;
    
    if (size <= 20 && relativeStrokeWeight < 8) {
      issues.push('Stroke too thin for small size');
      clarity -= 20;
    }
    
    if (size <= 16 && relativeStrokeWeight < 10) {
      issues.push('Stroke critically thin for 16px size');
      clarity -= 30;
    }
  }
  
  // Check for complex paths that might not render well at small sizes
  const pathElements = svgElement.querySelectorAll('path');
  for (const path of pathElements) {
    const pathData = path.getAttribute('d') || '';
    const commandCount = (pathData.match(/[MLHVCSQTAZ]/gi) || []).length;
    
    if (size <= 20 && commandCount > 15) {
      issues.push('Path too complex for small size');
      clarity -= 15;
    }
  }
  
  // Check for small elements that might disappear
  const smallElements = svgElement.querySelectorAll('circle, rect, ellipse');
  for (const element of smallElements) {
    const width = parseFloat(element.getAttribute('width') || element.getAttribute('r') || '0');
    const height = parseFloat(element.getAttribute('height') || element.getAttribute('r') || '0');
    const minDimension = Math.min(width, height);
    
    if (size <= 20 && minDimension < 2) {
      issues.push('Small elements may disappear at small sizes');
      clarity -= 10;
    }
  }
  
  // Check overall element density
  const totalElements = svgElement.querySelectorAll('*').length;
  if (size <= 20 && totalElements > 8) {
    issues.push('Too many elements for small size');
    clarity -= 15;
  }
  
  // Check for overlapping elements
  const allElements = svgElement.querySelectorAll('rect, circle, path, line');
  if (allElements.length > 3) {
    issues.push('Complex composition may reduce clarity');
    clarity -= 10;
  }
  
  const isRecognizable = clarity >= 60 && issues.length <= 2;
  const recommendations = generateSizeSpecificRecommendations(size, issues);
  
  return {
    size,
    isRecognizable,
    clarity: Math.max(0, clarity),
    issues,
    recommendations
  };
}

/**
 * Generates recommendations for multi-size validation
 */
function generateRecommendations(results: PreviewValidationResult[]): string[] {
  const recommendations: string[] = [];
  
  const failedSmallSizes = results.filter(r => r.size <= 20 && !r.isRecognizable);
  const failedLargeSizes = results.filter(r => r.size > 20 && !r.isRecognizable);
  
  if (failedSmallSizes.length > 0) {
    recommendations.push('Simplify geometry for better small-size recognition');
    recommendations.push('Increase stroke weight for sizes 16px and 20px');
    recommendations.push('Reduce number of visual elements');
  }
  
  if (failedLargeSizes.length > 0) {
    recommendations.push('Ensure consistent visual balance at larger sizes');
    recommendations.push('Consider adding subtle details for large sizes');
  }
  
  const overallClarity = results.reduce((sum, r) => sum + r.clarity, 0) / results.length;
  if (overallClarity < 80) {
    recommendations.push('Consider redesigning for better overall clarity');
  }
  
  return recommendations;
}

/**
 * Generates size-specific recommendations
 */
function generateSizeSpecificRecommendations(size: number, issues: string[]): string[] {
  const recommendations: string[] = [];
  
  if (size <= 16) {
    recommendations.push('Use bold, simple shapes');
    recommendations.push('Avoid fine details');
    recommendations.push('Ensure minimum 2px stroke width');
  } else if (size <= 20) {
    recommendations.push('Keep shapes simple but can include basic details');
    recommendations.push('Use consistent stroke weights');
  } else if (size >= 32) {
    recommendations.push('Can include more detailed elements');
    recommendations.push('Ensure visual hierarchy is clear');
  }
  
  if (issues.includes('Stroke too thin for small size')) {
    recommendations.push('Increase stroke weight to at least 2px');
  }
  
  if (issues.includes('Path too complex for small size')) {
    recommendations.push('Simplify path geometry');
    recommendations.push('Use basic shapes instead of complex paths');
  }
  
  return recommendations;
}

/**
 * Generates size-optimized variants of an icon
 */
export function generateSizeOptimizedVariants(svg: string): { [size: number]: string } {
  const variants: { [size: number]: string } = {};
  
  for (const size of PREVIEW_SIZES) {
    variants[size] = optimizeForSize(svg, size);
  }
  
  return variants;
}

/**
 * Optimizes SVG for a specific size
 */
function optimizeForSize(svg: string, size: number): string {
  const dom = new JSDOM(svg);
  const svgElement = dom.window.document.querySelector('svg');
  
  if (!svgElement) return svg;
  
  // Adjust stroke weights for small sizes
  if (size <= 20) {
    const strokeElements = svgElement.querySelectorAll('[stroke-width]');
    strokeElements.forEach(el => {
      const currentWeight = parseFloat(el.getAttribute('stroke-width') || '2');
      const optimizedWeight = Math.max(1.5, currentWeight * (size / 24));
      el.setAttribute('stroke-width', optimizedWeight.toString());
    });
  }
  
  // Simplify complex paths for very small sizes
  if (size <= 16) {
    const pathElements = svgElement.querySelectorAll('path');
    pathElements.forEach(path => {
      const pathData = path.getAttribute('d') || '';
      // Simple path simplification (remove very small segments)
      const simplified = pathData.replace(/[ML]\s*(\d+(?:\.\d+)?)\s*(\d+(?:\.\d+)?)/g, (match, x, y) => {
        const px = parseFloat(x);
        const py = parseFloat(y);
        return `M${Math.round(px)},${Math.round(py)}`;
      });
      path.setAttribute('d', simplified);
    });
  }
  
  return svgElement.outerHTML;
}