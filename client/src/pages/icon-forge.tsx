import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import DropZone from '@/components/DropZone';
import IconPreview from '@/components/IconPreview';
import ValidationReport from '@/components/ValidationReport';
import ExportControls from '@/components/ExportControls';
import { validateIcon } from '@/lib/iconValidation';
import { ValidationRule } from '@/lib/styleGuide';

interface ConversionResult {
  id: number;
  svg: string;
  metadata: any;
  validationResults: ValidationRule[];
}

export default function IconForge() {
  const [generatedIcon, setGeneratedIcon] = useState<ConversionResult | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationRule[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const { toast } = useToast();

  const convertMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await apiRequest('POST', '/api/convert-icon', formData);
      return response.json();
    },
    onSuccess: (data: ConversionResult) => {
      setGeneratedIcon(data);
      setValidationResults(data.validationResults);
      setConversionError(null);
      
      const isPlaceholder = data.metadata.primaryShape.includes('fallback');
      toast({ 
        title: isPlaceholder ? "Placeholder icon generated" : "Icon generated successfully",
        description: isPlaceholder 
          ? "Using placeholder icon - add Anthropic API key for real AI conversion"
          : `Generated ${data.metadata.primaryShape} icon from ${data.metadata.strokeWidth}dp stroke`
      });
    },
    onError: (error: Error) => {
      setConversionError(error.message);
      setGeneratedIcon(null);
      setValidationResults([]);
      toast({ 
        title: "Conversion failed", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({ 
        title: "File too large", 
        description: "File size must be less than 10MB",
        variant: "destructive"
      });
      return;
    }
    
    // Create preview of uploaded image
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Clear previous error state
    setConversionError(null);
    
    convertMutation.mutate(file);
  };

  const UploadedImagePreview = () => (
    <div className="brutal-container">
      <div className="brutal-header">
        <h2 className="font-bold text-sm uppercase">Uploaded Image</h2>
      </div>
      <div className="p-4">
        {uploadedImage ? (
          <div className="border-2 border-black bg-gray-50 h-40 flex items-center justify-center">
            <img 
              src={uploadedImage} 
              alt="Uploaded for conversion" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-400 bg-gray-50 h-40 flex items-center justify-center">
            <span className="text-xs text-gray-400">NO IMAGE UPLOADED</span>
          </div>
        )}
      </div>
    </div>
  );

  const ProcessingStatus = () => (
    <div className="brutal-container">
      <div className="brutal-header">
        <h2 className="font-bold text-sm uppercase">02. Processing</h2>
      </div>
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 border-2 border-black bg-black animate-pulse"></div>
          <span className="text-sm font-bold">CONVERTING TO ICON...</span>
        </div>
        <div className="mt-3 text-xs space-y-1">
          <div>→ ANALYZING IMAGE STRUCTURE</div>
          <div>→ EXTRACTING GEOMETRIC PRIMITIVES</div>
          <div>→ APPLYING VECTRA STYLE GUIDE</div>
          <div>→ GENERATING SVG OUTPUT</div>
        </div>
      </div>
    </div>
  );

  const ErrorState = () => (
    <div className="brutal-container">
      <div className="brutal-header bg-red-600">
        <h2 className="font-bold text-sm uppercase text-white">⚠ Conversion Failed</h2>
      </div>
      <div className="p-4">
        <div className="text-sm font-bold text-red-600 mb-3">
          AI CONVERSION ERROR
        </div>
        <div className="text-xs text-red-700 bg-red-50 p-3 border border-red-300 mb-3">
          {conversionError}
        </div>
        <div className="text-xs space-y-1">
          <div>• Check your Anthropic API key</div>
          <div>• Ensure image is valid and not corrupted</div>
          <div>• Try a different image format</div>
          <div>• Check network connection</div>
        </div>
      </div>
    </div>
  );

  const TechnicalSpecs = () => (
    <div className="brutal-container">
      <div className="brutal-header">
        <h2 className="font-bold text-sm uppercase">Vectra Style Guide Specs</h2>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-2">
            <h3 className="font-bold uppercase">Geometry</h3>
            <ul className="space-y-1">
              <li>• CANVAS: 24x24dp</li>
              <li>• LIVE AREA: 20x20dp</li>
              <li>• STROKE: 2dp BLACK</li>
              <li>• CORNERS: 2dp RADIUS</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold uppercase">Rules</h3>
            <ul className="space-y-1">
              <li>• MAX 3 SPARKLES</li>
              <li>• MAX 5 DOTS</li>
              <li>• NO GRADIENTS</li>
              <li>• FLAT PERSPECTIVE</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold uppercase">Output</h3>
            <ul className="space-y-1">
              <li>• SEMANTIC SVG</li>
              <li>• REACT COMPONENT</li>
              <li>• VALIDATION LOG</li>
              <li>• METADATA JSON</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const SvgOutput = () => (
    <div className="brutal-container">
      <div className="brutal-header">
        <h2 className="font-bold text-sm uppercase">SVG Output</h2>
      </div>
      <div className="p-4">
        <textarea
          value={generatedIcon?.svg || ''}
          readOnly
          className="w-full h-32 border border-black p-2 text-xs font-mono resize-none bg-gray-50"
          placeholder="SVG code will appear here after conversion..."
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-2 border-black bg-white p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-black uppercase tracking-wider">ICON FORGE</h1>
          <p className="text-sm mt-1 font-bold">DROP IMAGE. GET PIXEL-PERFECT ICON.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          {/* Left Column: Upload & Controls */}
          <div className="space-y-6">
            <DropZone 
              onFileSelect={handleFileSelect}
              isProcessing={convertMutation.isPending}
            />
            
            {convertMutation.isPending && <ProcessingStatus />}
            {conversionError && <ErrorState />}
            
            <ExportControls 
              svg={generatedIcon?.svg || null}
              disabled={convertMutation.isPending}
            />
          </div>

          {/* Right Column: Preview & Output */}
          <div className="space-y-6">
            <UploadedImagePreview />
            
            <IconPreview 
              svg={generatedIcon?.svg || null}
              metadata={generatedIcon?.metadata}
            />
            
            <ValidationReport validationResults={validationResults} />
            
            <SvgOutput />
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="mt-8">
          <TechnicalSpecs />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black bg-white p-4 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-xs font-bold uppercase">
            ICON FORGE v1.0 • AI-POWERED ICON GENERATION
          </div>
          <div className="text-xs mt-2 md:mt-0">
            POWERED BY CLAUDE-4 VISION • VECTRA STYLE GUIDE
          </div>
        </div>
      </footer>
    </div>
  );
}
