# Team Documentation - PTC Windchill Icon System

## Overview
This document serves as a comprehensive guide for teams working with the PTC Windchill Icon Generation System. It includes technical specifications, collaboration guidelines, and governance processes.

---

## 🎯 For Product Managers

### Icon Request Process
1. **Requirement Definition**: Define the icon's purpose, target user role, and system context
2. **Metadata Requirements**: Specify domain (CAD, BOM, workflow, etc.), function, and user role
3. **Review Criteria**: Use the Windchill validation checklist before approval
4. **Governance**: All icons must pass Windchill compliance validation (minimum 80% score)

### Key Metrics
- **Windchill Compliance Score**: Target 90%+ for production icons
- **Accessibility**: All icons must meet WCAG 2.1 standards (4.5:1 contrast)
- **Scalability**: Icons must be readable at 16dp minimum size
- **Role Coverage**: Icons should support multiple user roles (engineer, planner, admin, etc.)

---

## 🖥️ For Developers

### Integration Points
```typescript
// Import the Windchill validation system
import { validateWindchillIcon, WindchillIconMetadata } from './server/services/windchillIconValidator';

// Validate an icon
const metadata: WindchillIconMetadata = {
  domain: 'CAD',
  function: 'add_workspace',
  userRole: 'engineer',
  iconType: 'composite',
  systemArea: 'toolbar',
  description: 'Add new workspace to CAD environment'
};

const validation = validateWindchillIcon(svgContent, metadata);
```

### API Endpoints
- `POST /api/generate-multi-variant-icons` - Generate 5 icon variants with Windchill compliance
- Response includes `windchillCompliance` scores for each variant

### Technical Requirements
- **SVG Format**: Clean, stroke-based paths with no raster embeds
- **Viewbox**: Always use `viewBox="0 0 24 24"`
- **Stroke Weight**: 2dp uniform stroke weight
- **Naming**: Use snake_case (e.g., `add_workspace.svg`)

---

## 🎨 For Designers

### Design Tools
- **Figma Templates**: Use 24dp frames with 20dp live area
- **Style System**: Reference `windchillIconStyleSystem.js` for specifications
- **Validation**: Use built-in Windchill validator for compliance checks

### Design Principles
1. **Function-First**: Every icon must clearly express a Windchill concept
2. **Role-Aware**: Consider different user perspectives (engineer vs. planner)
3. **System-Aligned**: Harmonize with existing Windchill complexity
4. **Scalable**: Must work at 16dp minimum size

### Common Patterns
- **Object Icons**: workspace, cad_part, document, bom
- **Action Icons**: add, delete, edit, release, lock
- **Status Icons**: locked, under_review, changed, approved
- **Composite Icons**: add_workspace, delete_object, edit_document

---

## 📋 For QA Teams

### Testing Checklist
- [ ] Icon passes Windchill validation (80%+ score)
- [ ] Readable at 16dp minimum size
- [ ] Meets 4.5:1 contrast ratio
- [ ] No 3D/isometric elements
- [ ] Square stroke endings
- [ ] Proper metadata tags included
- [ ] Pixel-snapped geometry
- [ ] No gradients or shadows

### Validation Tools
```bash
# Run validation on icon set
node scripts/validateIconSet.js ./icons/
```

### Test Scenarios
- **Multi-size rendering**: Test at 16dp, 20dp, 24dp, 32dp, 48dp
- **Theme compatibility**: Test in light and dark modes
- **Role-based usage**: Verify icons work for different user roles
- **Dense UI contexts**: Test in complex interfaces (BOMs, change controls)

---

## 🔧 For System Administrators

### Deployment Requirements
- **Database**: PostgreSQL with icon metadata tables
- **API Keys**: Anthropic API key for generation
- **Storage**: SVG files with metadata tags
- **Monitoring**: Track validation scores and compliance metrics

### Performance Metrics
- **Generation Time**: Target <30 seconds for 5 variants
- **Validation Score**: Maintain 90%+ average across all icons
- **API Response Size**: Optimized SVG output (<2KB per icon)

### Security Considerations
- **Input Validation**: Sanitize all uploaded images
- **Rate Limiting**: Prevent abuse of generation endpoints
- **Access Control**: Role-based access to generation features

---

## 📊 Governance & Review Process

### Icon Approval Workflow
1. **Request Submission**: Product team submits icon request with metadata
2. **Automated Generation**: System generates 5 variants with compliance scores
3. **Designer Review**: Design team reviews and selects best variant
4. **Validation Check**: Automated validation ensures compliance
5. **Stakeholder Approval**: Final approval from relevant domain experts
6. **Production Deployment**: Icon added to system with full metadata

### Review Criteria
- **Windchill Compliance**: Minimum 80% score required
- **Accessibility**: WCAG 2.1 compliance mandatory
- **Role Relevance**: Must serve actual user needs
- **System Integration**: Harmonizes with existing iconography

---

## 📈 Metrics & Analytics

### Key Performance Indicators
- **Compliance Score Distribution**: Track validation scores across all icons
- **Generation Success Rate**: Percentage of successful icon generations
- **User Satisfaction**: Feedback on icon clarity and usefulness
- **System Performance**: API response times and error rates

### Reporting Dashboard
- **Real-time Compliance**: Monitor validation scores
- **Usage Analytics**: Track which icons are most frequently generated
- **Quality Trends**: Historical compliance score trends
- **Error Analysis**: Common validation failures and patterns

---

## 🔄 Continuous Improvement

### Feedback Loop
1. **User Feedback**: Collect feedback on icon usability
2. **Compliance Analysis**: Review validation failures
3. **System Updates**: Improve generation algorithms
4. **Style Guide Evolution**: Update standards based on usage

### Version Control
- **Style Guide**: Track changes to Windchill specifications
- **Validation Rules**: Version control for compliance criteria
- **Icon Versions**: Maintain history of icon updates

---

## 🆘 Troubleshooting

### Common Issues
- **Low Compliance Scores**: Check stroke weight, geometry, and metadata
- **Accessibility Failures**: Verify contrast ratios and color independence
- **Generation Errors**: Validate input images and API connectivity
- **Performance Issues**: Monitor system resources and optimize queries

### Support Contacts
- **Technical Issues**: Development team
- **Design Questions**: Design system team
- **Process Issues**: Product management
- **System Administration**: IT operations

---

## 📚 Resources

### Documentation
- [PTC Windchill Icon Style Guide](./PTC_Windchill_Icon_Style_Guide.md)
- [Windchill Icon System Schema](./windchillIconStyleSystem.js)
- [Technical Implementation Guide](./replit.md)

### Tools
- Windchill Icon Validator
- Figma Design Templates
- SVG Optimization Tools
- Compliance Dashboard

### Training Materials
- Icon Design Principles Workshop
- Windchill Compliance Training
- Technical Implementation Guide
- Best Practices Documentation

---

*Last Updated: January 17, 2025*
*Version: 2025.2*