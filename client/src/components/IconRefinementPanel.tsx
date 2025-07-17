import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Settings, 
  Wand2, 
  Sparkles, 
  RotateCcw, 
  Check, 
  AlertCircle,
  Zap,
  Square,
  Circle,
  Triangle,
  Accessibility
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface RefinementPanelProps {
  originalSvg: string;
  originalMetadata: any;
  onRefinedIcon: (result: any) => void;
}

interface RefinementPreset {
  name: string;
  description: string;
  icon: string;
}

export default function IconRefinementPanel({ 
  originalSvg, 
  originalMetadata, 
  onRefinedIcon 
}: RefinementPanelProps) {
  const [activeTab, setActiveTab] = useState('ui-controls');
  const [strokeWeight, setStrokeWeight] = useState(2);
  const [styleVariation, setStyleVariation] = useState<'minimal' | 'detailed' | 'bold'>('minimal');
  const [elementCount, setElementCount] = useState<'fewer' | 'more' | 'same'>('same');
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [refinementHistory, setRefinementHistory] = useState<any[]>([]);

  const { toast } = useToast();

  // Get available refinement presets
  const { data: presets = {} } = useQuery({
    queryKey: ['/api/refinement-presets'],
    queryFn: () => apiRequest('/api/refinement-presets')
  });

  // Refinement mutation
  const refinementMutation = useMutation({
    mutationFn: async (refinementData: any) => {
      return apiRequest('/api/refine-icon', {
        method: 'POST',
        body: JSON.stringify(refinementData),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (result) => {
      onRefinedIcon(result);
      setRefinementHistory(prev => [...prev, result]);
      toast({
        title: 'Icon refined successfully',
        description: `Applied ${result.changes.length} changes`
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Refinement failed',
        description: error.message || 'Failed to refine icon',
        variant: 'destructive'
      });
    }
  });

  const handleUIControlsRefinement = () => {
    const parameters = {
      strokeWeight: strokeWeight !== 2 ? strokeWeight : undefined,
      styleVariation: styleVariation !== 'minimal' ? styleVariation : undefined,
      elementCount: elementCount !== 'same' ? elementCount : undefined
    };

    // Only proceed if something has changed
    if (Object.values(parameters).some(val => val !== undefined)) {
      refinementMutation.mutate({
        originalSvg,
        originalMetadata,
        refinementType: 'ui_controls',
        parameters,
        userContext: 'UI controls adjustment'
      });
    } else {
      toast({
        title: 'No changes detected',
        description: 'Please adjust at least one control to refine the icon'
      });
    }
  };

  const handleCustomPromptRefinement = () => {
    if (!customPrompt.trim()) {
      toast({
        title: 'Custom prompt required',
        description: 'Please enter a custom refinement prompt'
      });
      return;
    }

    refinementMutation.mutate({
      originalSvg,
      originalMetadata,
      refinementType: 'custom_prompt',
      parameters: { customPrompt },
      userContext: 'Custom prompt refinement'
    });
  };

  const handlePresetRefinement = (presetKey: string) => {
    refinementMutation.mutate({
      originalSvg,
      originalMetadata,
      refinementType: 'preset',
      parameters: { preset: presetKey },
      userContext: `Preset refinement: ${presetKey}`
    });
  };

  const getPresetIcon = (presetKey: string) => {
    const iconMap: { [key: string]: any } = {
      'more_geometric': <Square className="w-4 h-4" />,
      'more_friendly': <Circle className="w-4 h-4" />,
      'more_minimal': <Triangle className="w-4 h-4" />,
      'more_detailed': <Zap className="w-4 h-4" />,
      'better_metaphor': <Sparkles className="w-4 h-4" />,
      'accessibility_focused': <Accessibility className="w-4 h-4" />
    };
    return iconMap[presetKey] || <Settings className="w-4 h-4" />;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          Icon Refinement
        </CardTitle>
        <CardDescription>
          Adjust your icon using UI controls, custom prompts, or presets
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ui-controls">
              <Settings className="w-4 h-4 mr-2" />
              Controls
            </TabsTrigger>
            <TabsTrigger value="custom-prompt">
              <Wand2 className="w-4 h-4 mr-2" />
              Custom
            </TabsTrigger>
            <TabsTrigger value="presets">
              <Sparkles className="w-4 h-4 mr-2" />
              Presets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ui-controls" className="space-y-6">
            <div className="space-y-4">
              {/* Stroke Weight */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Stroke Weight</Label>
                <div className="px-3">
                  <Slider
                    value={[strokeWeight]}
                    onValueChange={(value) => setStrokeWeight(value[0])}
                    min={1}
                    max={4}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1dp</span>
                    <span className="font-medium">{strokeWeight}dp</span>
                    <span>4dp</span>
                  </div>
                </div>
              </div>

              {/* Style Variation */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Style Variation</Label>
                <RadioGroup value={styleVariation} onValueChange={setStyleVariation as any}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="minimal" id="minimal" />
                    <Label htmlFor="minimal">Minimal - Remove decorative elements</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="detailed" id="detailed" />
                    <Label htmlFor="detailed">Detailed - Add contextual elements</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bold" id="bold" />
                    <Label htmlFor="bold">Bold - Increase visual weight</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Element Count */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Element Count</Label>
                <RadioGroup value={elementCount} onValueChange={setElementCount as any}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fewer" id="fewer" />
                    <Label htmlFor="fewer">Fewer - Simplify elements</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="same" id="same" />
                    <Label htmlFor="same">Same - Keep current count</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="more" id="more" />
                    <Label htmlFor="more">More - Add supporting elements</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button 
                onClick={handleUIControlsRefinement}
                disabled={refinementMutation.isPending}
                className="w-full"
              >
                {refinementMutation.isPending ? 'Refining...' : 'Apply Changes'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="custom-prompt" className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="custom-prompt">Custom Refinement Prompt</Label>
              <Textarea
                id="custom-prompt"
                placeholder="Describe how you'd like to modify the icon. For example: 'Make it look more modern', 'Add a small indicator dot', 'Make the lines thicker'..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Be specific about what you want to change. The system will interpret your request while maintaining style guide compliance.
              </p>
            </div>

            <Button 
              onClick={handleCustomPromptRefinement}
              disabled={refinementMutation.isPending || !customPrompt.trim()}
              className="w-full"
            >
              {refinementMutation.isPending ? 'Refining...' : 'Apply Custom Changes'}
            </Button>
          </TabsContent>

          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(presets).map(([key, preset]: [string, any]) => (
                <Button
                  key={key}
                  variant="outline"
                  className="flex items-center justify-start gap-3 h-auto p-4"
                  onClick={() => handlePresetRefinement(key)}
                  disabled={refinementMutation.isPending}
                >
                  {getPresetIcon(key)}
                  <div className="text-left">
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-sm text-gray-500">{preset.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Refinement History */}
        {refinementHistory.length > 0 && (
          <>
            <Separator className="my-6" />
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Refinement History
              </h4>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {refinementHistory.map((step, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {step.changes.length} changes
                        </Badge>
                        <span className="text-sm">
                          {step.changes[0] || 'Icon refined'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {step.validationResults.every((r: any) => r.status === 'PASS') ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}