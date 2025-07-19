import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Download, Copy, Check, Loader2, Image, FileText, Layers, Blend, Target, Palette, Cpu, Square, ChevronDown, ChevronUp, Grid3x3, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface OpenAIVariant {
  id: number;
  svg: string;
  explanation: string;
  confidence: number;
  metadata: {
    approach: string;
    source: string;
    size: string;
    optimized: boolean;
    model: string;
    windchillCompliance?: {
      score: number;
      valid: boolean;
      errors: string[];
      warnings: string[];
    };
  };
}

interface OpenAIMultiVariantResponse {
  conversionId: number;
  originalImageName: string;
  variants: {
    'one-to-one': OpenAIVariant;
    'ui-intent': OpenAIVariant;
    'material': OpenAIVariant;
    'carbon': OpenAIVariant;
    'filled': OpenAIVariant;
  };
  processingTime: number;
  totalSize: string;
  model: string;
}

interface VariantDisplayProps {
  variant: OpenAIVariant;
  variantType: string;
  fileName: string;
  revisionExpanded: {[key: string]: boolean};
  setRevisionExpanded: React.Dispatch<React.SetStateAction<{[key: string]: boolean}>>;
  selectedFile?: File | null;
  revisionMutation?: any;
}

const OpenAIVariantDisplay: React.FC<VariantDisplayProps> = ({ variant, variantType, fileName, revisionExpanded, setRevisionExpanded, selectedFile, revisionMutation }) => {
  const [copied, setCopied] = useState(false);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      if (!variant || !variant.svg) {
        toast({ title: 'No SVG content to copy', variant: 'destructive' });
        return;
      }
      await navigator.clipboard.writeText(variant.svg);
      setCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  const handleDownload = () => {
    if (!variant || !variant.svg) {
      toast({ title: 'No SVG content to download', variant: 'destructive' });
      return;
    }
    const blob = new Blob([variant.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.split('.')[0]}_${variantType}_openai.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Windchill Compliance Badge Component
  const ComplianceBadge = ({ score, isValid }: { score: number; isValid: boolean }) => (
    <Badge 
      variant={isValid ? 'default' : 'destructive'}
      className="text-xs font-mono"
    >
      <Zap className="w-3 h-3 mr-1" />
      Windchill {score}%
    </Badge>
  );

  const getVariantIcon = (type: string) => {
    switch (type) {
      case 'one-to-one': return <Image className="w-4 h-4" />;
      case 'ui-intent': return <Target className="w-4 h-4" />;
      case 'material': return <Palette className="w-4 h-4" />;
      case 'carbon': return <Cpu className="w-4 h-4" />;
      case 'filled': return <Square className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  const getVariantLabel = (type: string) => {
    switch (type) {
      case 'one-to-one': return '1:1 Icon';
      case 'ui-intent': return 'UI Intent';
      case 'material': return 'Material';
      case 'carbon': return 'Carbon';
      case 'filled': return 'Filled';
      default: return 'Unknown';
    }
  };

  const getVariantDescription = (type: string) => {
    switch (type) {
      case 'one-to-one': return 'OpenAI vision reconstruction';
      case 'ui-intent': return 'GPT-4o semantic analysis';
      case 'material': return 'Material Design + OpenAI';
      case 'carbon': return 'IBM Carbon + OpenAI';
      case 'filled': return 'High contrast filled style';
      default: return 'OpenAI generated';
    }
  };

  return (
    <div key={`openai-${variantType}-${variant.id}-${variant.metadata?.revised ? 'revised' : 'original'}`} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getVariantIcon(variantType)}
          <h3 className="font-mono text-sm font-medium">{getVariantLabel(variantType)}</h3>
          <Badge variant="outline" className="text-xs font-mono">
            {variant.metadata.model}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs">
            {variant.confidence}% confidence
          </Badge>
          {variant.metadata?.windchillCompliance && (
            <ComplianceBadge 
              score={variant.metadata.windchillCompliance.score} 
              isValid={variant.metadata.windchillCompliance.valid}
            />
          )}
        </div>
      </div>
      
      <Progress value={variant.confidence} className="h-1" />
      
      <Card className="border-2 border-blue-500 bg-white">
        <CardContent className="p-4">
          {/* Multi-size preview */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-600">
              <span>OpenAI GPT-4o Preview:</span>
              <span className="text-gray-400">16dp • 20dp • 24dp • 32dp • 48dp</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-blue-50 border-2 border-blue-500 rounded">
              {[16, 20, 24, 32, 48].map(size => (
                <div key={size} className="flex flex-col items-center gap-1">
                  <div 
                    className="border border-blue-300 bg-white flex items-center justify-center"
                    style={{ width: size + 4, height: size + 4 }}
                  >
                    <div 
                      key={`openai-${variantType}-${variant.id}-${size}`}
                      style={{ 
                        width: size, 
                        height: size,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      dangerouslySetInnerHTML={{ 
                        __html: (() => {
                          if (!variant || !variant.svg) {
                            return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display: block;"><rect x="2" y="2" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="12" text-anchor="middle" font-size="8" fill="currentColor">Error</text></svg>`;
                          }
                          
                          const viewBoxMatch = variant.svg.match(/viewBox="([^"]+)"/);
                          const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';
                          
                          return variant.svg.replace(
                            /<svg[^>]*>/,
                            `<svg width="${size}" height="${size}" viewBox="${viewBox}" style="display: block;">`
                          );
                        })()
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono text-gray-500">{size}dp</span>
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-4 font-mono leading-relaxed">
            {variant.explanation}
          </p>
          
          {/* Windchill compliance details */}
          {variant.metadata?.windchillCompliance && (
            <div className="mb-4 p-3 bg-gray-50 border rounded">
              <div className="text-xs font-mono text-gray-600 mb-2">Windchill Compliance Report:</div>
              {variant.metadata.windchillCompliance.errors.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs font-mono text-red-600 mb-1">Errors:</div>
                  {variant.metadata.windchillCompliance.errors.map((error, idx) => (
                    <div key={idx} className="text-xs text-red-600 ml-2">• {error}</div>
                  ))}
                </div>
              )}
              {variant.metadata.windchillCompliance.warnings.length > 0 && (
                <div>
                  <div className="text-xs font-mono text-yellow-600 mb-1">Warnings:</div>
                  {variant.metadata.windchillCompliance.warnings.map((warning, idx) => (
                    <div key={idx} className="text-xs text-yellow-600 ml-2">• {warning}</div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              onClick={handleCopy}
              size="sm"
              variant="outline"
              className="flex-1 font-mono"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy SVG'}
            </Button>
            
            <Button
              onClick={handleDownload}
              size="sm"
              variant="default"
              className="flex-1 font-mono bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function OpenAIIconForge() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textDescription, setTextDescription] = useState('');
  const [isTextMode, setIsTextMode] = useState(false);
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [results, setResults] = useState<OpenAIMultiVariantResponse | null>(null);
  const [revisionExpanded, setRevisionExpanded] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        setIsTextMode(false);
        toast({ title: 'Image selected for OpenAI processing' });
      }
    },
    onDropRejected: (rejectedFiles) => {
      const rejection = rejectedFiles[0];
      if (rejection.file.size > 10 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Please select an image under 10MB', variant: 'destructive' });
      } else {
        toast({ title: 'Invalid file type', description: 'Please select an image file', variant: 'destructive' });
      }
    }
  });

  const generateMutation = useMutation({
    mutationFn: async (data: { image?: File; textDescription?: string; prompt?: string }) => {
      const formData = new FormData();
      
      if (data.textDescription) {
        formData.append('textDescription', data.textDescription);
        formData.append('engine', 'openai');
      } else if (data.image) {
        formData.append('image', data.image);
        formData.append('engine', 'openai');
      }
      
      if (data.prompt) {
        formData.append('prompt', data.prompt);
      }

      const response = await apiRequest('POST', '/api/generate-openai-multi-variant-icons', formData);
      return await response.json();
    },
    onSuccess: (data: OpenAIMultiVariantResponse) => {
      setResults(data);
      toast({ 
        title: 'OpenAI generation complete!', 
        description: `Generated 5 variants in ${(data.processingTime / 1000).toFixed(1)}s using ${data.model}` 
      });
    },
    onError: (error: any) => {
      console.error('OpenAI generation error:', error);
      toast({ 
        title: 'OpenAI generation failed', 
        description: error.message || 'Unknown error occurred',
        variant: 'destructive' 
      });
    },
  });

  const handleGenerate = () => {
    if (isTextMode) {
      if (!textDescription.trim()) {
        toast({ title: 'Please enter a description', variant: 'destructive' });
        return;
      }
      generateMutation.mutate({ 
        textDescription: textDescription.trim(), 
        prompt: additionalPrompt 
      });
    } else {
      if (!selectedFile) {
        toast({ title: 'Please select an image', variant: 'destructive' });
        return;
      }
      generateMutation.mutate({ 
        image: selectedFile, 
        prompt: additionalPrompt 
      });
    }
  };

  const clearAll = () => {
    setSelectedFile(null);
    setTextDescription('');
    setAdditionalPrompt('');
    setResults(null);
    setRevisionExpanded({});
    toast({ title: 'Cleared all data' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold font-mono bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              OpenAI Icon Forge
            </h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="font-mono text-xs"
                onClick={() => window.location.href = '/'}
              >
                ← Try Claude 4.0 Sonnet
              </Button>
            </div>
          </div>
          <p className="text-lg text-gray-600 font-mono">
            AI-Powered icon generation using OpenAI GPT-4o with Windchill compliance validation
          </p>
          <Badge variant="outline" className="font-mono">
            Powered by GPT-4o Vision • Enhanced for Enterprise
          </Badge>
        </div>

        {/* Input Section */}
        <Card className="border-2 border-blue-500 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="font-mono flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Input Selection
            </CardTitle>
            <CardDescription className="font-mono">
              Upload an image or describe your icon using OpenAI's advanced vision capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex items-center justify-center gap-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                <span className={`font-mono text-sm ${!isTextMode ? 'font-bold text-blue-600' : 'text-gray-600'}`}>
                  Image Mode
                </span>
              </div>
              <Switch
                checked={isTextMode}
                onCheckedChange={setIsTextMode}
                className="data-[state=checked]:bg-blue-600"
              />
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className={`font-mono text-sm ${isTextMode ? 'font-bold text-blue-600' : 'text-gray-600'}`}>
                  Text Mode
                </span>
              </div>
            </div>

            {/* Image Upload */}
            {!isTextMode && (
              <div className="space-y-4">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    isDragActive 
                      ? 'border-blue-400 bg-blue-50' 
                      : selectedFile
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <div className="p-4 bg-blue-100 rounded-full">
                        <Upload className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    {selectedFile ? (
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-green-700 font-mono">
                          ✓ {selectedFile.name}
                        </p>
                        <p className="text-sm text-gray-600 font-mono">
                          Ready for OpenAI GPT-4o processing • {(selectedFile.size / 1024 / 1024).toFixed(2)}MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-gray-700 font-mono">
                          {isDragActive ? 'Drop your image here' : 'Drag & drop an image, or click to select'}
                        </p>
                        <p className="text-sm text-gray-500 font-mono">
                          PNG, JPG, GIF, WebP, SVG up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Text Input */}
            {isTextMode && (
              <div className="space-y-2">
                <label className="block text-sm font-medium font-mono text-gray-700">
                  Describe your icon
                </label>
                <textarea
                  value={textDescription}
                  onChange={(e) => setTextDescription(e.target.value)}
                  placeholder="E.g., Shopping cart for e-commerce, Settings gear icon, User profile avatar..."
                  className="w-full p-3 border-2 border-gray-300 rounded-lg font-mono text-sm min-h-24 resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 font-mono text-right">
                  {textDescription.length}/500 characters
                </div>
              </div>
            )}

            {/* Additional Prompt */}
            <div className="space-y-2">
              <label className="block text-sm font-medium font-mono text-gray-700">
                Additional context (optional)
              </label>
              <textarea
                value={additionalPrompt}
                onChange={(e) => setAdditionalPrompt(e.target.value)}
                placeholder="Any specific requirements, style preferences, or context..."
                className="w-full p-3 border-2 border-gray-300 rounded-lg font-mono text-sm min-h-16 resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={200}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending || (!selectedFile && !textDescription.trim())}
                className="flex-1 font-mono bg-blue-600 hover:bg-blue-700 h-12"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating with OpenAI...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate 5 OpenAI Variants
                  </>
                )}
              </Button>
              
              <Button
                onClick={clearAll}
                variant="outline"
                className="font-mono border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {results && (
          <div className="space-y-6">
            <Card className="border-2 border-blue-500 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="font-mono flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  OpenAI Generation Results
                </CardTitle>
                <CardDescription className="font-mono flex items-center justify-between">
                  <span>5 variants generated using {results.model}</span>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="font-mono">
                      {(results.processingTime / 1000).toFixed(1)}s
                    </Badge>
                    <Badge variant="secondary" className="font-mono">
                      {results.totalSize} total
                    </Badge>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Variant Displays */}
            <Tabs defaultValue="one-to-one" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5 bg-blue-100 border-2 border-blue-500">
                <TabsTrigger value="one-to-one" className="font-mono data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  1:1 Icon
                </TabsTrigger>
                <TabsTrigger value="ui-intent" className="font-mono data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  UI Intent
                </TabsTrigger>
                <TabsTrigger value="material" className="font-mono data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Material
                </TabsTrigger>
                <TabsTrigger value="carbon" className="font-mono data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Carbon
                </TabsTrigger>
                <TabsTrigger value="filled" className="font-mono data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Filled
                </TabsTrigger>
              </TabsList>

              {Object.entries(results.variants).map(([variantType, variant]) => (
                <TabsContent key={variantType} value={variantType} className="space-y-4">
                  <OpenAIVariantDisplay
                    variant={variant}
                    variantType={variantType}
                    fileName={results.originalImageName}
                    revisionExpanded={revisionExpanded}
                    setRevisionExpanded={setRevisionExpanded}
                    selectedFile={selectedFile}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}