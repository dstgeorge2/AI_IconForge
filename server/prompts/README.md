# Icon Prompt Engine - 2-Pass AI Icon Generation System

A comprehensive, modular system for generating high-quality UI icons using AI with semantic intent parsing, visual validation, and automatic error correction.

## Quick Start

```javascript
import { TwoPassIconGenerator } from './icon_prompt_engine.js';

const generator = new TwoPassIconGenerator();
const result = await generator.generateIcon('add_to_desk.png', 'Image description');

// Use result.prompt with your AI system
console.log(result.prompt);
```

## System Architecture

### 🎯 2-Pass Generation Flow

1. **Pass 1: Semantic Intent Analysis**
   - Filename parsing for action/object detection
   - Context-aware prompt generation
   - Comprehensive style guide application
   - Initial AI generation attempt

2. **Pass 2: Validation & Correction**
   - SVG validation against ruleset
   - Automatic error detection
   - Corrective prompt generation
   - Improved AI generation

### 📁 Modular Ruleset Structure

```
server/prompts/
├── icon_prompt_engine.js      # Main prompt generator
├── validate_output.js         # SVG validation engine
├── reprompt_fixer.js         # 2nd pass correction system
└── ruleset/                  # Modular JSON rules
    ├── icon_principles.json
    ├── stroke_and_line_rules.json
    ├── grid_and_alignment.json
    ├── shape_and_structure_rules.json
    ├── semantic_and_context_rules.json
    ├── perspective_and_dimensionality.json
    └── output_and_accessibility.json
```

## Ruleset Modules

### 1. Icon Principles (`icon_principles.json`)
- Universal design principles
- Quality gates and testing criteria
- Influences from major design systems

### 2. Stroke & Line Rules (`stroke_and_line_rules.json`)
- Stroke width (2dp), color (#000000), style (solid)
- Corner radius (2dp outer, square inner)
- Angle resolution and pixel snapping

### 3. Grid & Alignment (`grid_and_alignment.json`)
- Canvas (24dp), live area (20dp), padding (2dp)
- Keylines and positioning rules
- Optical vs mathematical centering

### 4. Shape & Structure (`shape_and_structure_rules.json`)
- Geometric primitives and metaphor guidelines
- Decoration rules (sparkles, dots, connection points)
- Universal symbol definitions

### 5. Semantic & Context (`semantic_and_context_rules.json`)
- Filename-to-intent mapping
- Action/object categorization
- Context-aware prompt generation

### 6. Perspective & Dimensionality (`perspective_and_dimensionality.json`)
- Orthographic projection only
- Prohibited 3D effects and depth cues
- Flat design enforcement

### 7. Output & Accessibility (`output_and_accessibility.json`)
- Export formats and sizes
- WCAG 2.1 AA compliance
- Color constraints and optimization

## Key Features

### 🧠 Semantic Intent Analysis
- Automatic action/object detection from filenames
- Context-aware prompt adaptation
- Universal metaphor selection

### 🎨 Comprehensive Style Guide
- Based on IBM Carbon, Google Material, FontAwesome
- Modular and override-safe ruleset
- Consistent geometric constraints

### ✅ Automatic Validation
- Real-time SVG compliance checking
- Critical/Warning/Info issue categorization
- Comprehensive rule coverage

### 🔧 Self-Correcting System
- Automatic error detection and correction
- Intelligent reprompt generation
- Quality improvement through iteration

## Usage Examples

### Basic Icon Generation
```javascript
const generator = new TwoPassIconGenerator();
const result = await generator.generateIcon('add_user.png');
console.log(result.semanticIntent); // { action: 'add', object: 'user', ... }
```

### Validation Only
```javascript
import SVGValidator from './validate_output.js';

const validator = new SVGValidator();
const validation = validator.validateSVG(svgString, metadata);
console.log(validation.isValid); // true/false
```

### Custom Corrections
```javascript
import RepromptFixer from './reprompt_fixer.js';

const fixer = new RepromptFixer();
const reprompt = fixer.generateReprompt(originalPrompt, failedSVG);
```

## Integration with Anthropic Claude

The system is designed to work seamlessly with Claude 4.0 Sonnet:

```javascript
const pass1 = await generator.generateIcon(filename);

const response = await anthropic.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 3000,
  system: pass1.prompt,
  messages: [/* your messages */]
});
```

## Quality Assurance

### Validation Categories
- **CRITICAL**: Must fix (invalid ViewBox, wrong stroke width)
- **WARNING**: Should fix (live area violations, non-standard elements)
- **INFO**: Nice to fix (optimization suggestions)

### Quality Gates
- Squint test: Recognizable when squinting
- 16dp test: Clear at minimum size
- Metaphor test: Universal symbol recognition
- Consistency test: Matches system patterns

## Configuration

### Rule Overrides
Modify individual JSON files in `ruleset/` to customize behavior:

```json
{
  "stroke": {
    "default_weight": "1dp",  // Override to 1dp
    "color": "#333333"        // Override to gray
  }
}
```

### Context Mapping
Add custom filename patterns in `semantic_and_context_rules.json`:

```json
{
  "filename_to_context": {
    "my_action": "custom_context",
    "special_object": "special_treatment"
  }
}
```

## Performance Considerations

- Validation runs in ~1-5ms for typical SVGs
- Semantic analysis is synchronous and fast
- 2-pass system reduces AI API calls for failed generations
- Modular loading allows selective rule application

## Error Handling

The system provides comprehensive error handling:

- Invalid JSON responses from AI
- Missing required fields
- SVG parsing errors
- Validation failures
- Network issues

## Development

### Adding New Rules
1. Create new JSON file in `ruleset/`
2. Update `icon_prompt_engine.js` to load it
3. Add validation logic in `validate_output.js`
4. Test with sample inputs

### Debugging
Set `NODE_ENV=development` for detailed logging:

```bash
NODE_ENV=development node your-script.js
```

## License

This system is designed for use with the Icon Forge application and follows the same licensing terms.