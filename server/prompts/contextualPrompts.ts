export const IMAGE_ANALYSIS_PROMPTS = {
  // Context-specific prompts based on image content
  tech: `Focus on creating clean, minimal icons for technical concepts. Use geometric shapes that represent functionality over decoration. Common tech metaphors: gears for settings, monitors for displays, clouds for services, nodes for networks.`,
  
  ui: `Create interface-appropriate icons that work well in digital contexts. Emphasize clarity at small sizes. Use universal UI metaphors: hamburger menu (three lines), search (magnifying glass), profile (person silhouette), notifications (bell).`,
  
  nature: `Translate natural elements into geometric equivalents. Trees become triangles over rectangles, mountains become triangular peaks, water becomes wavy lines. Maintain recognizable silhouettes while applying geometric constraints.`,
  
  objects: `Focus on the essential recognizable features of physical objects. Reduce complex forms to their most distinctive geometric elements. A car becomes rounded rectangles, a phone becomes a rounded rectangle with minimal details.`,
  
  abstract: `For abstract concepts, use established metaphors and symbolic representations. Ideas become lightbulbs, communication becomes speech bubbles, time becomes clocks, progress becomes arrows or bars.`
};

export const QUALITY_ENHANCEMENT_PROMPTS = {
  clarity: `Ensure maximum clarity by:
- Using high contrast (black strokes on white)
- Avoiding overlapping elements that create confusion
- Making key distinguishing features prominent
- Testing conceptual recognition at 16dp size`,
  
  geometry: `Apply geometric discipline by:
- Snapping all coordinates to integer values
- Using consistent 2dp stroke width throughout
- Maintaining proper proportions within the 20x20dp live area
- Creating balanced, centered compositions`,
  
  metaphor: `Strengthen metaphorical representation by:
- Choosing the most universally recognized symbol for the concept
- Removing unnecessary decorative elements
- Emphasizing the core identifying features
- Ensuring cultural universality of the chosen metaphor`
};

export const COMMON_MISTAKES_TO_AVOID = `
AVOID THESE COMMON ERRORS:
- Using stroke-width other than 2dp
- Positioning elements outside the 20x20dp live area
- Creating overly complex paths with many curves
- Using fills when line work is sufficient
- Making icons that are unrecognizable at small sizes
- Copying realistic details instead of geometric abstractions
- Using perspective or 3D effects
- Creating asymmetrical compositions without purpose
- Overlapping strokes that create visual noise
- Ignoring the cultural universality of symbols
`;