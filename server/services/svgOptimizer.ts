// SVG Optimizer Service - Clean and optimized SVG generation

export interface OptimizedSVG {
  svg: string;
  metadata: {
    size: string;
    elements: number;
    optimized: boolean;
    cleanCode: boolean;
  };
}

export interface SVGOptimizationOptions {
  removeComments: boolean;
  removeMetadata: boolean;
  removeUnusedDefs: boolean;
  minimizeAttributes: boolean;
  roundNumbers: boolean;
  removeEmptyElements: boolean;
}

const DEFAULT_OPTIONS: SVGOptimizationOptions = {
  removeComments: true,
  removeMetadata: true,
  removeUnusedDefs: true,
  minimizeAttributes: true,
  roundNumbers: true,
  removeEmptyElements: true
};

export class SVGOptimizer {
  private options: SVGOptimizationOptions;

  constructor(options: Partial<SVGOptimizationOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Optimize SVG for production use
   */
  optimize(svgContent: string): OptimizedSVG {
    let optimized = svgContent;

    // Step 1: Clean structure
    optimized = this.cleanStructure(optimized);

    // Step 2: Remove comments and metadata
    if (this.options.removeComments) {
      optimized = this.removeComments(optimized);
    }

    if (this.options.removeMetadata) {
      optimized = this.removeMetadata(optimized);
    }

    // Step 3: Optimize attributes
    if (this.options.minimizeAttributes) {
      optimized = this.minimizeAttributes(optimized);
    }

    // Step 4: Round numbers
    if (this.options.roundNumbers) {
      optimized = this.roundNumbers(optimized);
    }

    // Step 5: Remove empty elements
    if (this.options.removeEmptyElements) {
      optimized = this.removeEmptyElements(optimized);
    }

    // Step 6: Format for production
    optimized = this.formatForProduction(optimized);

    return {
      svg: optimized,
      metadata: {
        size: this.calculateSize(optimized),
        elements: this.countElements(optimized),
        optimized: true,
        cleanCode: true
      }
    };
  }

  /**
   * Clean SVG structure
   */
  private cleanStructure(svg: string): string {
    // Remove HTML wrapper if present
    let cleaned = svg.replace(/<html[^>]*>[\s\S]*?<\/html>/gi, '');
    cleaned = cleaned.replace(/<body[^>]*>[\s\S]*?<\/body>/gi, '');
    
    // Extract only SVG content
    const svgMatch = cleaned.match(/<svg[^>]*>[\s\S]*?<\/svg>/i);
    if (!svgMatch) {
      return this.generateCleanFallback();
    }
    
    return svgMatch[0];
  }

  /**
   * Remove comments
   */
  private removeComments(svg: string): string {
    return svg.replace(/<!--[\s\S]*?-->/g, '');
  }

  /**
   * Remove metadata
   */
  private removeMetadata(svg: string): string {
    // Remove title, desc, metadata tags
    return svg
      .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
      .replace(/<desc[^>]*>[\s\S]*?<\/desc>/gi, '')
      .replace(/<metadata[^>]*>[\s\S]*?<\/metadata>/gi, '');
  }

  /**
   * Minimize attributes
   */
  private minimizeAttributes(svg: string): string {
    return svg
      // Remove unnecessary xmlns declarations
      .replace(/\s*xmlns:xlink="[^"]*"/g, '')
      .replace(/\s*xml:space="[^"]*"/g, '')
      // Simplify default values
      .replace(/\s*fill="none"/g, ' fill="none"')
      .replace(/\s*stroke="currentColor"/g, ' stroke="currentColor"')
      .replace(/\s*stroke-width="2"/g, ' stroke-width="2"')
      .replace(/\s*stroke-linecap="round"/g, ' stroke-linecap="round"')
      .replace(/\s*stroke-linejoin="round"/g, ' stroke-linejoin="round"');
  }

  /**
   * Round numbers to reduce precision
   */
  private roundNumbers(svg: string): string {
    return svg.replace(/(\d+\.\d{3,})/g, (match) => {
      return parseFloat(match).toFixed(2);
    });
  }

  /**
   * Remove empty elements
   */
  private removeEmptyElements(svg: string): string {
    return svg.replace(/<[^>]+>\s*<\/[^>]+>/g, '');
  }

  /**
   * Format for production
   */
  private formatForProduction(svg: string): string {
    // Ensure proper viewBox and dimensions
    let formatted = svg;
    
    // Add viewBox if missing
    if (!formatted.includes('viewBox=')) {
      formatted = formatted.replace(
        '<svg',
        '<svg viewBox="0 0 24 24"'
      );
    }

    // Ensure proper attributes for scalability
    formatted = formatted.replace(
      /<svg[^>]*>/,
      (match) => {
        // Remove width/height for scalability
        let cleaned = match.replace(/\s*width="[^"]*"/g, '');
        cleaned = cleaned.replace(/\s*height="[^"]*"/g, '');
        
        // Ensure essential attributes
        if (!cleaned.includes('fill=')) {
          cleaned = cleaned.replace('<svg', '<svg fill="none"');
        }
        if (!cleaned.includes('stroke=')) {
          cleaned = cleaned.replace('<svg', '<svg stroke="currentColor"');
        }
        
        return cleaned;
      }
    );

    // Minimize whitespace
    formatted = formatted.replace(/>\s+</g, '><');
    formatted = formatted.replace(/\s+/g, ' ');
    
    return formatted.trim();
  }

  /**
   * Calculate SVG size
   */
  private calculateSize(svg: string): string {
    const bytes = new Blob([svg]).size;
    if (bytes < 1024) {
      return `${bytes}B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)}KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    }
  }

  /**
   * Count elements in SVG
   */
  private countElements(svg: string): number {
    const matches = svg.match(/<[^\/!][^>]*>/g) || [];
    return matches.length;
  }

  /**
   * Generate clean fallback SVG
   */
  private generateCleanFallback(): string {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M9 9l6 6M15 9l-6 6"/>
    </svg>`;
  }
}

/**
 * Quick optimization function
 */
export function optimizeSVG(svgContent: string, options?: Partial<SVGOptimizationOptions>): OptimizedSVG {
  const optimizer = new SVGOptimizer(options);
  return optimizer.optimize(svgContent);
}

/**
 * Production-ready SVG generation
 */
export function generateProductionSVG(rawSVG: string): string {
  const optimized = optimizeSVG(rawSVG);
  return optimized.svg;
}