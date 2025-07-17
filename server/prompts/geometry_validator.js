// GEOMETRY VECTOR CHECK LOGIC
// Purpose: Validate vector primitives against geometric rules for consistency, scalability, and accessibility

export function validateGeometry(iconShapes) {
  const issues = [];
  
  // Ensure iconShapes is an array
  if (!Array.isArray(iconShapes)) {
    issues.push("Invalid input: iconShapes must be an array");
    return { valid: false, issues };
  }

  for (const shape of iconShapes) {
    // 1. Canvas fit validation
    if (shape.x + shape.width > 24 || shape.y + shape.height > 24) {
      issues.push(`Shape exceeds canvas bounds (24dp): x=${shape.x}, y=${shape.y}, width=${shape.width}, height=${shape.height}`);
    }
    
    // 2. Live area validation (20dp live area with 2dp padding)
    if (shape.x < 2 || shape.y < 2 || shape.x + shape.width > 22 || shape.y + shape.height > 22) {
      issues.push(`Shape violates live area padding (20dp live area): x=${shape.x}, y=${shape.y}, width=${shape.width}, height=${shape.height}`);
    }

    // 3. Stroke validation
    if (shape.stroke !== "#000000" && shape.stroke !== "black") {
      issues.push(`Invalid stroke color: ${shape.stroke}. Must be #000000 or black.`);
    }
    if (shape.strokeWidth !== 2) {
      issues.push(`Invalid stroke width: ${shape.strokeWidth}. Must be 2dp.`);
    }

    // 4. Corner radius validation
    if (shape.type === "rect" && shape.cornerRadius !== undefined) {
      if (shape.cornerRadius !== 2 && shape.cornerRadius !== 0) {
        issues.push(`Invalid corner radius: ${shape.cornerRadius}. Must be 2dp for outer corners or 0dp for inner corners.`);
      }
    }

    // 5. Angle enforcement (for line or path elements)
    if (shape.angle !== undefined) {
      const allowedAngles = [0, 15, 30, 45, 60, 90, 120, 135, 150, 180];
      if (!allowedAngles.includes(shape.angle)) {
        issues.push(`Invalid angle: ${shape.angle}°. Must be one of: ${allowedAngles.join(', ')}`);
      }
    }

    // 6. Subpixel coordinate validation
    const coordinateAttrs = ["x", "y", "x1", "x2", "y1", "y2", "width", "height", "cx", "cy", "r"];
    coordinateAttrs.forEach(attr => {
      if (shape[attr] !== undefined && shape[attr] % 1 !== 0) {
        issues.push(`Subpixel value detected in ${attr}: ${shape[attr]}. All coordinates must be integers.`);
      }
    });

    // 7. Fill validation
    if (shape.fill !== undefined && shape.fill !== "none" && shape.fill !== "transparent" && shape.fill !== "#ffffff") {
      issues.push(`Invalid fill: ${shape.fill}. Must be 'none', 'transparent', or '#ffffff'.`);
    }

    // 8. Stroke style validation
    if (shape.strokeStyle !== undefined && shape.strokeStyle !== "solid") {
      issues.push(`Invalid stroke style: ${shape.strokeStyle}. Must be 'solid'.`);
    }

    // 9. Minimum size validation (for accessibility)
    if (shape.width < 2 || shape.height < 2) {
      issues.push(`Element too small: ${shape.width}x${shape.height}. Minimum size is 2x2dp for 16dp scalability.`);
    }

    // 10. Maximum complexity validation
    if (shape.type === "path" && shape.d && shape.d.length > 200) {
      issues.push(`Path too complex: ${shape.d.length} characters. Consider simplifying for better performance.`);
    }
  }

  // 11. Decoration limits
  const sparkleCount = iconShapes.filter(s => s.isDecoration && s.type === "sparkle").length;
  if (sparkleCount > 3) {
    issues.push(`Too many sparkles: ${sparkleCount}. Maximum allowed: 3.`);
  }

  const dotCount = iconShapes.filter(s => s.isDecoration && s.type === "dot").length;
  if (dotCount > 5) {
    issues.push(`Too many dots: ${dotCount}. Maximum allowed: 5.`);
  }

  // 12. Element hierarchy validation
  const primaryElements = iconShapes.filter(s => !s.isDecoration && s.isPrimary);
  const supportingElements = iconShapes.filter(s => !s.isDecoration && !s.isPrimary);
  
  if (primaryElements.length === 0) {
    issues.push("No primary element found. Icon must have at least one primary shape.");
  }
  if (primaryElements.length > 1) {
    issues.push(`Too many primary elements: ${primaryElements.length}. Maximum allowed: 1.`);
  }
  if (supportingElements.length > 2) {
    issues.push(`Too many supporting elements: ${supportingElements.length}. Maximum allowed: 2.`);
  }

  // 13. Overlap validation
  const overlaps = findOverlaps(iconShapes.filter(s => !s.isDecoration));
  if (overlaps.length > 0) {
    issues.push(`Element overlaps detected: ${overlaps.length} overlapping pairs may cause clarity issues.`);
  }

  return issues.length ? { valid: false, issues } : { valid: true };
}

// Helper function to detect overlapping elements
function findOverlaps(shapes) {
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

// Enhanced SVG parsing for geometry validation
export function parseSVGForGeometry(svgString) {
  const shapes = [];
  
  // Parse rect elements
  const rectMatches = svgString.matchAll(/<rect([^>]+)>/g);
  for (const match of rectMatches) {
    const attrs = parseAttributes(match[1]);
    shapes.push({
      type: "rect",
      x: parseFloat(attrs.x || 0),
      y: parseFloat(attrs.y || 0),
      width: parseFloat(attrs.width || 0),
      height: parseFloat(attrs.height || 0),
      cornerRadius: parseFloat(attrs.rx || attrs.ry || 0),
      stroke: attrs.stroke || "#000000",
      strokeWidth: parseFloat(attrs["stroke-width"] || 2),
      fill: attrs.fill || "none",
      isPrimary: !attrs.class || !attrs.class.includes("decoration"),
      isDecoration: attrs.class && attrs.class.includes("decoration")
    });
  }

  // Parse circle elements
  const circleMatches = svgString.matchAll(/<circle([^>]+)>/g);
  for (const match of circleMatches) {
    const attrs = parseAttributes(match[1]);
    shapes.push({
      type: "circle",
      cx: parseFloat(attrs.cx || 0),
      cy: parseFloat(attrs.cy || 0),
      r: parseFloat(attrs.r || 0),
      x: parseFloat(attrs.cx || 0) - parseFloat(attrs.r || 0),
      y: parseFloat(attrs.cy || 0) - parseFloat(attrs.r || 0),
      width: parseFloat(attrs.r || 0) * 2,
      height: parseFloat(attrs.r || 0) * 2,
      stroke: attrs.stroke || "#000000",
      strokeWidth: parseFloat(attrs["stroke-width"] || 2),
      fill: attrs.fill || "none",
      isPrimary: !attrs.class || !attrs.class.includes("decoration"),
      isDecoration: attrs.class && attrs.class.includes("decoration")
    });
  }

  // Parse line elements
  const lineMatches = svgString.matchAll(/<line([^>]+)>/g);
  for (const match of lineMatches) {
    const attrs = parseAttributes(match[1]);
    const x1 = parseFloat(attrs.x1 || 0);
    const y1 = parseFloat(attrs.y1 || 0);
    const x2 = parseFloat(attrs.x2 || 0);
    const y2 = parseFloat(attrs.y2 || 0);
    
    shapes.push({
      type: "line",
      x1, y1, x2, y2,
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
      angle: calculateAngle(x1, y1, x2, y2),
      stroke: attrs.stroke || "#000000",
      strokeWidth: parseFloat(attrs["stroke-width"] || 2),
      isPrimary: !attrs.class || !attrs.class.includes("decoration"),
      isDecoration: attrs.class && attrs.class.includes("decoration")
    });
  }

  // Parse path elements
  const pathMatches = svgString.matchAll(/<path([^>]+)>/g);
  for (const match of pathMatches) {
    const attrs = parseAttributes(match[1]);
    const bbox = estimatePathBoundingBox(attrs.d || "");
    
    shapes.push({
      type: "path",
      d: attrs.d || "",
      x: bbox.x,
      y: bbox.y,
      width: bbox.width,
      height: bbox.height,
      stroke: attrs.stroke || "#000000",
      strokeWidth: parseFloat(attrs["stroke-width"] || 2),
      fill: attrs.fill || "none",
      isPrimary: !attrs.class || !attrs.class.includes("decoration"),
      isDecoration: attrs.class && attrs.class.includes("decoration")
    });
  }

  return shapes;
}

// Helper function to parse SVG attributes
function parseAttributes(attrString) {
  const attrs = {};
  const matches = attrString.matchAll(/(\w+(?:-\w+)*)=["']([^"']+)["']/g);
  
  for (const match of matches) {
    attrs[match[1]] = match[2];
  }
  
  return attrs;
}

// Helper function to calculate line angle
function calculateAngle(x1, y1, x2, y2) {
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  return Math.round(angle);
}

// Helper function to estimate path bounding box
function estimatePathBoundingBox(pathData) {
  // Simple estimation - in a real implementation, you'd parse the path data more thoroughly
  const coords = pathData.match(/[\d.]+/g);
  if (!coords || coords.length < 2) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  
  const numbers = coords.map(Number);
  const x = Math.min(...numbers.filter((_, i) => i % 2 === 0));
  const y = Math.min(...numbers.filter((_, i) => i % 2 === 1));
  const maxX = Math.max(...numbers.filter((_, i) => i % 2 === 0));
  const maxY = Math.max(...numbers.filter((_, i) => i % 2 === 1));
  
  return {
    x: x || 0,
    y: y || 0,
    width: (maxX - x) || 0,
    height: (maxY - y) || 0
  };
}

// Quality assessment function
export function assessIconQuality(shapes) {
  const qualityMetrics = {
    clarity: 0,
    consistency: 0,
    scalability: 0,
    accessibility: 0
  };
  
  // Clarity assessment
  const elementCount = shapes.filter(s => !s.isDecoration).length;
  if (elementCount <= 3) qualityMetrics.clarity += 25;
  if (elementCount <= 2) qualityMetrics.clarity += 25;
  
  // Consistency assessment
  const strokeWidths = [...new Set(shapes.map(s => s.strokeWidth))];
  if (strokeWidths.length === 1 && strokeWidths[0] === 2) qualityMetrics.consistency += 50;
  
  // Scalability assessment
  const minSize = Math.min(...shapes.map(s => Math.min(s.width, s.height)));
  if (minSize >= 2) qualityMetrics.scalability += 25;
  if (minSize >= 4) qualityMetrics.scalability += 25;
  
  // Accessibility assessment
  const hasGoodContrast = shapes.every(s => s.stroke === "#000000" || s.stroke === "black");
  if (hasGoodContrast) qualityMetrics.accessibility += 50;
  
  return qualityMetrics;
}

export default validateGeometry;