import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Download, Copy, Check, Loader2, Image, FileText, Layers, Blend, Target, Palette, Cpu, Square, ChevronDown, ChevronUp, Grid3x3 } from 'lucide-react';
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
import { MultiVariantIconResponse } from '@shared/schema';

interface VariantDisplayProps {
  variant: {
    id: number;
    svg: string;
    explanation: string;
    confidence: number;
    metadata: any;
  };
  variantType: string;
  fileName: string;
  revisionExpanded: {[key: string]: boolean};
  setRevisionExpanded: React.Dispatch<React.SetStateAction<{[key: string]: boolean}>>;
  selectedFile?: File | null;
  revisionMutation?: any;
}

const VariantDisplay: React.FC<VariantDisplayProps> = ({ variant, variantType, fileName, revisionExpanded, setRevisionExpanded, selectedFile, revisionMutation }) => {
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
    a.download = `${fileName.split('.')[0]}_${variantType}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Windchill Compliance Badge Component
  const ComplianceBadge = ({ score, isValid }: { score: number; isValid: boolean }) => (
    <div className="flex items-center gap-2 mb-2">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
        <span className="text-xs font-mono text-gray-600">Windchill Compliance</span>
      </div>
      <Badge 
        variant={isValid ? 'default' : 'destructive'}
        className="text-xs font-mono"
      >
        {score}%
      </Badge>
    </div>
  );

  // Reference file dropzone
  const { getRootProps: getReferenceProps, getInputProps: getReferenceInputProps, isDragActive: isReferenceDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
    },
    maxSize: 5 * 1024 * 1024, // 5MB limit for reference
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setReferenceFile(acceptedFiles[0]);
        toast({
          title: 'Reference icon attached',
          description: `${acceptedFiles[0].name} ready for comparison`
        });
      }
    },
    onDropRejected: (rejectedFiles) => {
      toast({
        title: 'File rejected',
        description: rejectedFiles[0]?.errors[0]?.message || 'Invalid file type or size',
        variant: 'destructive'
      });
    }
  });



  const handleRevision = () => {
    if (!customPrompt.trim() && !referenceFile) {
      toast({
        title: 'No changes specified',
        description: 'Please provide a custom prompt or reference icon',
        variant: 'destructive'
      });
      return;
    }
    
    if (!selectedFile) {
      toast({
        title: 'Original image required',
        description: 'The original image is needed for revision',
        variant: 'destructive'
      });
      return;
    }
    
    if (revisionMutation) {
      revisionMutation.mutate({
        originalImage: selectedFile,
        referenceIcon: referenceFile,
        customPrompt: customPrompt,
        variantType: variantType,
        originalVariant: variant
      });
    }
  };

  const getVariantIcon = (type: string) => {
    switch (type) {
      case 'one-to-one': return <Image className="w-4 h-4" />;
      case 'ui-intent': return <Target className="w-4 h-4" />;
      case 'material': return <Palette className="w-4 h-4" />;
      case 'carbon': return <Cpu className="w-4 h-4" />;
      case 'pictogram': return <Grid3x3 className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  const getVariantLabel = (type: string) => {
    switch (type) {
      case 'one-to-one': return '1:1 Icon';
      case 'ui-intent': return 'UI Intent';
      case 'material': return 'Material';
      case 'carbon': return 'Carbon';
      case 'pictogram': return 'Pictogram';
      default: return 'Unknown';
    }
  };

  const getVariantDescription = (type: string) => {
    switch (type) {
      case 'one-to-one': return 'Based on image vision';
      case 'ui-intent': return 'Based on image and name';
      case 'material': return 'Google Material + Image';
      case 'carbon': return 'IBM Carbon + Image';
      case 'filled': return 'Solid filled style';
      default: return 'Icon variant';
    }
  };

  return (
    <div key={`${variantType}-${variant.id}-${variant.metadata?.revised ? 'revised' : 'original'}`} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getVariantIcon(variantType)}
          <h3 className="font-mono text-sm font-medium">{getVariantLabel(variantType)}</h3>
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
      
      <Card className="border-2 border-black bg-white">
        <CardContent className="p-4">
          {/* Multi-size preview in horizontal row */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-600">
              <span>Preview at standard sizes:</span>
              <span className="text-gray-400">16dp • 20dp • 24dp • 32dp • 48dp</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 border-2 border-black rounded">
              {[16, 20, 24, 32, 48].map(size => (
                <div key={size} className="flex flex-col items-center gap-1">
                  <div 
                    className="border border-gray-300 bg-white flex items-center justify-center"
                    style={{ width: size + 4, height: size + 4 }}
                  >
                    <div 
                      key={`${variantType}-${variant.id}-${size}`}
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
                          
                          // Extract the original viewBox from the SVG
                          const viewBoxMatch = variant.svg.match(/viewBox="([^"]+)"/);
                          const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';
                          
                          // Replace the opening SVG tag with proper scaling
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
              className="flex-1 font-mono"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Revision Interface */}
      <div className="border-2 border-black bg-yellow-50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-mono text-sm font-medium">Revision & Refinement</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRevisionExpanded(prev => ({ ...prev, [variantType]: !prev[variantType] }))}
            className="p-1"
          >
            {revisionExpanded[variantType] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
        
        {revisionExpanded[variantType] && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-mono font-medium">Attach Reference Icon</label>
                <div
                  {...getReferenceProps()}
                  className={`border-2 border-dashed rounded p-3 text-center text-sm cursor-pointer transition-colors ${
                    isReferenceDragActive 
                      ? 'border-blue-400 bg-blue-50' 
                      : referenceFile
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  <input {...getReferenceInputProps()} />
                  {referenceFile ? (
                    <div className="space-y-1">
                      <Check className="w-4 h-4 mx-auto text-green-600" />
                      <p className="text-green-700 font-medium">{referenceFile.name}</p>
                      <p className="text-xs text-green-600">
                        {(referenceFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-4 h-4 mx-auto" />
                      <p>{isReferenceDragActive ? 'Drop reference here' : 'Drop reference icon here'}</p>
                      <p className="text-xs">or click to select</p>
                    </div>
                  )}
                </div>
                {referenceFile && (
                  <Button
                    onClick={() => setReferenceFile(null)}
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                  >
                    Remove Reference
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-mono font-medium">Edit Prompt</label>
                <textarea 
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe how you'd like to refine this icon..."
                  className="w-full p-2 border border-gray-300 rounded text-sm font-mono resize-none"
                  rows={3}
                />
                <div className="text-xs text-gray-500 font-mono">
                  {customPrompt.length}/200 characters
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleRevision}
              className="w-full font-mono" 
              variant="default"
              disabled={(!customPrompt.trim() && !referenceFile) || (revisionMutation && revisionMutation.isPending)}
            >
              {revisionMutation && revisionMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Revising...
                </>
              ) : (
                'Revise & Regenerate'
              )}
            </Button>
          </div>
        )}
      </div>
      
      <details className="text-xs">
        <summary className="cursor-pointer font-mono text-gray-500 hover:text-gray-700">
          Technical Details
        </summary>
        <pre className="mt-2 p-2 bg-gray-50 border font-mono text-xs overflow-x-auto">
          {JSON.stringify(variant.metadata, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default function MultiVariantForge() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [promptEnabled, setPromptEnabled] = useState(false);
  const [textDescription, setTextDescription] = useState('');
  const [multiVariantResult, setMultiVariantResult] = useState<MultiVariantIconResponse | null>(null);
  const [activeTab, setActiveTab] = useState('one-to-one');
  const [revisionExpanded, setRevisionExpanded] = useState<{[key: string]: boolean}>({});
  const [selectedSizes, setSelectedSizes] = useState<number[]>([16, 20, 24, 32, 48]);
  const { toast } = useToast();

  // Revision mutation for regenerating icons with user input
  const revisionMutation = useMutation({
    mutationFn: async ({ originalImage, referenceIcon, customPrompt, variantType, originalVariant }: {
      originalImage: File;
      referenceIcon: File | null;
      customPrompt: string;
      variantType: string;
      originalVariant: any;
    }) => {
      const formData = new FormData();
      formData.append('originalImage', originalImage);
      if (referenceIcon) {
        formData.append('referenceIcon', referenceIcon);
      }
      formData.append('customPrompt', customPrompt);
      formData.append('variantType', variantType);
      formData.append('originalVariant', JSON.stringify(originalVariant));
      
      const response = await apiRequest('POST', '/api/revise-icon', formData);
      return response.json();
    },
    onSuccess: (data, variables) => {
      console.log('Revision success:', data, variables);
      // Update the specific variant in the results
      if (multiVariantResult) {
        const updatedResult = {
          ...multiVariantResult,
          variants: {
            ...multiVariantResult.variants,
            [variables.variantType]: {
              id: data.id,
              svg: data.svg,
              explanation: data.explanation,
              confidence: data.confidence,
              metadata: {
                ...data.metadata,
                revised: true,
                originalVariant: variables.originalVariant
              }
            }
          }
        };
        console.log('Updated result:', updatedResult);
        setMultiVariantResult(updatedResult);
      }
      
      // Reset revision interface
      setRevisionExpanded(prev => ({ ...prev, [variables.variantType]: false }));
      
      toast({
        title: 'Icon revised successfully!',
        description: 'Your feedback has been applied to generate an improved icon'
      });
    },
    onError: (error) => {
      toast({
        title: 'Revision failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        setMultiVariantResult(null);
        
        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    onDropRejected: (rejectedFiles) => {
      toast({
        title: 'File rejected',
        description: rejectedFiles[0]?.errors[0]?.message || 'Invalid file type or size',
        variant: 'destructive'
      });
    }
  });

  // Handle paste functionality
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          setSelectedFile(file);
          setMultiVariantResult(null);
          
          // Create preview URL
          const reader = new FileReader();
          reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
          };
          reader.readAsDataURL(file);
          
          toast({
            title: 'Image pasted!',
            description: `Pasted ${file.name || 'image'} successfully`
          });
        }
        break;
      }
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setMultiVariantResult(null);
  };

  const generateMutation = useMutation({
    mutationFn: async (input: File | string) => {
      const formData = new FormData();
      
      if (typeof input === 'string') {
        // Text description mode
        formData.append('textDescription', input);
      } else {
        // Image file mode
        formData.append('image', input);
        // Add prompt if enabled and has content
        if (promptEnabled && textDescription.trim()) {
          formData.append('prompt', textDescription);
        }
      }
      
      const response = await apiRequest('POST', '/api/generate-multi-variant-icons', formData);
      
      return response.json();
    },
    onSuccess: (data: MultiVariantIconResponse) => {
      setMultiVariantResult(data);
      toast({
        title: 'Icons generated successfully!',
        description: `Generated 5 variants for ${data.originalImageName}`
      });
    },
    onError: (error) => {
      toast({
        title: 'Generation failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleGenerate = () => {
    if (selectedFile) {
      // Image mode (with optional prompt)
      generateMutation.mutate(selectedFile);
    } else if (promptEnabled && textDescription.trim()) {
      // Text-only mode
      generateMutation.mutate(textDescription);
    }
  };

  const handleDownloadAll = () => {
    if (!multiVariantResult) return;
    
    const activeVariants = ['one-to-one', 'ui-intent', 'material', 'carbon', 'filled'];
    
    activeVariants.forEach(type => {
      const variant = multiVariantResult.variants[type];
      if (variant && variant.svg) {
        const blob = new Blob([variant.svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${multiVariantResult.originalImageName.split('.')[0]}_${type}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
    
    toast({
      title: 'All icons downloaded!',
      description: 'Downloaded SVG variants'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-2">
              <h1 className="text-3xl font-mono font-bold text-black">
                Claude Icon Forge
              </h1>
              <div className="flex gap-2">
                <Badge variant="default" className="font-mono text-xs bg-black">
                  Claude 4.0 Sonnet
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="font-mono text-xs"
                  onClick={() => window.location.href = '/openai'}
                >
                  Try OpenAI GPT-4o →
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="font-mono text-xs bg-purple-50 text-purple-600 hover:bg-purple-100"
                  onClick={() => window.location.href = '/creative'}
                >
                  ✨ Creative Style
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="font-mono text-xs bg-blue-50 text-blue-600 hover:bg-blue-100"
                  onClick={() => window.location.href = '/prompt-builder'}
                >
                  🧠 Prompt Builder
                </Button>
              </div>
            </div>
            <p className="text-lg text-gray-600 font-mono">
              Generate clean UI icons from uploaded images using Claude's intelligent analysis
            </p>
          </div>

          {/* Upload Section */}
          <Card className="border-2 border-black bg-white mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-mono">
                    Icon Generator
                  </CardTitle>
                  <CardDescription className="font-mono">
                    Upload an image to generate clean UI icons using intelligent analysis.
                    {promptEnabled && ' Add a text prompt for enhanced generation.'}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-mono">Prompt</label>
                  <Switch
                    checked={promptEnabled}
                    onCheckedChange={(checked) => {
                      setPromptEnabled(checked);
                      if (!checked) {
                        setTextDescription('');
                      }
                    }}
                  />
                  <label className="text-sm font-mono text-gray-500">
                    {promptEnabled ? 'On' : 'Off'}
                  </label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Image Upload Section */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed border-black p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                  onPaste={handlePaste}
                  tabIndex={0}
                >
                  <input {...getInputProps()} />
                  {imagePreview ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-48 max-h-48 object-contain border border-gray-300 rounded"
                        />
                        <Button
                          onClick={handleRemoveImage}
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                        >
                          ×
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <p className="font-mono text-sm font-medium">{selectedFile?.name}</p>
                        <p className="font-mono text-xs text-gray-500">
                          {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p className="font-mono text-xs text-gray-400">
                          Drag new image or paste to replace
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="font-mono text-sm">
                        {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                      </p>
                      <p className="font-mono text-xs text-gray-500">
                        or click to select • Paste with Ctrl+V
                      </p>
                      <p className="font-mono text-xs text-gray-400">
                        PNG, JPG, GIF, WebP • Max 10MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Prompt Section - Only shown when toggle is on */}
                {promptEnabled && (
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-mono text-sm font-medium mb-2">Additional Prompt</h3>
                      <textarea
                        value={textDescription}
                        onChange={(e) => setTextDescription(e.target.value)}
                        placeholder={selectedFile 
                          ? "Add context or specific requirements for the icon generation... (e.g., 'Make it more modern', 'Focus on the editing aspect', 'Use minimal style')"
                          : "Describe the icon you want to create... (e.g., 'A pencil for editing content', 'Shopping cart for e-commerce', 'Lock icon for security')"
                        }
                        className="w-full p-4 border-2 border-black rounded text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        maxLength={500}
                      />
                      <div className="flex justify-between items-center text-xs text-gray-500 font-mono mt-2">
                        <span>
                          {selectedFile 
                            ? 'Enhance image analysis with additional context' 
                            : 'Be specific about the icon\'s purpose and context'
                          }
                        </span>
                        <span>{textDescription.length}/500 characters</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {(selectedFile || (promptEnabled && textDescription.trim())) && (
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending}
                    className="font-mono"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating icons...
                      </>
                    ) : (
                      'Generate Icons'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          {multiVariantResult && (
            <Card className="border-2 border-black bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-mono">Generated Icons</CardTitle>
                    <CardDescription className="font-mono">
                      5 variants for {multiVariantResult.originalImageName}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleDownloadAll}
                    variant="outline"
                    className="font-mono"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-5 mb-6">
                    <TabsTrigger value="one-to-one" className="font-mono text-xs">
                      <Image className="w-4 h-4 mr-1" />
                      1:1 Icon
                    </TabsTrigger>
                    <TabsTrigger value="ui-intent" className="font-mono text-xs">
                      <Target className="w-4 h-4 mr-1" />
                      UI Intent
                    </TabsTrigger>
                    <TabsTrigger value="material" className="font-mono text-xs">
                      <Palette className="w-4 h-4 mr-1" />
                      Material
                    </TabsTrigger>
                    <TabsTrigger value="carbon" className="font-mono text-xs">
                      <Cpu className="w-4 h-4 mr-1" />
                      Carbon
                    </TabsTrigger>
                    <TabsTrigger value="filled" className="font-mono text-xs">
                      <Square className="w-4 h-4 mr-1 fill-current" />
                      Filled
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="one-to-one">
                    <VariantDisplay
                      variant={multiVariantResult.variants['one-to-one']}
                      variantType="one-to-one"
                      fileName={multiVariantResult.originalImageName}
                      revisionExpanded={revisionExpanded}
                      setRevisionExpanded={setRevisionExpanded}
                      selectedFile={selectedFile}
                      revisionMutation={revisionMutation}
                    />
                  </TabsContent>

                  <TabsContent value="ui-intent">
                    <VariantDisplay
                      variant={multiVariantResult.variants['ui-intent']}
                      variantType="ui-intent"
                      fileName={multiVariantResult.originalImageName}
                      revisionExpanded={revisionExpanded}
                      setRevisionExpanded={setRevisionExpanded}
                      selectedFile={selectedFile}
                      revisionMutation={revisionMutation}
                    />
                  </TabsContent>

                  <TabsContent value="material">
                    <VariantDisplay
                      variant={multiVariantResult.variants['material']}
                      variantType="material"
                      fileName={multiVariantResult.originalImageName}
                      revisionExpanded={revisionExpanded}
                      setRevisionExpanded={setRevisionExpanded}
                      selectedFile={selectedFile}
                      revisionMutation={revisionMutation}
                    />
                  </TabsContent>

                  <TabsContent value="carbon">
                    <VariantDisplay
                      variant={multiVariantResult.variants['carbon']}
                      variantType="carbon"
                      fileName={multiVariantResult.originalImageName}
                      revisionExpanded={revisionExpanded}
                      setRevisionExpanded={setRevisionExpanded}
                      selectedFile={selectedFile}
                      revisionMutation={revisionMutation}
                    />
                  </TabsContent>

                  <TabsContent value="filled">
                    <VariantDisplay
                      variant={multiVariantResult.variants['filled']}
                      variantType="filled"
                      fileName={multiVariantResult.originalImageName}
                      revisionExpanded={revisionExpanded}
                      setRevisionExpanded={setRevisionExpanded}
                      selectedFile={selectedFile}
                      revisionMutation={revisionMutation}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}