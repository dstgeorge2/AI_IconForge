import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Download, Copy, Check, Loader2, Image, FileText, Layers, Sparkles, Target, Palette, Cpu, Square, ChevronDown, ChevronUp, Grid3x3, Zap, Paintbrush } from 'lucide-react';
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

interface CreativeVariant {
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
    creativeStyle: {
      isometric: boolean;
      handDrawn: boolean;
      decorativeElements: string[];
      personality: string;
    };
    windchillCompliance?: {
      score: number;
      valid: boolean;
      errors: string[];
      warnings: string[];
    };
  };
}

interface CreativeMultiVariantResponse {
  conversionId: number;
  originalImageName: string;
  variants: {
    'creative-one-to-one': CreativeVariant;
    'creative-ui-intent': CreativeVariant;
    'creative-material': CreativeVariant;
    'creative-carbon': CreativeVariant;
    'creative-filled': CreativeVariant;
  };
  processingTime: number;
  totalSize: string;
  model: string;
  styleGuide: string;
}

interface CreativeVariantDisplayProps {
  variant: CreativeVariant;
  variantType: string;
  fileName: string;
  revisionExpanded: {[key: string]: boolean};
  setRevisionExpanded: React.Dispatch<React.SetStateAction<{[key: string]: boolean}>>;
  selectedFile?: File | null;
}

const CreativeVariantDisplay: React.FC<CreativeVariantDisplayProps> = ({ 
  variant, 
  variantType, 
  fileName, 
  revisionExpanded, 
  setRevisionExpanded, 
  selectedFile 
}) => {
  const [copied, setCopied] = useState(false);
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
    a.download = `${fileName.split('.')[0]}_${variantType}_creative.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Creative Style Badge Component
  const CreativeStyleBadge = ({ style }: { style: any }) => (
    <div className="flex flex-wrap gap-1">
      {style.isometric && (
        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
          <Sparkles className="w-3 h-3 mr-1" />
          Isometric
        </Badge>
      )}
      {style.handDrawn && (
        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
          <Paintbrush className="w-3 h-3 mr-1" />
          Hand-drawn
        </Badge>
      )}
      {style.decorativeElements.length > 0 && (
        <Badge variant="outline" className="text-xs bg-pink-50 text-pink-700 border-pink-200">
          ✨ {style.decorativeElements.join(', ')}
        </Badge>
      )}
    </div>
  );

  // Windchill Compliance Badge
  const ComplianceBadge = ({ score, isValid }: { score: number; isValid: boolean }) => (
    <Badge 
      variant={isValid ? 'default' : 'destructive'}
      className="text-xs font-mono bg-gradient-to-r from-purple-500 to-pink-500 text-white"
    >
      <Zap className="w-3 h-3 mr-1" />
      Windchill {score}%
    </Badge>
  );

  const getVariantIcon = (type: string) => {
    switch (type) {
      case 'creative-one-to-one': return <Image className="w-4 h-4" />;
      case 'creative-ui-intent': return <Target className="w-4 h-4" />;
      case 'creative-material': return <Palette className="w-4 h-4" />;
      case 'creative-carbon': return <Cpu className="w-4 h-4" />;
      case 'creative-filled': return <Square className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getVariantLabel = (type: string) => {
    switch (type) {
      case 'creative-one-to-one': return 'Creative 1:1';
      case 'creative-ui-intent': return 'Creative Intent';
      case 'creative-material': return 'Creative Material';
      case 'creative-carbon': return 'Creative Carbon';
      case 'creative-filled': return 'Creative Filled';
      default: return 'Creative Unknown';
    }
  };

  const getVariantDescription = (type: string) => {
    switch (type) {
      case 'creative-one-to-one': return 'Hand-drawn recreation with isometric tilt';
      case 'creative-ui-intent': return 'Playful semantic interpretation';
      case 'creative-material': return 'Material Design with organic personality';
      case 'creative-carbon': return 'IBM Carbon with creative energy';
      case 'creative-filled': return 'Bold filled style with sparkles';
      default: return 'Creative style';
    }
  };

  return (
    <div key={`creative-${variantType}-${variant.id}-${variant.metadata?.revised ? 'revised' : 'original'}`} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getVariantIcon(variantType)}
          <h3 className="font-mono text-sm font-medium">{getVariantLabel(variantType)}</h3>
          <Badge variant="outline" className="text-xs font-mono bg-purple-50 text-purple-700">
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
      
      <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="p-4">
          {/* Multi-size preview */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-600">
              <span>Creative Style Preview:</span>
              <span className="text-gray-400">16dp • 20dp • 24dp • 32dp • 48dp</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-white border-2 border-purple-500 rounded shadow-sm">
              {[16, 20, 24, 32, 48].map(size => (
                <div key={size} className="flex flex-col items-center gap-1">
                  <div 
                    className="border border-purple-300 bg-white flex items-center justify-center shadow-sm"
                    style={{ width: size + 4, height: size + 4 }}
                  >
                    <div 
                      key={`creative-${variantType}-${variant.id}-${size}`}
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
          
          {/* Creative Style Information */}
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-100 to-pink-100 border rounded">
            <div className="text-xs font-mono text-purple-700 mb-2">Creative Style Features:</div>
            <CreativeStyleBadge style={variant.metadata.creativeStyle} />
            <div className="text-xs text-purple-600 mt-2">
              Personality: {variant.metadata.creativeStyle.personality}
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
              className="flex-1 font-mono border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy SVG'}
            </Button>
            
            <Button
              onClick={handleDownload}
              size="sm"
              variant="default"
              className="flex-1 font-mono bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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

export default function CreativeIconForge() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textDescription, setTextDescription] = useState('');
  const [isTextMode, setIsTextMode] = useState(false);
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [results, setResults] = useState<CreativeMultiVariantResponse | null>(null);
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
        toast({ title: 'Image selected for creative processing' });
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
        formData.append('engine', 'creative');
      } else if (data.image) {
        formData.append('image', data.image);
        formData.append('engine', 'creative');
      }
      
      if (data.prompt) {
        formData.append('prompt', data.prompt);
      }

      const response = await apiRequest('POST', '/api/generate-creative-multi-variant-icons', formData);
      return await response.json();
    },
    onSuccess: (data: CreativeMultiVariantResponse) => {
      setResults(data);
      toast({ 
        title: 'Creative generation complete!', 
        description: `Generated 5 creative variants in ${(data.processingTime / 1000).toFixed(1)}s` 
      });
    },
    onError: (error: any) => {
      console.error('Creative generation error:', error);
      toast({ 
        title: 'Creative generation failed', 
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold font-mono bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Creative Icon Forge
            </h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="font-mono text-xs"
                onClick={() => window.location.href = '/'}
              >
                ← Standard Windchill
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="font-mono text-xs"
                onClick={() => window.location.href = '/openai'}
              >
                OpenAI Version →
              </Button>
            </div>
          </div>
          <p className="text-lg text-gray-600 font-mono">
            Generate playful, hand-drawn isometric icons with creative personality and organic charm
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="font-mono bg-purple-50 text-purple-700">
              Powered by Claude 4.0 Sonnet • Creative Style Guide
            </Badge>
            <Badge variant="outline" className="font-mono bg-pink-50 text-pink-700">
              Isometric Tilt • Hand-drawn • Sparkles
            </Badge>
          </div>
        </div>

        {/* Input Section */}
        <Card className="border-2 border-purple-500 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="font-mono flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Creative Input Selection
            </CardTitle>
            <CardDescription className="font-mono">
              Upload an image or describe your icon to generate creative hand-drawn variations with playful personality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex items-center justify-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                <span className={`font-mono text-sm ${!isTextMode ? 'font-bold text-purple-600' : 'text-gray-600'}`}>
                  Image Mode
                </span>
              </div>
              <Switch
                checked={isTextMode}
                onCheckedChange={setIsTextMode}
                className="data-[state=checked]:bg-purple-600"
              />
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className={`font-mono text-sm ${isTextMode ? 'font-bold text-purple-600' : 'text-gray-600'}`}>
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
                      ? 'border-purple-400 bg-purple-50' 
                      : selectedFile
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                        <Upload className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                    {selectedFile ? (
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-green-700 font-mono">
                          ✓ {selectedFile.name}
                        </p>
                        <p className="text-sm text-gray-600 font-mono">
                          Ready for creative processing • {(selectedFile.size / 1024 / 1024).toFixed(2)}MB
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
                  Describe your creative icon
                </label>
                <textarea
                  value={textDescription}
                  onChange={(e) => setTextDescription(e.target.value)}
                  placeholder="E.g., Playful shopping cart with sparkles, Creative settings gear with organic curves, Hand-drawn user avatar with personality..."
                  className="w-full p-3 border-2 border-gray-300 rounded-lg font-mono text-sm min-h-24 resize-y focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                Creative enhancements (optional)
              </label>
              <textarea
                value={additionalPrompt}
                onChange={(e) => setAdditionalPrompt(e.target.value)}
                placeholder="Add more sparkles, make it more isometric, emphasize hand-drawn style, add organic curves..."
                className="w-full p-3 border-2 border-gray-300 rounded-lg font-mono text-sm min-h-16 resize-y focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={200}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending || (!selectedFile && !textDescription.trim())}
                className="flex-1 font-mono bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating creative icons...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate 5 Creative Variants
                  </>
                )}
              </Button>
              
              <Button
                onClick={clearAll}
                variant="outline"
                className="font-mono border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {results && (
          <div className="space-y-6">
            <Card className="border-2 border-purple-500 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="font-mono flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Creative Generation Results
                </CardTitle>
                <CardDescription className="font-mono flex items-center justify-between">
                  <span>5 creative variants generated using {results.model}</span>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="font-mono">
                      {(results.processingTime / 1000).toFixed(1)}s
                    </Badge>
                    <Badge variant="secondary" className="font-mono">
                      {results.totalSize} total
                    </Badge>
                    <Badge variant="outline" className="font-mono bg-purple-50 text-purple-700">
                      {results.styleGuide}
                    </Badge>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Variant Displays */}
            <Tabs defaultValue="creative-one-to-one" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-500">
                <TabsTrigger value="creative-one-to-one" className="font-mono data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  Creative 1:1
                </TabsTrigger>
                <TabsTrigger value="creative-ui-intent" className="font-mono data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  Creative Intent
                </TabsTrigger>
                <TabsTrigger value="creative-material" className="font-mono data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  Creative Material
                </TabsTrigger>
                <TabsTrigger value="creative-carbon" className="font-mono data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  Creative Carbon
                </TabsTrigger>
                <TabsTrigger value="creative-filled" className="font-mono data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  Creative Filled
                </TabsTrigger>
              </TabsList>

              {Object.entries(results.variants).map(([variantType, variant]) => (
                <TabsContent key={variantType} value={variantType} className="space-y-4">
                  <CreativeVariantDisplay
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