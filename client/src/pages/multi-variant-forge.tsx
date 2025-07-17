import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Download, Copy, Check, Loader2, Image, FileText, Layers, Blend } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
}

const VariantDisplay: React.FC<VariantDisplayProps> = ({ variant, variantType, fileName }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(variant.svg);
      setCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  const handleDownload = () => {
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

  const getVariantIcon = (type: string) => {
    switch (type) {
      case 'one-to-one': return <Image className="w-4 h-4" />;
      case 'filename-based': return <FileText className="w-4 h-4" />;
      case 'common-ui': return <Layers className="w-4 h-4" />;
      case 'blended': return <Blend className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  const getVariantLabel = (type: string) => {
    switch (type) {
      case 'one-to-one': return 'Image-Based';
      case 'filename-based': return 'File Name Based';
      case 'common-ui': return 'Common UI Match';
      case 'blended': return 'Blended Logic';
      default: return 'Unknown';
    }
  };

  const getVariantDescription = (type: string) => {
    switch (type) {
      case 'one-to-one': return 'Recreated from visual analysis';
      case 'filename-based': return 'Based on parsed file name';
      case 'common-ui': return 'Standard UI metaphor';
      case 'blended': return 'Smart fusion of all inputs';
      default: return 'Icon variant';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getVariantIcon(variantType)}
          <h3 className="font-mono text-sm font-medium">{getVariantLabel(variantType)}</h3>
        </div>
        <Badge variant="secondary" className="font-mono text-xs">
          {variant.confidence}% confidence
        </Badge>
      </div>
      
      <Progress value={variant.confidence} className="h-1" />
      
      <Card className="border-2 border-black bg-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-32 bg-gray-50 border-2 border-black mb-4">
            <div 
              className="w-12 h-12"
              dangerouslySetInnerHTML={{ __html: variant.svg }}
            />
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
  const [multiVariantResult, setMultiVariantResult] = useState<MultiVariantIconResponse | null>(null);
  const [activeTab, setActiveTab] = useState('one-to-one');
  const { toast } = useToast();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        setMultiVariantResult(null);
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

  const generateMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await apiRequest('POST', '/api/generate-multi-variant-icons', formData);
      
      return response.json();
    },
    onSuccess: (data: MultiVariantIconResponse) => {
      setMultiVariantResult(data);
      toast({
        title: 'Icons generated successfully!',
        description: `Generated 4 variants for ${data.originalImageName}`
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
    if (!selectedFile) return;
    generateMutation.mutate(selectedFile);
  };

  const handleDownloadAll = () => {
    if (!multiVariantResult) return;
    
    const activeVariants = ['one-to-one', 'common-ui'];
    
    activeVariants.forEach(type => {
      const variant = multiVariantResult.variants[type];
      const blob = new Blob([variant.svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${multiVariantResult.originalImageName.split('.')[0]}_${type}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
    
    toast({
      title: 'All icons downloaded!',
      description: 'Downloaded 2 SVG variants'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-mono font-bold text-black mb-2">
              Icon Forge
            </h1>
            <p className="text-lg text-gray-600 font-mono">
              Generate clean UI icons from uploaded images using intelligent analysis
            </p>
          </div>

          {/* Upload Section */}
          <Card className="border-2 border-black bg-white mb-8">
            <CardHeader>
              <CardTitle className="font-mono">Upload Image</CardTitle>
              <CardDescription className="font-mono">
                Upload an image to generate clean UI icons using intelligent analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed border-black p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'bg-blue-50' : 'bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                {selectedFile ? (
                  <div className="space-y-2">
                    <p className="font-mono text-sm font-medium">{selectedFile.name}</p>
                    <p className="font-mono text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-mono text-sm">
                      {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                    </p>
                    <p className="font-mono text-xs text-gray-500">
                      or click to select (PNG, JPG, GIF, WebP • Max 10MB)
                    </p>
                  </div>
                )}
              </div>
              
              {selectedFile && (
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
                      4 variants for {multiVariantResult.originalImageName}
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
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="one-to-one" className="font-mono text-sm">
                      <Image className="w-4 h-4 mr-2" />
                      Image-Based
                    </TabsTrigger>
                    <TabsTrigger value="common-ui" className="font-mono text-sm">
                      <Layers className="w-4 h-4 mr-2" />
                      Common UI
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="one-to-one">
                    <VariantDisplay
                      variant={multiVariantResult.variants['one-to-one']}
                      variantType="one-to-one"
                      fileName={multiVariantResult.originalImageName}
                    />
                  </TabsContent>

                  <TabsContent value="common-ui">
                    <VariantDisplay
                      variant={multiVariantResult.variants['common-ui']}
                      variantType="common-ui"
                      fileName={multiVariantResult.originalImageName}
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