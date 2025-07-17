/**
 * PTC Windchill Icon Validation Service
 * Validates icons against the Windchill Icon Style Guide specifications
 */

export interface WindchillIconValidation {
  valid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  compliance: {
    canvas: boolean;
    stroke: boolean;
    geometry: boolean;
    accessibility: boolean;
    naming: boolean;
    metadata: boolean;
  };
}

export interface WindchillIconMetadata {
  domain: string;
  function: string;
  userRole: string;
  iconType: 'object' | 'action' | 'status' | 'navigation' | 'composite';
  systemArea: string;
  description: string;
}

export class WindchillIconValidator {
  private readonly STYLE_SYSTEM = {
    canvas: {
      size: 24,
      liveArea: 20,
      padding: 2,
      viewBox: '0 0 24 24'
    },
    stroke: {
      weight: 2,
      color: '#000000',
      style: 'solid',
      linecap: 'square',
      linejoin: 'miter'
    },
    accessibility: {
      minContrastRatio: 4.5,
      minSize: 16
    },
    domains: ['CAD', 'BOM', 'workflow', 'document', 'change', 'manufacturing'],
    roles: ['engineer', 'planner', 'admin', 'operator', 'designer'],
    iconTypes: ['object', 'action', 'status', 'navigation', 'composite']
  };

  /**
   * Validate icon against Windchill Style Guide
   */
  validateIcon(svgContent: string, metadata: WindchillIconMetadata): WindchillIconValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Canvas validation
    const canvasValid = this.validateCanvas(svgContent, errors, warnings);
    
    // Stroke validation
    const strokeValid = this.validateStroke(svgContent, errors, warnings);
    
    // Geometry validation
    const geometryValid = this.validateGeometry(svgContent, errors, warnings, recommendations);
    
    // Accessibility validation
    const accessibilityValid = this.validateAccessibility(svgContent, errors, warnings);
    
    // Metadata validation
    const metadataValid = this.validateMetadata(metadata, errors, warnings);
    
    // Naming validation
    const namingValid = this.validateNaming(metadata, errors, warnings);

    const compliance = {
      canvas: canvasValid,
      stroke: strokeValid,
      geometry: geometryValid,
      accessibility: accessibilityValid,
      naming: namingValid,
      metadata: metadataValid
    };

    // Calculate overall score
    const score = this.calculateScore(compliance, errors, warnings);
    
    return {
      valid: errors.length === 0,
      score,
      errors,
      warnings,
      recommendations,
      compliance
    };
  }

  private validateCanvas(svgContent: string, errors: string[], warnings: string[]): boolean {
    let valid = true;

    // Check viewBox
    if (!svgContent.includes('viewBox="0 0 24 24"')) {
      errors.push('Icon must use 24x24 viewBox for consistent scaling');
      valid = false;
    }

    // Check for proper SVG structure
    if (!svgContent.includes('<svg') || !svgContent.includes('</svg>')) {
      errors.push('Invalid SVG structure');
      valid = false;
    }

    // Check for pixel-snapped coordinates
    const coordinatePattern = /[\d]+\.[\d]{3,}/g;
    if (coordinatePattern.test(svgContent)) {
      warnings.push('Consider pixel-snapping coordinates for crisp rendering');
    }

    return valid;
  }

  private validateStroke(svgContent: string, errors: string[], warnings: string[]): boolean {
    let valid = true;

    // Check stroke weight
    if (!svgContent.includes('stroke-width="2"')) {
      warnings.push('Icon should use 2dp stroke weight for consistency');
    }

    // Check stroke color
    if (!svgContent.includes('stroke="currentColor"') && !svgContent.includes('stroke="#000000"')) {
      warnings.push('Use currentColor or #000000 for stroke color');
    }

    // Check for fills (should be minimal)
    if (svgContent.includes('fill=') && !svgContent.includes('fill="none"')) {
      const fillCount = (svgContent.match(/fill="(?!none)/g) || []).length;
      if (fillCount > 1) {
        warnings.push('Minimize use of fills - prefer stroke-only design');
      }
    }

    // Check stroke endings
    if (svgContent.includes('stroke-linecap="round"')) {
      warnings.push('Use square stroke endings for Windchill consistency');
    }

    return valid;
  }

  private validateGeometry(svgContent: string, errors: string[], warnings: string[], recommendations: string[]): boolean {
    let valid = true;

    // Check for 3D or isometric elements
    if (svgContent.includes('transform="skew') || svgContent.includes('perspective')) {
      errors.push('3D and isometric elements are prohibited');
      valid = false;
    }

    // Check for gradients
    if (svgContent.includes('<linearGradient') || svgContent.includes('<radialGradient')) {
      errors.push('Gradients are not allowed in Windchill icons');
      valid = false;
    }

    // Check for shadows or filters
    if (svgContent.includes('<filter') || svgContent.includes('drop-shadow')) {
      errors.push('Shadows and filters are not allowed');
      valid = false;
    }

    // Check element count (complexity)
    const elementCount = (svgContent.match(/<(?:rect|circle|path|line|polygon|polyline)/g) || []).length;
    if (elementCount > 8) {
      warnings.push('Icon may be too complex - consider simplification');
    }

    // Check for proper corner radius
    const cornerRadiusPattern = /rx="(\d+)"/g;
    const matches = svgContent.match(cornerRadiusPattern);
    if (matches) {
      const hasIncorrectRadius = matches.some(match => {
        const radius = parseInt(match.match(/\d+/)[0]);
        return radius !== 2;
      });
      if (hasIncorrectRadius) {
        warnings.push('Use 2dp corner radius for outer corners');
      }
    }

    return valid;
  }

  private validateAccessibility(svgContent: string, errors: string[], warnings: string[]): boolean {
    let valid = true;

    // Check for aria labels or titles
    if (!svgContent.includes('aria-label') && !svgContent.includes('<title>')) {
      warnings.push('Consider adding aria-label or title for accessibility');
    }

    // Check for color-only meaning
    if (svgContent.includes('red') || svgContent.includes('green') || svgContent.includes('#ff0000')) {
      warnings.push('Avoid using color alone to convey meaning');
    }

    // Estimate if readable at 16dp
    const complexity = this.estimateComplexity(svgContent);
    if (complexity > 0.7) {
      warnings.push('Icon may not be readable at 16dp minimum size');
    }

    return valid;
  }

  private validateMetadata(metadata: WindchillIconMetadata, errors: string[], warnings: string[]): boolean {
    let valid = true;

    // Check required fields
    if (!metadata.domain) {
      errors.push('Domain is required (CAD, BOM, workflow, document, change, manufacturing)');
      valid = false;
    } else if (!this.STYLE_SYSTEM.domains.includes(metadata.domain)) {
      errors.push(`Invalid domain: ${metadata.domain}`);
      valid = false;
    }

    if (!metadata.function) {
      errors.push('Function description is required');
      valid = false;
    }

    if (!metadata.userRole) {
      errors.push('User role is required (engineer, planner, admin, operator, designer)');
      valid = false;
    } else if (!this.STYLE_SYSTEM.roles.includes(metadata.userRole)) {
      errors.push(`Invalid user role: ${metadata.userRole}`);
      valid = false;
    }

    if (!metadata.iconType) {
      errors.push('Icon type is required (object, action, status, navigation, composite)');
      valid = false;
    } else if (!this.STYLE_SYSTEM.iconTypes.includes(metadata.iconType)) {
      errors.push(`Invalid icon type: ${metadata.iconType}`);
      valid = false;
    }

    return valid;
  }

  private validateNaming(metadata: WindchillIconMetadata, errors: string[], warnings: string[]): boolean {
    let valid = true;

    // Check snake_case format
    const namePattern = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;
    if (metadata.function && !namePattern.test(metadata.function.replace(/\s+/g, '_'))) {
      warnings.push('Use snake_case naming convention (e.g., add_workspace)');
    }

    // Check action-first naming for composite icons
    if (metadata.iconType === 'composite' && metadata.function) {
      const parts = metadata.function.split('_');
      if (parts.length < 2) {
        warnings.push('Composite icons should use action_object naming');
      }
    }

    return valid;
  }

  private estimateComplexity(svgContent: string): number {
    const pathCount = (svgContent.match(/<path/g) || []).length;
    const circleCount = (svgContent.match(/<circle/g) || []).length;
    const rectCount = (svgContent.match(/<rect/g) || []).length;
    const lineCount = (svgContent.match(/<line/g) || []).length;
    
    const totalElements = pathCount + circleCount + rectCount + lineCount;
    const pathComplexity = this.getPathComplexity(svgContent);
    
    return Math.min(1, (totalElements * 0.1) + (pathComplexity * 0.3));
  }

  private getPathComplexity(svgContent: string): number {
    const pathElements = svgContent.match(/<path[^>]*d="([^"]*)"[^>]*>/g) || [];
    let totalComplexity = 0;
    
    pathElements.forEach(path => {
      const dAttribute = path.match(/d="([^"]*)"/)?.[1] || '';
      const commandCount = (dAttribute.match(/[MLHVCSQTAZ]/gi) || []).length;
      totalComplexity += commandCount;
    });
    
    return totalComplexity / 20; // Normalize to 0-1 range
  }

  private calculateScore(compliance: any, errors: string[], warnings: string[]): number {
    const complianceScore = Object.values(compliance).filter(Boolean).length / Object.keys(compliance).length;
    const errorPenalty = errors.length * 20;
    const warningPenalty = warnings.length * 5;
    
    return Math.max(0, Math.round((complianceScore * 100) - errorPenalty - warningPenalty));
  }
}

/**
 * Factory function for easy validation
 */
export function validateWindchillIcon(svgContent: string, metadata: WindchillIconMetadata): WindchillIconValidation {
  const validator = new WindchillIconValidator();
  return validator.validateIcon(svgContent, metadata);
}

export default WindchillIconValidator;