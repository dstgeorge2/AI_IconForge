# 🧭 PTC Windchill Icon Style Guide

**Version:** 2025.2  
**Purpose:** Establish a clear, enforceable system for designing icons that support the complex workflows, technical rigor, and role-based clarity required across Windchill.

---

## 🧱 1. Foundations

| Principle | Description |
|-----------|-------------|
| **Function-First** | Every icon must clearly express a concept, object, or action relevant to Windchill workflows |
| **Role-Aware** | Icons must support distinct needs of engineers, planners, manufacturers, admins, and business users |
| **System-Aligned** | Icons must harmonize with Windchill's data complexity, not oversimplify it |
| **Scalable & Accessible** | Icons must remain effective at 16dp and meet WCAG 2.1 contrast requirements |

---

## 📐 2. Canvas & Geometry

| Element | Specification |
|---------|---------------|
| **Canvas Size** | 24dp × 24dp |
| **Live Area** | 20dp × 20dp, centered |
| **Padding** | 2dp minimum on all sides |
| **Grid Alignment** | Pixel-snapped, no subpixel strokes |
| **Stroke Weight** | 2dp uniform (optically corrected allowed) |
| **Stroke Endings** | Squared or 45° clipped |
| **Corner Radius** | 2dp outer corners; square interior unless optically corrected |
| **Angles** | 15° increments; prefer 45°/90° for clarity |

---

## 🔷 3. Icon Construction

### 📦 Core Shapes
- Use geometric primitives (rectangles, circles, lines, triangles)
- Apply subtle optical adjustments to improve balance
- Icons should be readable silhouettes at 16dp

### 🔄 Composition Rules

| Component | Guidelines |
|-----------|------------|
| **Primary Metaphor** | Always build around a single recognizable object or concept (e.g., document, folder, gear, task) |
| **Supporting Forms** | Max of 2; only if necessary for clarity |
| **No Text** | Letters, words, or numerals are prohibited |

---

## ✨ 4. Decoration & Motion

| Type | Rules |
|------|-------|
| **Sparkles** | 4-point stars; max 2 per icon; 15–30° rotated; small size (1.5–3dp) |
| **Dots** | Organic or status-based; max 3; 1–1.5dp |
| **Pluses/Minuses** | Use 2dp lines; optically centered in 6dp square |
| **Motion Suggestion** | Only via shape gesture (e.g., arrow curve); no blur, animation, or trails |

---

## 🖼️ 5. Perspective & Visual Style

| Attribute | Value |
|-----------|--------|
| **Perspective** | Orthographic (flat front or side view) |
| **3D / Isometric** | ❌ Prohibited |
| **Shadows** | ❌ None |
| **Fills** | Default is stroke-only; fills allowed only when explicitly meaningful (e.g., alert bubble) |
| **Depth Simulation** | ❌ Not allowed |
| **Color Usage** | Monochrome default; no gradient or hue-based meaning unless specified for theme variants |

---

## 🔧 6. System Fit & Consistency

| Integration Zone | Considerations |
|------------------|----------------|
| **Legacy Windchill UI** | Replace pixel-art icons progressively; avoid abrupt metaphor changes |
| **CDS / Material 3** | Harmonize with spacing, stroke system, alignment discipline |
| **Carbon or Spectrum** | Compatible but distinct — prioritize Windchill complexity (not minimal for minimal's sake) |
| **Theme Context** | Must support light and dark mode without relying on color for meaning |

---

## ♿ 7. Accessibility

| Requirement | Value |
|-------------|--------|
| **Min Contrast Ratio** | 4.5:1 |
| **Color Independence** | Icons cannot depend solely on color to convey meaning |
| **Minimum Effective Size** | Must be legible at 16dp with no distortion |
| **Interactive Use** | Icons that serve as buttons must follow touch target sizing (min 44dp) |

---

## 📦 8. Output Requirements

| Format | Requirement |
|--------|-------------|
| **SVG** | Clean, stroke-based; no raster embeds or fills unless specified |
| **Figma Component** | 24dp frame, named using snake_case, grouped by object or action |
| **Naming Convention** | object_action.svg or action_subject.svg (e.g., add_workspace, delete_node) |
| **Metadata** | Include tags for object type, user role, and intended system area (e.g., CAD, Workflow, BOM) |

---

## 🎯 9. Icon Function & Semantic Scope

| Icon Type | Role | Examples |
|-----------|------|----------|
| **Object icons** | Represent nouns in Windchill (e.g., workspace, CAD part, document) | workspace, cad_part, document, bom |
| **Action icons** | Represent verbs (e.g., add, delete, edit, release) | add, delete, edit, release, lock |
| **Status icons** | Represent metadata (e.g., locked, under review, recently changed) | locked, under_review, changed, approved |
| **Navigation icons** | Represent location/context (e.g., home, folder, dashboard) | home, folder, dashboard, settings |
| **Composite icons** | Combine noun + verb (e.g., add to workspace) — max 2 metaphors | add_workspace, delete_object, edit_document |

### Icon Requirements:
- Must always be describable in plain language (e.g., "this shows a new document being created")
- Must be role-aware (e.g., a designer sees different icons than a manufacturing planner)

---

## 🧠 10. Review Checklist

Use this before accepting any new icon into the system:

- ✅ Does it clearly express a real Windchill object or action?
- ✅ Is it distinguishable from other nearby or similar icons?
- ✅ Does it obey the 2dp stroke, grid, and padding rules?
- ✅ Is the metaphor readable at 16dp?
- ✅ Is it role-relevant and does it reduce ambiguity?
- ✅ Can it scale across tree views, dashboards, and toolbars?

---

## 🚀 11. Future Expansion Areas

| Roadmap Area | Description |
|--------------|-------------|
| **Alert/Status Overlays** | Layered icons to indicate locked, under review, etc. |
| **Filled Icon Set** | Optional fill-based set for theming or emphasis use |
| **Motion-Aware Icons** | SVG-animated variants for real-time data or monitoring tools |
| **Domain Packs** | Specialized icon sets for CAD, Manufacturing, Service, etc. |
| **Programmatic Generation** | Semantic-icon tool that builds from tag metadata, using your visual grammar |

---

## 📈 12. Strategic Design Considerations

### Icons are not decorative — they are semantic UI infrastructure

Windchill's complexity requires icons to:
- Disambiguate dense UIs
- Reduce cognitive load across roles
- Scale across object trees, tables, modals, toolbars

### Each new icon must be:
- **Justifiable** (why it exists)
- **Distinguishable** (how it differs from neighbors)
- **Composable** (how it supports workflows)

---

## ✅ 13. Summary: Icons Should…

| Do This | Avoid This |
|---------|------------|
| Use clear stroke metaphors | Abstract blobs or gradient shapes |
| Maintain 2dp visual rhythm | Jagged pixel outlines or 3D bevels |
| Express function, not style | Decorative embellishments |
| Work across enterprise roles | Role-agnostic generic glyphs |
| Scale down to 16dp cleanly | Over-detailed microglyphs |
| Fit Windchill's industrial tone | Playful, emoji-style graphics |

---

## 🛠️ Implementation Resources

### For Developers:
- Use the `windchillIconStyleSystem.js` schema for validation
- Implement the `validateWindchillIcon()` function in your build process
- Follow the SVG output specifications for consistent rendering

### For Designers:
- Use the Figma component template with 24dp frames
- Follow the snake_case naming convention
- Include required metadata tags for each icon

### For Product Teams:
- Reference the icon function categories when planning new features
- Ensure new icons pass the review checklist
- Consider role-based icon variations for complex workflows

---

**Next Steps:**
1. Implement the validation schema in your icon generation pipeline
2. Create Figma templates based on these specifications
3. Begin progressive replacement of legacy icons
4. Establish governance process for new icon requests

This style guide serves as the foundation for a scalable, accessible, and enterprise-ready icon system that supports PTC Windchill's complex workflows while maintaining visual consistency and clarity.