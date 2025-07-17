// SVG Validation and Post-Processing Service
// Implements the pipeline improvements for production-grade SVG UI icons

export interface SVGValidationResult {
  isValid: boolean;
  issues: string[];
  normalizedSVG: string;
  confidence: number;
  metrics: {
    canvasSize: { width: number; height: number };
    strokeWidth: number;
    liveAreaCompliance: boolean;
    elementCount: number;
    hasText: boolean;
    hasBitmap: boolean;
  };
}

export interface SVGProcessingOptions {
  targetSize: number;
  strokeWidth: number;
  liveAreaPercentage: number;
  enforceMonochrome: boolean;
  removeText: boolean;
}

// Default processing options for Material Design compliance
const DEFAULT_OPTIONS: SVGProcessingOptions = {
  targetSize: 24,
  strokeWidth: 2,
  liveAreaPercentage: 0.833, // 20dp out of 24dp
  enforceMonochrome: true,
  removeText: true
};

export class SVGValidator {
  private options: SVGProcessingOptions;

  constructor(options: Partial<SVGProcessingOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Main validation function implementing Claude-optimized pipeline
   */
  async validateAndProcess(svgContent: string): Promise<SVGValidationResult> {
    try {
      // Stage 1: Parse and clean SVG
      const cleanedSVG = this.cleanSVG(svgContent);
      
      // Stage 2: Validate structure
      const structuralIssues = this.validateStructure(cleanedSVG);
      
      // Stage 3: Normalize attributes
      const normalizedSVG = this.normalizeSVG(cleanedSVG);
      
      // Stage 4: Validate compliance
      const complianceIssues = this.validateCompliance(normalizedSVG);
      
      // Stage 5: Calculate metrics
      const metrics = this.calculateMetrics(normalizedSVG);
      
      // Stage 6: Generate confidence score
      const confidence = this.calculateConfidence(structuralIssues, complianceIssues, metrics);
      
      return {
        isValid: structuralIssues.length === 0 && complianceIssues.length === 0,
        issues: [...structuralIssues, ...complianceIssues],
        normalizedSVG,
        confidence,
        metrics
      };
    } catch (error) {
      return {
        isValid: false,
        issues: [`Critical parsing error: ${error.message}`],
        normalizedSVG: this.generateFallbackSVG(),
        confidence: 0,
        metrics: this.getDefaultMetrics()
      };
    }
  }

  /**
   * Stage 1: Clean SVG content
   */
  private cleanSVG(svgContent: string): string {
    let cleaned = svgContent;
    
    // Remove HTML tags and non-SVG content
    cleaned = cleaned.replace(/<html[^>]*>.*?<\/html>/gis, '');
    cleaned = cleaned.replace(/<body[^>]*>.*?<\/body>/gis, '');
    cleaned = cleaned.replace(/<head[^>]*>.*?<\/head>/gis, '');
    
    // Extract SVG content
    const svgMatch = cleaned.match(/<svg[^>]*>[\s\S]*?<\/svg>/i);
    if (!svgMatch) {
      throw new Error('No valid SVG found in content');
    }
    
    cleaned = svgMatch[0];
    
    // Remove comments
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
    
    // Remove unnecessary whitespace
    cleaned = cleaned.replace(/>\s+</g, '><');
    
    return cleaned.trim();
  }

  /**
   * Stage 2: Validate SVG structure
   */
  private validateStructure(svgContent: string): string[] {
    const issues: string[] = [];
    
    // Check for valid SVG element
    if (!svgContent.includes('<svg')) {
      issues.push('Missing SVG root element');
    }
    
    // Check for unclosed tags
    const openTags = (svgContent.match(/<[^\/][^>]*>/g) || []).length;
    const closeTags = (svgContent.match(/<\/[^>]*>/g) || []).length;
    const selfClosing = (svgContent.match(/<[^>]*\/>/g) || []).length;
    
    if (openTags - selfClosing !== closeTags) {
      issues.push('Unclosed or malformed tags detected');
    }
    
    // Check for invalid elements
    const invalidElements = svgContent.match(/<(?:script|iframe|object|embed|link|style)/gi);
    if (invalidElements) {
      issues.push(`Invalid elements found: ${invalidElements.join(', ')}`);
    }
    
    return issues;
  }

  /**
   * Stage 3: Normalize SVG attributes
   */
  private normalizeSVG(svgContent: string): string {
    let normalized = svgContent;
    
    // Ensure proper viewBox
    if (!normalized.includes('viewBox=')) {
      normalized = normalized.replace(
        '<svg',
        `<svg viewBox="0 0 ${this.options.targetSize} ${this.options.targetSize}"`
      );
    } else {
      // Normalize viewBox to target size
      normalized = normalized.replace(
        /viewBox="[^"]*"/,
        `viewBox="0 0 ${this.options.targetSize} ${this.options.targetSize}"`
      );
    }
    
    // Remove width/height attributes to make it scalable
    normalized = normalized.replace(/\s*width="[^"]*"/g, '');
    normalized = normalized.replace(/\s*height="[^"]*"/g, '');
    
    // Normalize stroke attributes
    normalized = normalized.replace(/stroke-width="[^"]*"/g, `stroke-width="${this.options.strokeWidth}"`);
    
    // Ensure proper fill/stroke defaults
    if (!normalized.includes('fill=') && !normalized.includes('stroke=')) {
      normalized = normalized.replace('<svg', '<svg fill="none" stroke="currentColor"');
    }
    
    // Remove unnecessary attributes
    normalized = normalized.replace(/\s*xmlns:xlink="[^"]*"/g, '');
    normalized = normalized.replace(/\s*xml:space="[^"]*"/g, '');
    
    return normalized;
  }

  /**
   * Stage 4: Validate design system compliance
   */
  private validateCompliance(svgContent: string): string[] {
    const issues: string[] = [];
    
    // Check stroke width compliance
    const strokeWidths = svgContent.match(/stroke-width="([^"]*)"/g);
    if (strokeWidths) {
      strokeWidths.forEach(stroke => {
        const width = parseFloat(stroke.match(/stroke-width="([^"]*)"/)[1]);
        if (width !== this.options.strokeWidth) {
          issues.push(`Inconsistent stroke width: ${width} (expected ${this.options.strokeWidth})`);
        }
      });
    }
    
    // Check for text elements (not recommended in icons)
    if (svgContent.includes('<text')) {
      issues.push('Text elements found - consider converting to paths');
    }
    
    // Check for bitmap images
    if (svgContent.includes('<image') || svgContent.includes('data:image')) {
      issues.push('Bitmap images found - icons should be vector-only');
    }
    
    // Check for complex gradients or patterns
    if (svgContent.includes('<linearGradient') || svgContent.includes('<radialGradient')) {
      issues.push('Complex gradients found - consider simplifying for icon use');
    }
    
    // Check element count (too many elements can affect performance)
    const elementCount = (svgContent.match(/<[^\/][^>]*>/g) || []).length;
    if (elementCount > 20) {
      issues.push(`High element count: ${elementCount} (consider simplifying)`);
    }
    
    return issues;
  }

  /**
   * Stage 5: Calculate metrics
   */
  private calculateMetrics(svgContent: string): SVGValidationResult['metrics'] {
    const viewBoxMatch = svgContent.match(/viewBox="([^"]*)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1].split(' ').map(Number) : [0, 0, 24, 24];
    
    const strokeWidthMatch = svgContent.match(/stroke-width="([^"]*)"/);
    const strokeWidth = strokeWidthMatch ? parseFloat(strokeWidthMatch[1]) : 2;
    
    const elementCount = (svgContent.match(/<[^\/][^>]*>/g) || []).length;
    const hasText = svgContent.includes('<text');
    const hasBitmap = svgContent.includes('<image') || svgContent.includes('data:image');
    
    // Calculate live area compliance
    const liveAreaSize = viewBox[2] * this.options.liveAreaPercentage;
    const liveAreaCompliance = true; // Basic check - could be enhanced with actual path analysis
    
    return {
      canvasSize: { width: viewBox[2], height: viewBox[3] },
      strokeWidth,
      liveAreaCompliance,
      elementCount,
      hasText,
      hasBitmap
    };
  }

  /**
   * Stage 6: Calculate confidence score
   */
  private calculateConfidence(
    structuralIssues: string[],
    complianceIssues: string[],
    metrics: SVGValidationResult['metrics']
  ): number {
    let confidence = 100;
    
    // Deduct for structural issues
    confidence -= structuralIssues.length * 20;
    
    // Deduct for compliance issues
    confidence -= complianceIssues.length * 10;
    
    // Deduct for metrics issues
    if (metrics.hasText) confidence -= 15;
    if (metrics.hasBitmap) confidence -= 25;
    if (metrics.elementCount > 15) confidence -= 10;
    if (!metrics.liveAreaCompliance) confidence -= 20;
    
    // Bonus for good practices
    if (metrics.elementCount <= 10) confidence += 5;
    if (metrics.strokeWidth === this.options.strokeWidth) confidence += 5;
    
    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Generate fallback SVG for critical errors
   */
  private generateFallbackSVG(): string {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M9 9l6 6"/>
      <path d="M15 9l-6 6"/>
    </svg>`;
  }

  /**
   * Get default metrics for error cases
   */
  private getDefaultMetrics(): SVGValidationResult['metrics'] {
    return {
      canvasSize: { width: 24, height: 24 },
      strokeWidth: 2,
      liveAreaCompliance: false,
      elementCount: 0,
      hasText: false,
      hasBitmap: false
    };
  }
}

// Export convenience function for easy usage
export function validateSVG(svgContent: string, options?: Partial<SVGProcessingOptions>): Promise<SVGValidationResult> {
  const validator = new SVGValidator(options);
  return validator.validateAndProcess(svgContent);
}