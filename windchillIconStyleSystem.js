/**
 * PTC Windchill Icon Design System Schema
 * Version: 2025.2
 * Purpose: Structured JavaScript schema for enterprise icon generation and validation
 */

export const windchillIconStyleSystem = {
  brand: "PTC Windchill",
  version: "2025.2",
  audience: ["designers", "iconographers", "engineers", "product-owners"],
  
  // Core Canvas & Geometry Specifications
  canvas: {
    size: 24,
    liveArea: 20,
    padding: 2,
    pixelSnapping: true,
    allowSubpixel: false,
    gridAlignment: "pixel-snapped"
  },

  stroke: {
    weight: 2,
    color: "#000000",
    style: "solid",
    terminal: ["square", "clipped-45"],
    cornerRadius: {
      outer: 2,
      inner: 0,
      allowOpticalCorrection: true
    }
  },

  geometry: {
    alignment: "centered",
    angles: [15, 30, 45, 90, 135, 180],
    allowedShapes: ["rectangle", "circle", "triangle", "chevron", "line", "star"],
    allowOverlap: true,
    maxSupportElements: 2,
    allowOpticalAsymmetry: true,
    dynamicSymmetry: true
  },

  // Visual Style Rules
  style: {
    perspective: "orthographic",
    flat: true,
    depthSimulation: false,
    shadow: false,
    gradient: false,
    isometric: false,
    fill: {
      default: false,
      allowedFor: ["badge", "active-state", "alert-bubble"]
    }
  },

  // Decoration System
  decoration: {
    sparkles: {
      type: "4-point-star",
      rotationRange: [15, 30],
      maxCount: 2,
      size: [1.5, 3],
      placement: "top-left or top-right"
    },
    dots: {
      style: "circle",
      maxCount: 3,
      size: [1, 1.5],
      placement: "organic"
    },
    plus: {
      size: 4,
      stroke: 2,
      alignment: "center",
      squareEnded: true
    },
    minus: {
      size: 4,
      stroke: 2,
      alignment: "center",
      squareEnded: true
    }
  },

  // Icon Function Categories
  iconTypes: {
    object: {
      description: "Represent nouns in Windchill (workspace, CAD part, document)",
      examples: ["workspace", "cad-part", "document", "bom"]
    },
    action: {
      description: "Represent verbs (add, delete, edit, release)",
      examples: ["add", "delete", "edit", "release", "lock"]
    },
    status: {
      description: "Represent metadata (locked, under review, recently changed)",
      examples: ["locked", "under-review", "changed", "approved"]
    },
    navigation: {
      description: "Represent location/context (home, folder, dashboard)",
      examples: ["home", "folder", "dashboard", "settings"]
    },
    composite: {
      description: "Combine noun + verb (add to workspace) — max 2 metaphors",
      examples: ["add-workspace", "delete-object", "edit-document"]
    }
  },

  // Accessibility Requirements
  accessibility: {
    minContrastRatio: 4.5,
    noColorReliance: true,
    minSize: 16,
    maxDetailDensity: "medium",
    touchTargetPadding: 10,
    wcagCompliant: "2.1",
    colorIndependence: true
  },

  // Naming Convention
  naming: {
    format: "snake_case",
    rules: {
      actionFirst: true,
      objectSecond: true,
      example: "add_workspace"
    },
    prohibited: ["text", "letters", "numerals"]
  },

  // Metadata System
  metadata: {
    requiredTags: ["domain", "function", "userRole"],
    domains: ["CAD", "BOM", "workflow", "document", "change", "manufacturing"],
    roles: ["engineer", "planner", "admin", "operator", "designer"],
    systemAreas: ["tree-view", "dashboard", "toolbar", "modal"]
  },

  // Output Specifications
  output: {
    formats: ["SVG", "FigmaComponent", "AI"],
    svgSettings: {
      stroke: "2",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeLinecap: "square",
      strokeLinejoin: "miter"
    },
    figma: {
      frameSize: "24x24",
      autoLayout: true,
      constraints: "center"
    }
  },

  // System Integration
  systemFit: {
    windchillLegacy: {
      replaceProgressive: true,
      maintainMetaphor: true
    },
    materialDesign: {
      harmonizeSpacing: true,
      respectGrid: true
    },
    carbonDesign: {
      geometricPurity: true,
      functionalClarity: true
    }
  },

  // Validation Rules
  validation: {
    required: [
      "clearMetaphor",
      "distinguishable",
      "2dpStroke",
      "gridAlignment",
      "16dpReadable",
      "roleRelevant",
      "scalable"
    ],
    checklist: [
      "Does it clearly express a real Windchill object or action?",
      "Is it distinguishable from other nearby or similar icons?",
      "Does it obey the 2dp stroke, grid, and padding rules?",
      "Is the metaphor readable at 16dp?",
      "Is it role-relevant and does it reduce ambiguity?",
      "Can it scale across tree views, dashboards, and toolbars?"
    ]
  },

  // Future Expansion
  roadmap: {
    alertOverlays: "Layered icons to indicate locked, under review, etc.",
    filledIconSet: "Optional fill-based set for theming or emphasis use",
    motionAware: "SVG-animated variants for real-time data or monitoring tools",
    domainPacks: "Specialized icon sets for CAD, Manufacturing, Service, etc.",
    programmaticGeneration: "Semantic-icon tool that builds from tag metadata"
  }
};

// Validation Functions
export const validateWindchillIcon = (iconSVG, metadata) => {
  const errors = [];
  const warnings = [];
  
  // Check canvas size
  if (!iconSVG.includes('viewBox="0 0 24 24"')) {
    errors.push('Icon must use 24x24 viewBox');
  }
  
  // Check stroke weight
  if (!iconSVG.includes('stroke-width="2"')) {
    warnings.push('Icon should use 2dp stroke weight');
  }
  
  // Check required metadata
  const required = windchillIconStyleSystem.metadata.requiredTags;
  required.forEach(tag => {
    if (!metadata[tag]) {
      errors.push(`Missing required metadata: ${tag}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5))
  };
};

export default windchillIconStyleSystem;