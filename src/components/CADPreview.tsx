
import { FileImage, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { useCADPreview } from '@/hooks/useCADPreview';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';

interface CADPreviewProps {
  projectId: string;
  fileUrl?: string;
  previewUrl?: string;
  className?: string;
}

const CADPreview = ({ projectId, fileUrl, previewUrl: existingPreviewUrl, className = "" }: CADPreviewProps) => {
  const { previewUrl: generatedPreviewUrl, loading, error } = useCADPreview(projectId, fileUrl);
  const [retryKey, setRetryKey] = useState(0);
  
  // Use existing preview URL if available, otherwise use generated one
  const displayPreviewUrl = existingPreviewUrl || generatedPreviewUrl;

  const handleRetry = () => {
    setRetryKey(prev => prev + 1);
    // Force a re-render by updating the key
    window.location.reload();
  };

  if (!fileUrl) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4 border ${className}`}>
        <FileImage className="w-8 h-8 text-gray-400 mb-2" />
        <span className="text-xs text-gray-500">No file</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center bg-blue-50 rounded-lg p-4 border border-blue-200 ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
        <span className="text-xs text-blue-600 font-medium">Generating preview...</span>
      </div>
    );
  }

  if (error || !displayPreviewUrl) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex flex-col items-center justify-center bg-red-50 rounded-lg p-4 relative group border border-red-200 ${className}`}>
              <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
              <span className="text-xs text-red-600 text-center mb-2 font-medium">
                {error ? 'Preview failed' : 'No preview'}
              </span>
              {error && (
                <span className="text-xs text-red-500 text-center mb-2 max-w-full break-words leading-tight">
                  {error.length > 50 ? error.substring(0, 50) + '...' : error}
                </span>
              )}
              {error && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRetry}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs break-words">{error || 'CAD preview not available'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={`overflow-hidden rounded-lg bg-white border shadow-sm ${className}`}>
      <img 
        src={displayPreviewUrl} 
        alt="CAD Preview" 
        className="w-full h-full object-contain p-2"
        onError={() => console.error('Failed to load CAD preview')}
        key={`${displayPreviewUrl}-${retryKey}`}
      />
    </div>
  );
};

export default CADPreview;
