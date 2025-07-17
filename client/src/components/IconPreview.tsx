import { useState } from 'react';

interface IconPreviewProps {
  svg: string | null;
  metadata: any;
}

export default function IconPreview({ svg, metadata }: IconPreviewProps) {
  const [selectedSize, setSelectedSize] = useState('24');
  
  const sizes = [
    { size: '16', display: '16DP', width: 'w-4', height: 'h-4' },
    { size: '20', display: '20DP', width: 'w-5', height: 'h-5' },
    { size: '24', display: '24DP', width: 'w-6', height: 'h-6' },
    { size: '48', display: '48DP', width: 'w-12', height: 'h-12' }
  ];

  return (
    <div className="brutal-container">
      <div className="brutal-header">
        <h2 className="font-bold text-sm uppercase">Generated Icon</h2>
      </div>
      
      <div className="p-8">
        {/* Size variants */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {sizes.map(({ size, display, width, height }) => (
            <div key={size} className="text-center">
              <div 
                className={`
                  border border-black ${width} ${height} mx-auto mb-2 
                  flex items-center justify-center bg-gray-50 cursor-pointer
                  ${selectedSize === size ? 'bg-black text-white' : 'hover:bg-gray-100'}
                `}
                onClick={() => setSelectedSize(size)}
              >
                {svg ? (
                  <div 
                    className={`${width} ${height}`}
                    dangerouslySetInnerHTML={{ __html: svg }}
                  />
                ) : (
                  <span className="text-xs">{size}dp</span>
                )}
              </div>
              <span className="text-xs font-bold">{display}</span>
            </div>
          ))}
        </div>
        
        {/* Main preview */}
        <div className="border-2 border-black bg-gray-50 h-40 flex items-center justify-center">
          {svg ? (
            <div 
              className="w-24 h-24"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ) : (
            <div className="text-xs text-gray-400 flex items-center justify-center">
              NO ICON GENERATED
            </div>
          )}
        </div>
        
        {/* Metadata display */}
        {metadata && (
          <div className="mt-4 p-3 border border-black bg-gray-50 text-xs">
            <div className="font-bold uppercase mb-2">Metadata:</div>
            <div>Primary Shape: {metadata.primaryShape}</div>
            <div>Stroke Width: {metadata.strokeWidth}dp</div>
            <div>Canvas Size: {metadata.canvasSize}x{metadata.canvasSize}dp</div>
            <div>Fill Used: {metadata.fillUsed ? 'Yes' : 'No'}</div>
            <div>Validated: {metadata.validated ? 'Yes' : 'No'}</div>
          </div>
        )}
      </div>
    </div>
  );
}
