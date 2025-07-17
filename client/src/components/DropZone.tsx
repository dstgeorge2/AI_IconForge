import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export default function DropZone({ onFileSelect, isProcessing }: DropZoneProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onFileSelect(file);
    }
    setDragActive(false);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isProcessing,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false)
  });

  return (
    <div className="brutal-container">
      <div className="brutal-header">
        <h2 className="font-bold text-sm uppercase">01. DROP IMAGE</h2>
      </div>
      
      <div className="p-4">
        <div
          {...getRootProps()}
          className={`
            p-8 border-2 border-dashed border-black min-h-[200px] 
            flex flex-col items-center justify-center cursor-pointer 
            transition-colors font-mono
            ${isDragActive || dragActive ? 'bg-gray-100' : 'bg-white'}
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="text-center">
            <Upload className="w-8 h-8 mx-auto mb-4" />
            <p className="font-bold text-sm mb-2 uppercase">
              {isDragActive ? 'Drop image here' : 'Drag & drop image here'}
            </p>
            <p className="text-xs uppercase">Or click to select file</p>
            <p className="text-xs mt-2 text-gray-600">
              JPG, PNG, GIF, WEBP • MAX 10MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
