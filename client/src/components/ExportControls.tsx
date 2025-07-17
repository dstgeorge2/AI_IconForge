import { useState } from 'react';
import { Copy, Download, Code } from 'lucide-react';
import { generateReactComponent, downloadSvg, copyToClipboard } from '@/lib/styleGuide';
import { useToast } from '@/hooks/use-toast';

interface ExportControlsProps {
  svg: string | null;
  disabled: boolean;
}

export default function ExportControls({ svg, disabled }: ExportControlsProps) {
  const [copyStates, setCopyStates] = useState({
    svg: false,
    react: false
  });
  const { toast } = useToast();

  const handleCopySvg = async () => {
    if (!svg) return;
    
    const success = await copyToClipboard(svg);
    if (success) {
      setCopyStates(prev => ({ ...prev, svg: true }));
      toast({ title: "SVG code copied to clipboard" });
      setTimeout(() => setCopyStates(prev => ({ ...prev, svg: false })), 2000);
    } else {
      toast({ title: "Failed to copy SVG code", variant: "destructive" });
    }
  };

  const handleDownload = () => {
    if (!svg) return;
    downloadSvg(svg);
    toast({ title: "SVG file downloaded" });
  };

  const handleCopyReact = async () => {
    if (!svg) return;
    
    const reactComponent = generateReactComponent(svg);
    const success = await copyToClipboard(reactComponent);
    if (success) {
      setCopyStates(prev => ({ ...prev, react: true }));
      toast({ title: "React component copied to clipboard" });
      setTimeout(() => setCopyStates(prev => ({ ...prev, react: false })), 2000);
    } else {
      toast({ title: "Failed to copy React component", variant: "destructive" });
    }
  };

  return (
    <div className="brutal-container">
      <div className="brutal-header">
        <h2 className="font-bold text-sm uppercase">03. Export</h2>
      </div>
      
      <div className="p-4 space-y-3">
        <button
          onClick={handleCopySvg}
          disabled={disabled || !svg}
          className="brutal-button w-full flex items-center justify-center gap-2"
        >
          <Copy className="w-4 h-4" />
          {copyStates.svg ? 'COPIED!' : 'COPY SVG CODE'}
        </button>
        
        <button
          onClick={handleDownload}
          disabled={disabled || !svg}
          className="brutal-button w-full flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          DOWNLOAD .SVG
        </button>
        
        <button
          onClick={handleCopyReact}
          disabled={disabled || !svg}
          className="brutal-button w-full flex items-center justify-center gap-2"
        >
          <Code className="w-4 h-4" />
          {copyStates.react ? 'COPIED!' : 'COPY REACT COMPONENT'}
        </button>
      </div>
    </div>
  );
}
