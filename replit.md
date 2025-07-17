# Icon Forge - AI-Powered Icon Generation Tool

## Overview

Icon Forge is a brutalist-styled web application that converts user-uploaded images into pixel-perfect SVG icons using AI. The application follows the Vectra Icon Style Guide to generate geometric, standardized icons with consistent styling and validation.

## User Preferences

Preferred communication style: Simple, everyday language.

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

### Simplified Icon Generation System
- **Direct Analysis**: Focused image-to-icon conversion using proven design patterns
- **Design Principles**: Based on Google Material and IBM Carbon methodologies
- **Quality Focus**: Emphasis on instant recognition and simplicity
- **Proven Patterns**: Built-in knowledge of effective icon metaphors
- **Fast Processing**: Streamlined approach for better performance

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

### Icon Generation Approach
- **Simplified Processing**: Direct image analysis without complex validation layers
- **Design System Integration**: Principles from Google Material and IBM Carbon
- **Universal Recognition**: Focus on globally understood icon metaphors
- **Quality Through Simplicity**: Emphasis on essential elements only

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