/**
 * SVG Formatter Service - Clean, properly formatted SVG output
 * Ensures consistent, production-ready SVG headers and structure
 */

export interface FormattedSVG {
  svg: string;
  size: string;
  isValid: boolean;
}

export class SVGFormatter {
  /**
   * Format SVG with proper header and attributes for Windchill compliance
   */
  static formatForProduction(rawSVG: string): FormattedSVG {
    let formatted = rawSVG.trim();
    
    // Step 1: Clean any malformed content
    formatted = this.cleanRawContent(formatted);
    
    // Step 2: Ensure proper SVG structure
    formatted = this.ensureProperStructure(formatted);
    
    // Step 3: Apply Windchill-specific formatting
    formatted = this.applyWindchillFormatting(formatted);
    
    // Step 4: Minimize whitespace while maintaining readability
    formatted = this.optimizeWhitespace(formatted);
    
    return {
      svg: formatted,
      size: this.calculateSize(formatted),
      isValid: this.validateSVG(formatted)
    };
  }

  /**
   * Clean raw AI output that might have extra text or malformed structure
   */
  private static cleanRawContent(content: string): string {
    // Remove any text before or after SVG
    const svgMatch = content.match(/<svg[^>]*>[\s\S]*?<\/svg>/i);
    if (!svgMatch) {
      return this.generateFallbackSVG();
    }
    
    return svgMatch[0];
  }

  /**
   * Ensure proper SVG structure with correct attributes
   */
  private static ensureProperStructure(svg: string): string {
    // Extract content between svg tags
    const contentMatch = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    const content = contentMatch ? contentMatch[1] : '';
    
    // Build proper SVG with clean, working attributes
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;
  }

  /**
   * Apply clean, working formatting requirements
   */
  private static applyWindchillFormatting(svg: string): string {
    return svg
      // Ensure consistent stroke settings that actually work
      .replace(/stroke-width="[^"]*"/g, 'stroke-width="2"')
      // Ensure proper stroke caps for readability
      .replace(/stroke-linecap="[^"]*"/g, 'stroke-linecap="round"')
      .replace(/stroke-linejoin="[^"]*"/g, 'stroke-linejoin="round"')
      // Clean up any duplicate attributes
      .replace(/(\w+="[^"]*")\s+\1/g, '$1');
  }

  /**
   * Optimize whitespace for clean, readable output
   */
  private static optimizeWhitespace(svg: string): string {
    return svg
      // Normalize spaces around tags
      .replace(/>\s+</g, '><')
      // Clean up multiple spaces
      .replace(/\s{2,}/g, ' ')
      // Clean up spaces around attributes
      .replace(/\s*=\s*/g, '=')
      // Ensure single space between attributes
      .replace(/"\s*([a-zA-Z])/g, '" $1')
      // Clean up the opening tag spacing
      .replace(/<svg\s+/g, '<svg ')
      .trim();
  }

  /**
   * Calculate SVG file size
   */
  private static calculateSize(svg: string): string {
    const bytes = new Blob([svg]).size;
    if (bytes < 1024) {
      return `${bytes}B`;
    } else {
      return `${(bytes / 1024).toFixed(1)}KB`;
    }
  }

  /**
   * Validate SVG structure
   */
  private static validateSVG(svg: string): boolean {
    // Check for proper SVG tags
    if (!svg.includes('<svg') || !svg.includes('</svg>')) {
      return false;
    }
    
    // Check for required attributes
    const requiredAttributes = ['viewBox', 'fill', 'stroke'];
    return requiredAttributes.every(attr => svg.includes(`${attr}=`));
  }

  /**
   * Generate fallback SVG when input is invalid
   */
  private static generateFallbackSVG(): string {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="18" height="18" rx="2"/>
  <path d="M9 9l6 6M15 9l-6 6"/>
</svg>`;
  }
}

/**
 * Quick formatting function for use in generation pipeline
 */
export function formatSVGForDownload(rawSVG: string): string {
  const formatted = SVGFormatter.formatForProduction(rawSVG);
  return formatted.svg;
}

/**
 * Create properly formatted SVG with consistent headers
 */
export function createWindchillCompliantSVG(content: string): string {
  // Extract paths and shapes from content
  const pathsMatch = content.match(/<path[^>]*>/g) || [];
  const rectsMatch = content.match(/<rect[^>]*>/g) || [];
  const circlesMatch = content.match(/<circle[^>]*>/g) || [];
  const linesMatch = content.match(/<line[^>]*>/g) || [];
  
  const allElements = [...pathsMatch, ...rectsMatch, ...circlesMatch, ...linesMatch];
  const cleanContent = allElements.join('\n  ');
  
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
  ${cleanContent}
</svg>`;
}

export default SVGFormatter;