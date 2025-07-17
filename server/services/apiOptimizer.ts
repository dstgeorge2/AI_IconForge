// API Optimizer Service - Clean and minimal API responses

import { IconVariantResponse, MultiVariantIconResponse } from '../../shared/schema';

export interface OptimizedVariantResponse {
  svg: string;
  explanation: string;
  confidence: number;
  metadata: {
    approach: string;
    source: string;
    optimized: boolean;
    size: string;
  };
}

export interface OptimizedMultiVariantResponse {
  conversionId: number;
  originalImageName: string;
  variants: {
    'one-to-one': OptimizedVariantResponse;
    'ui-intent': OptimizedVariantResponse;
    'material': OptimizedVariantResponse;
    'carbon': OptimizedVariantResponse;
    'filled': OptimizedVariantResponse;
  };
  metadata: {
    processingTime: number;
    totalSize: string;
    optimized: boolean;
  };
}

export class APIOptimizer {
  /**
   * Optimize variant response by removing unnecessary data
   */
  optimizeVariantResponse(variant: IconVariantResponse): OptimizedVariantResponse {
    // Extract only essential metadata
    const essentialMetadata = {
      approach: variant.metadata?.approach || 'unknown',
      source: variant.metadata?.source || 'unknown',
      optimized: true,
      size: this.calculateSize(variant.svg)
    };

    return {
      svg: variant.svg,
      explanation: variant.explanation,
      confidence: variant.confidence,
      metadata: essentialMetadata
    };
  }

  /**
   * Optimize multi-variant response
   */
  optimizeMultiVariantResponse(
    response: MultiVariantIconResponse,
    processingTime: number
  ): OptimizedMultiVariantResponse {
    const optimizedVariants = {
      'one-to-one': this.optimizeVariantResponse(response.variants['one-to-one']),
      'ui-intent': this.optimizeVariantResponse(response.variants['ui-intent']),
      'material': this.optimizeVariantResponse(response.variants['material']),
      'carbon': this.optimizeVariantResponse(response.variants['carbon']),
      'filled': this.optimizeVariantResponse(response.variants['filled'])
    };

    return {
      conversionId: response.conversionId,
      originalImageName: response.originalImageName,
      variants: optimizedVariants,
      metadata: {
        processingTime,
        totalSize: this.calculateTotalSize(optimizedVariants),
        optimized: true
      }
    };
  }

  /**
   * Calculate size of SVG content
   */
  private calculateSize(svg: string): string {
    const bytes = new Blob([svg]).size;
    if (bytes < 1024) {
      return `${bytes}B`;
    } else {
      return `${(bytes / 1024).toFixed(1)}KB`;
    }
  }

  /**
   * Calculate total size of all variants
   */
  private calculateTotalSize(variants: Record<string, OptimizedVariantResponse>): string {
    let totalBytes = 0;
    Object.values(variants).forEach(variant => {
      totalBytes += new Blob([variant.svg]).size;
    });

    if (totalBytes < 1024) {
      return `${totalBytes}B`;
    } else if (totalBytes < 1024 * 1024) {
      return `${(totalBytes / 1024).toFixed(1)}KB`;
    } else {
      return `${(totalBytes / (1024 * 1024)).toFixed(1)}MB`;
    }
  }
}

/**
 * Clean API response data
 */
export function cleanAPIResponse(response: any): any {
  // Remove heavy validation data for production
  if (response.metadata) {
    delete response.metadata.validation;
    delete response.metadata.previewValidation;
    delete response.metadata.svgValidation;
  }
  
  return response;
}

/**
 * Optimize API response
 */
export function optimizeAPIResponse(
  response: MultiVariantIconResponse,
  processingTime: number
): OptimizedMultiVariantResponse {
  const optimizer = new APIOptimizer();
  return optimizer.optimizeMultiVariantResponse(response, processingTime);
}