# Icon Forge - AI-Powered Icon Generation Tool

## Overview

Icon Forge is a brutalist-styled web application that converts user-uploaded images into pixel-perfect SVG icons using AI. The application follows the Vectra Icon Style Guide to generate geometric, standardized icons with consistent styling and validation.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **Product Requirements Document** (2025-01-17): Created comprehensive PRD covering product vision, user requirements, technical specifications, and roadmap
- **PTC Windchill Enterprise Icon System** (2025-01-17): Implemented comprehensive enterprise-grade icon generation system:
  - **Windchill Style Guide**: Complete 13-section style guide with enterprise specifications
  - **Windchill Validator**: Production-grade validation system with compliance scoring
  - **Enterprise Prompts**: All generation prompts updated for industrial/manufacturing workflows
  - **Role-Aware Generation**: Icons optimized for engineers, planners, manufacturers, and admins
  - **Technical Precision**: Pixel-snapped geometry, square stroke endings, orthographic perspective
  - **Accessibility Compliance**: WCAG 2.1 standards with 4.5:1 contrast ratios
  - **System Integration**: Harmonized with Material Design, Carbon Design, and legacy Windchill UI
- **Enhanced Computer Vision Pipeline** (2025-01-17): Implemented multi-stage computer vision analysis with improved image processing:
  - **Stage 1 Preprocessing**: Enhanced image analysis with structured visual primitives extraction
  - **Stage 2 Multimodal Semantic Fusion**: Combining visual analysis with filename semantics and user prompts
  - **Stage 3 Enhanced Prompting**: Structured prompt construction with multi-modal context integration
  - **Stage 4 SVG Post-Processing**: Advanced SVG validation, normalization, and quality assessment
  - **Stage 5 Multi-Variant Output**: Improved variant generation with enhanced validation pipeline
  - **Stage 6 Enhanced Validation**: Production-grade SVG validation service with confidence scoring
- **Grade A/S Icon Quality System** (2025-01-17): Implemented advanced icon generation with professional-grade validation:
  - **Metaphor Engine**: Multi-variant metaphor generation with synonym resolution and concept mapping
  - **Hard Constraints**: Enforced monochrome, recognizable geometry, canvas bounds, consistent stroke weight, flat perspective, and pixel grid alignment
  - **Soft Guardrails**: Visual weight balance, live area usage, recognizability, and system consistency checks
  - **Multi-Size Preview Validation**: Automatic testing at 16px, 20px, 24px, 32px, 48px with clarity scoring
  - **Set-Aware Design Validation**: Ensures visual consistency across icon sets, prevents conflicts, and maintains brand guidelines
  - **Optical Correction Engine**: 0.5dp visual centering, stroke weight adjustments, and inner element scaling for Grade A/S quality
- **Text Description Mode** (2025-01-17): Added dual-input functionality with toggle switch:
  - **Image Mode**: Traditional drag-and-drop image upload with paste support
  - **Text Mode**: Plain text descriptions for icon generation (e.g., "Shopping cart for e-commerce")
  - Toggle switch seamlessly switches between input modes
  - Backend support for both image and text-based icon generation with enhanced metaphor analysis
  - Same 5-variant output system for both input modes
- **Enhanced Material Design Integration** (2025-01-17): Integrated official Material Design specifications:
  - **Variable Font Attributes**: Weight (400), Fill (0), Grade (0), Optical Size (24dp)
  - **Proper Weight Standards**: 400 regular weight for 24dp icons, avoiding 100 weight at standard size
  - **Fill State Management**: Outlined style (fill=0) for base state, filled (fill=1) for active states
  - **Grade Compensation**: Grade 0 for standard contrast, -25 for light icons on dark backgrounds
  - **Optical Size Optimization**: 24dp optimized stroke weight and spacing for proper scaling
- **Expanded 5-Variant System** (2025-01-17): Complete redesign with specialized design approaches:
  - **Tab 1: 1:1 Icon** - Based on image vision with enhanced visual reconstruction
  - **Tab 2: UI Intent** - Based on image and filename analysis for semantic understanding
  - **Tab 3: Material** - Google Material Design + image following strict design system with variable font attributes
  - **Tab 4: Carbon** - IBM Carbon Design + image with consistent visual language
  - **Tab 5: Filled** - Solid filled style with high contrast and minimal outlines
- **Multi-Size Preview System** (2025-01-17): Icons displayed at standard sizes:
  - Horizontal row preview: 16dp, 20dp, 24dp, 32dp, 48dp
  - Proper sizing constraints and optical testing at multiple scales
  - Scalability validation for all design system requirements
- **Revision Interface** (2025-01-17): Added comprehensive refinement system:
  - Computer vision descriptions in simple language for user guidance
  - Reference icon attachment for iterative improvements
  - Custom prompt editing for specific modifications
  - Expandable revision panels for each variant type
- **Design System Integration** (2025-01-17): Enhanced compliance with industry standards:
  - Material Design specifications with keyline shapes and stroke weights
  - IBM Carbon Design system with proper grid and corner radius rules
  - Two-pass refinement system for optimal icon principles
  - Accessibility and touch target compliance

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom brutalist design system
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **File Upload**: React Dropzone for drag-and-drop functionality

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for icon conversion
- **File Processing**: Multer for multipart form data handling
- **AI Integration**: Anthropic Claude 4.0 Sonnet for image-to-icon conversion

### Advanced Icon Generation System
- **PTC Windchill Enterprise System**: Full enterprise-grade icon generation with industrial standards
- **Windchill Style Guide**: 13-section comprehensive guide covering geometry, accessibility, and enterprise requirements
- **Windchill Validator**: Production validation system with compliance scoring and enterprise-specific checks
- **Enterprise Prompts**: All generation prompts updated for manufacturing, engineering, and technical workflows
- **Role-Aware Generation**: Icons optimized for engineers, planners, manufacturers, admins, and designers
- **Technical Precision**: Pixel-snapped geometry, square stroke endings, orthographic perspective only
- **Enhanced Computer Vision Pipeline**: Multi-stage image analysis with structured visual primitives extraction
- **Multimodal Semantic Fusion**: Intelligent combination of image analysis, filename semantics, and user prompts
- **Advanced SVG Validation Service**: Production-grade SVG validation with normalization and confidence scoring
- **Metaphor Engine**: Multi-variant metaphor generation with synonym resolution and concept mapping
- **Grade A/S Quality Pipeline**: Professional-grade validation with hard constraints and soft guardrails
- **Multi-Size Preview Validation**: Automatic testing at 16px, 20px, 24px, 32px, 48px with clarity scoring
- **Set-Aware Design Validation**: Visual consistency checking across icon sets with conflict prevention
- **Optical Correction System**: 0.5dp visual centering, stroke weight adjustments, and inner element scaling
- **Intelligent Prompting**: Multi-modal analysis combining filename semantics, image vision, and UI pattern matching
- **Pass 1**: Enhanced semantic intent analysis with intelligent prompt generation
- **Pass 2**: SVG validation and automatic error correction with quality scoring
- **Modular Rulesets**: 7 JSON-based rule modules for different aspects
- **Adaptive Prompts**: Context-aware instructions based on comprehensive analysis
- **Quality Assurance**: Automated validation with critical/warning/info levels
- **Pattern Recognition**: Database of common UI icon patterns for better metaphor selection

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon Database)
- **Schema**: Users and icon_conversions tables
- **Migration**: Drizzle Kit for schema management

## Key Components

### Core Features
1. **Image Upload**: Drag-and-drop interface for image files (max 10MB)
2. **AI Conversion**: OpenAI Vision API converts images to SVG icons
3. **Style Validation**: Automatic validation against Vectra Icon Style Guide
4. **Export Options**: SVG download, React component generation, clipboard copy
5. **Preview System**: Multiple size previews (16dp, 20dp, 24dp, 48dp)

### UI Components
- **DropZone**: File upload interface with visual feedback
- **IconPreview**: Multi-size icon display with selection
- **ValidationReport**: Real-time style guide compliance checking
- **ExportControls**: Download and copy functionality

### Advanced Prompt Engineering System
- **Semantic Intent Parser**: Filename-to-action/object detection
- **Adaptive Prompts**: Context-aware instructions for different image types
- **Modular Rulesets**: 7 JSON rule modules covering all design aspects
- **Quality Assurance**: Pre and post-generation validation checklists
- **2-Pass Validation**: Automatic error detection and correction system

### Style Guide Engine
- **Canvas**: 24x24dp with 20x20dp live area
- **Stroke**: 2dp width, black color, solid style
- **Geometry**: Regular shapes with 2dp corner radius
- **Decorations**: Limited sparkles and dots
- **Validation**: Comprehensive automated rule checking system

## Data Flow

1. **Image Upload**: User drags/drops image file
2. **File Processing**: Multer processes multipart form data
3. **AI Processing**: OpenAI Vision API analyzes image and generates SVG
4. **Validation**: Style guide rules validate generated icon
5. **Storage**: Icon conversion stored in database
6. **Response**: SVG, metadata, and validation results returned
7. **UI Update**: Preview, validation report, and export options displayed

## External Dependencies

### AI Services
- **OpenAI API**: GPT-4o model for image-to-icon conversion
- **Function Calling**: Structured JSON output for SVG generation

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection**: @neondatabase/serverless driver

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **React Hook Form**: Form validation
- **TanStack Query**: Data fetching and caching

### Development Tools
- **Vite**: Build tool with hot module replacement
- **ESBuild**: Fast JavaScript bundler
- **TypeScript**: Static type checking
- **Replit**: Development environment integration

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: ESBuild bundles server code to `dist/index.js`
3. **Assets**: Static files served from build directory

### Environment Configuration
- **Development**: Hot reload with Vite dev server
- **Production**: Express serves static files and API routes
- **Database**: Environment variable for DATABASE_URL
- **AI**: OpenAI API key configuration

### Hosting
- **Platform**: Replit for integrated development and deployment
- **Server**: Express.js with middleware for static file serving
- **Database**: Neon Database for PostgreSQL hosting
- **Storage**: In-memory storage fallback for development

### Security Considerations
- File upload limits (10MB max)
- Image type validation
- Error handling for AI service failures
- Environment variable protection
- CORS configuration for API access

The application follows a modern full-stack architecture with clear separation between frontend React components, backend API services, and database operations, all unified through TypeScript for type safety and developer experience.