import React, { useRef, useMemo, useState, useEffect } from 'react';
import type { Translation, PostProcessingSettings } from './types';
import { ComparisonSlider } from '../ComparisonSlider';
import { ProgressBar } from './ProgressBar';
import { ExclamationCircleIcon } from '../icons/ExclamationCircleIcon';
import { PostProcessingPanel } from './PostProcessingPanel';
import { useImageZoomPan } from './hooks/useImageZoomPan';
import { PrinterIcon } from '../icons/PrinterIcon';
import { User, isFreeUserOnly } from '../../userStore';
import { applyWatermark } from '../../utils/imageUtils';
import { ArrowUturnLeftIcon } from '../icons/ArrowUturnLeftIcon';

interface ImageDisplayProps {
  currentUser: User | null;
  originalImageUrl: string | null;
  generatedImageUrl: string | null;
  isRelighting: boolean;
  loadingMessage: string;
  error: { title: string; message: string } | null;
  t: Translation['imageDisplay'];
  postProcessingSettings: PostProcessingSettings;
  setPostProcessingSettings: React.Dispatch<React.SetStateAction<PostProcessingSettings>>;
  postProcessingTranslations: Translation['postProcessing'];
  onPrintRequest: (imageDataUrl: string, sourceTool: string) => void;
  onUseAsOriginal: (imageDataUrl: string) => void;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({
  currentUser,
  originalImageUrl,
  generatedImageUrl,
  isRelighting,
  loadingMessage,
  error,
  t,
  postProcessingSettings,
  setPostProcessingSettings,
  postProcessingTranslations,
  onPrintRequest,
  onUseAsOriginal
}) => {
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const { transform, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, handleTouchStart, handleTouchMove } = useImageZoomPan(imageContainerRef);
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isFreeUserOnly(currentUser) && generatedImageUrl) {
      applyWatermark(generatedImageUrl).then(setDisplayUrl);
    } else {
      setDisplayUrl(generatedImageUrl);
    }
  }, [generatedImageUrl, currentUser]);

  const isFree = isFreeUserOnly(currentUser);

  const displayContent = () => {
    if (isRelighting) return <ProgressBar message={loadingMessage} />;
    if (error) return (
      <div className="p-6 text-center text-red-500">
        <ExclamationCircleIcon className="w-12 h-12 mx-auto mb-4" />
        <h3 className="font-bold text-lg">{error.title}</h3>
        <p className="text-sm">{error.message}</p>
      </div>
    );
    if (originalImageUrl && displayUrl) return (
      <ComparisonSlider originalImageUrl={originalImageUrl} generatedImageUrl={displayUrl} />
    );
    if (originalImageUrl && !displayUrl) return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <img src={originalImageUrl} alt={t.original} className="max-w-full max-h-full object-contain rounded-lg" />
      </div>
    );
    return (
        <div className="text-center text-slate-500 dark:text-slate-400">
            <p>{originalImageUrl ? t.resultPrompt : t.uploadPrompt}</p>
        </div>
    );
  };
  
  const handleDownload = async () => {
      if (!displayUrl) return;

      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = displayUrl;

      image.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const filters = `
              saturate(${1 + postProcessingSettings.saturation / 100})
              contrast(${1 + postProcessingSettings.contrast / 100})
              brightness(${1 + postProcessingSettings.exposure / 100})
              drop-shadow(0 0 0 ${postProcessingSettings.temperature > 0 ? 'rgba(255, 165, 0, ' + postProcessingSettings.temperature/200 + ')' : 'rgba(0, 0, 255, ' + Math.abs(postProcessingSettings.temperature)/200 + ')'})
          `.trim();
          
          ctx.filter = filters;

          // Note: Advanced adjustments like highlights/shadows are complex with canvas filters.
          // This is a simplified application. For full effect, a library like gl-react would be better.
          if(postProcessingSettings.highlights !== 0 || postProcessingSettings.shadows !== 0) {
             // This is a complex operation, skipping for this simple implementation, but logging it.
             console.warn("Highlights/Shadows adjustments are not applied to downloaded image in this simplified version.");
          }

          ctx.drawImage(image, 0, 0);

          const link = document.createElement('a');
          link.download = `relighted-photo-${Date.now()}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
      };
  };

  const imageStyle = useMemo(() => ({
    filter: `
      saturate(${1 + postProcessingSettings.saturation / 100})
      contrast(${1 + postProcessingSettings.contrast / 100})
      brightness(${1 + postProcessingSettings.exposure / 100})
    `,
    '--temperature-color': postProcessingSettings.temperature > 0 ? `rgba(255, 165, 0, ${postProcessingSettings.temperature / 200})` : `rgba(0, 0, 255, ${Math.abs(postProcessingSettings.temperature) / 200})`,
    '--highlights-amount': `${1 + postProcessingSettings.highlights / 100}`,
    '--shadows-amount': `${postProcessingSettings.shadows / 100}`,
    transform,
  }), [postProcessingSettings, transform]);

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={imageContainerRef}
        className="flex-grow relative bg-slate-200 dark:bg-slate-900/50 rounded-lg flex items-center justify-center overflow-hidden border border-slate-300 dark:border-slate-700"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        <div style={imageStyle} className="w-full h-full cursor-grab active:cursor-grabbing">
            {displayContent()}
        </div>
      </div>
      
      {generatedImageUrl && (
        <div className="mt-4 flex flex-col md:flex-row gap-4">
           <div className="flex-grow">
               <PostProcessingPanel settings={postProcessingSettings} setSettings={setPostProcessingSettings} t={postProcessingTranslations}/>
           </div>
           <div className="flex-shrink-0 flex md:flex-col gap-3">
               <button 
                onClick={() => onUseAsOriginal(generatedImageUrl)} 
                disabled={isFree}
                className={`flex-1 w-full md:w-auto px-4 py-2 bg-slate-500 text-white font-semibold rounded-md hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 text-sm ${isFree ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title={isFree ? "Nâng cấp để sử dụng tính năng này" : "Dùng làm ảnh gốc"}
              >
                 <ArrowUturnLeftIcon className="w-4 h-4" /> {t.useAsOriginalButton || 'Dùng làm gốc'}
              </button>
                {!isFree && <button onClick={handleDownload} className="flex-1 w-full md:w-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors text-sm">{t.downloadButton}</button> }
               <button onClick={() => onPrintRequest(generatedImageUrl, "Pro AI Relight")} className="flex-1 w-full md:w-auto px-4 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm">
                 <PrinterIcon className="w-4 h-4" /> {t.sendToLabButton}
              </button>
           </div>
        </div>
      )}
    </div>
  );
};