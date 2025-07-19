import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Copy, Wand2, Settings2, Download, Sparkles, Code, Eye } from 'lucide-react';

interface StylePreset {
  id: string;
  name: string;
  style: {
    strokeWeight: string;
    fill: string;
    cornerStyle: string;
    perspective: string;
    gridAlignment: string;
    shading: string;
    decorativeElements: string;
  };
  description: string;
}

interface PromptVariants {
  standard: string;
  detailed: string;
  creative: string;
  minimal: string;
}

export default function PromptBuilder() {
  const { toast } = useToast();
  
  // Form state
  const [config, setConfig] = useState({
    name: 'download',
    description: 'Arrow pointing down into a horizontal base',
    style: {
      strokeWeight: '2dp',
      fill: 'outline',
      cornerStyle: 'rounded',
      perspective: 'flat',
      gridAlignment: 'pixel-perfect',
      shading: 'none',
      decorativeElements: 'none'
    },
    dimensions: {
      canvasSize: 24,
      padding: 2,
      liveArea: 20
    },
    doNotInclude: ['text', 'labels', 'background'],
    output: {
      format: 'SVG',
      background: 'transparent',
      colorMode: 'monochrome'
    },
    targetUse: 'stock icon for interface'
  });

  const [selectedPreset, setSelectedPreset] = useState('material-design');
  const [generatedPrompts, setGeneratedPrompts] = useState<{
    standard?: string;
    creative?: string;
    variants?: PromptVariants;
  }>({});

  // Fetch presets
  const { data: presetsData } = useQuery({
    queryKey: ['/api/presets'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/presets');
      return await response.json();
    }
  });

  // Parse input mutation
  const parseInputMutation = useMutation({
    mutationFn: async (data: { input: string; preset: string }) => {
      const response = await apiRequest('POST', '/api/parse-input', data);
      return await response.json();
    },
    onSuccess: (data) => {
      setConfig(data.parsedConfig);
      toast({ title: 'Input parsed successfully!' });
    }
  });

  // Generate standard prompt
  const generatePromptMutation = useMutation({
    mutationFn: async (configData: any) => {
      const response = await apiRequest('POST', '/api/generate-prompt', configData);
      return await response.json();
    },
    onSuccess: (data) => {
      setGeneratedPrompts(prev => ({ ...prev, standard: data.prompt }));
      toast({ title: 'Standard prompt generated!' });
    }
  });

  // Generate creative prompt
  const generateCreativePromptMutation = useMutation({
    mutationFn: async (configData: any) => {
      const response = await apiRequest('POST', '/api/generate-creative-prompt', configData);
      return await response.json();
    },
    onSuccess: (data) => {
      setGeneratedPrompts(prev => ({ ...prev, creative: data.prompt }));
      toast({ title: 'Creative prompt generated!' });
    }
  });

  // Generate variants
  const generateVariantsMutation = useMutation({
    mutationFn: async (configData: any) => {
      const response = await apiRequest('POST', '/api/generate-variants', configData);
      return await response.json();
    },
    onSuccess: (data) => {
      setGeneratedPrompts(prev => ({ ...prev, variants: data.variants }));
      toast({ title: 'All prompt variants generated!' });
    }
  });

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = presetsData?.presets?.find((p: StylePreset) => p.id === presetId);
    if (preset) {
      setConfig(prev => ({ ...prev, style: preset.style }));
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied to clipboard!` });
  };

  const handleQuickParse = () => {
    const input = `${config.name} ${config.description}`;
    parseInputMutation.mutate({ input, preset: selectedPreset });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
              <Wand2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold font-mono bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Icon Prompt Builder
            </h1>
          </div>
          <p className="text-lg text-gray-600 font-mono">
            Generate structured prompts for ChatGPT and other AI models using configuration-based approach
          </p>
          <div className="flex gap-2 justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = '/'}
              className="font-mono"
            >
              ← Back to Icon Forge
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <Card className="border-2 border-blue-500">
              <CardHeader>
                <CardTitle className="font-mono flex items-center gap-2">
                  <Settings2 className="w-5 h-5" />
                  Icon Configuration
                </CardTitle>
                <CardDescription className="font-mono">
                  Define your icon specifications using structured parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-mono">Icon Name</Label>
                      <Input
                        value={config.name}
                        onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="download, settings, user..."
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-mono">Target Use</Label>
                      <Select
                        value={config.targetUse}
                        onValueChange={(value) => setConfig(prev => ({ ...prev, targetUse: value }))}
                      >
                        <SelectTrigger className="font-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stock icon for interface">Interface Icon</SelectItem>
                          <SelectItem value="logo design">Logo Design</SelectItem>
                          <SelectItem value="mobile app icon">Mobile App</SelectItem>
                          <SelectItem value="web application icon">Web App</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-mono">Description</Label>
                    <Textarea
                      value={config.description}
                      onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the visual representation..."
                      className="font-mono min-h-20"
                    />
                  </div>
                </div>

                <Separator />

                {/* Style Preset */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-mono">Style Preset</Label>
                    <Button
                      onClick={handleQuickParse}
                      size="sm"
                      variant="outline"
                      className="font-mono"
                      disabled={parseInputMutation.isPending}
                    >
                      <Wand2 className="w-3 h-3 mr-1" />
                      Auto-parse
                    </Button>
                  </div>
                  <Select value={selectedPreset} onValueChange={handlePresetChange}>
                    <SelectTrigger className="font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {presetsData?.presets?.map((preset: StylePreset) => (
                        <SelectItem key={preset.id} value={preset.id}>
                          {preset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {presetsData?.presets?.find((p: StylePreset) => p.id === selectedPreset) && (
                    <p className="text-xs text-gray-600 font-mono">
                      {presetsData.presets.find((p: StylePreset) => p.id === selectedPreset).description}
                    </p>
                  )}
                </div>

                {/* Style Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-mono">Stroke Weight</Label>
                    <Select
                      value={config.style.strokeWeight}
                      onValueChange={(value) => setConfig(prev => ({
                        ...prev,
                        style: { ...prev.style, strokeWeight: value }
                      }))}
                    >
                      <SelectTrigger className="font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="thin">Thin</SelectItem>
                        <SelectItem value="2dp">2dp (Standard)</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="variable">Variable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-mono">Fill Style</Label>
                    <Select
                      value={config.style.fill}
                      onValueChange={(value) => setConfig(prev => ({
                        ...prev,
                        style: { ...prev.style, fill: value }
                      }))}
                    >
                      <SelectTrigger className="font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="outline">Outline</SelectItem>
                        <SelectItem value="filled">Filled</SelectItem>
                        <SelectItem value="duotone">Duotone</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Canvas Dimensions */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="font-mono">Canvas Size</Label>
                    <Input
                      type="number"
                      value={config.dimensions.canvasSize}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        dimensions: { ...prev.dimensions, canvasSize: parseInt(e.target.value) }
                      }))}
                      className="font-mono"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-mono">Padding</Label>
                    <Input
                      type="number"
                      value={config.dimensions.padding}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        dimensions: { ...prev.dimensions, padding: parseInt(e.target.value) }
                      }))}
                      className="font-mono"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-mono">Live Area</Label>
                    <Input
                      type="number"
                      value={config.dimensions.liveArea}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        dimensions: { ...prev.dimensions, liveArea: parseInt(e.target.value) }
                      }))}
                      className="font-mono"
                    />
                  </div>
                </div>

                {/* Generation Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => generatePromptMutation.mutate(config)}
                    disabled={generatePromptMutation.isPending}
                    className="font-mono bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    <Code className="w-3 h-3 mr-1" />
                    Standard
                  </Button>
                  
                  <Button
                    onClick={() => generateCreativePromptMutation.mutate(config)}
                    disabled={generateCreativePromptMutation.isPending}
                    className="font-mono bg-purple-600 hover:bg-purple-700"
                    size="sm"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Creative
                  </Button>
                  
                  <Button
                    onClick={() => generateVariantsMutation.mutate(config)}
                    disabled={generateVariantsMutation.isPending}
                    className="font-mono bg-indigo-600 hover:bg-indigo-700"
                    size="sm"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    All Variants
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Prompts Panel */}
          <div className="space-y-6">
            {/* Standard Prompt */}
            {generatedPrompts.standard && (
              <Card className="border-2 border-green-500">
                <CardHeader>
                  <CardTitle className="font-mono flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      Standard Prompt
                    </span>
                    <Button
                      onClick={() => copyToClipboard(generatedPrompts.standard!, 'Standard prompt')}
                      size="sm"
                      variant="outline"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-xs font-mono bg-gray-50 p-4 rounded border max-h-64 overflow-y-auto">
                    {generatedPrompts.standard}
                  </pre>
                  <Badge className="mt-2 font-mono text-xs">
                    {generatedPrompts.standard.length} characters
                  </Badge>
                </CardContent>
              </Card>
            )}

            {/* Creative Prompt */}
            {generatedPrompts.creative && (
              <Card className="border-2 border-purple-500">
                <CardHeader>
                  <CardTitle className="font-mono flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Creative Prompt
                    </span>
                    <Button
                      onClick={() => copyToClipboard(generatedPrompts.creative!, 'Creative prompt')}
                      size="sm"
                      variant="outline"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-xs font-mono bg-purple-50 p-4 rounded border max-h-64 overflow-y-auto">
                    {generatedPrompts.creative}
                  </pre>
                  <Badge className="mt-2 font-mono text-xs bg-purple-100 text-purple-700">
                    {generatedPrompts.creative.length} characters
                  </Badge>
                </CardContent>
              </Card>
            )}

            {/* All Variants */}
            {generatedPrompts.variants && (
              <Card className="border-2 border-indigo-500">
                <CardHeader>
                  <CardTitle className="font-mono flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    All Prompt Variants
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(generatedPrompts.variants).map(([variant, prompt]) => (
                    <div key={variant} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="font-mono capitalize">{variant} Variant</Label>
                        <Button
                          onClick={() => copyToClipboard(prompt, `${variant} variant`)}
                          size="sm"
                          variant="outline"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <pre className="whitespace-pre-wrap text-xs font-mono bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">
                        {prompt}
                      </pre>
                      <Badge variant="outline" className="font-mono text-xs">
                        {prompt.length} chars
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}