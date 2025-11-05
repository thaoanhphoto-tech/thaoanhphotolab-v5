import React, { useState } from 'react';
import type { GeneratedImage } from './types';
import { ZoomModal } from '../ZoomModal';
import { PrinterIcon } from '../icons/PrinterIcon';
import { User, isFreeUserOnly } from '../../userStore';

interface ResultGridProps {
  images: GeneratedImage[];
  setImages: React.Dispatch<React.SetStateAction<GeneratedImage[]>>;
  currentUser: User | null;
  onPrintRequest: (imageDataUrl: string, sourceTool: string) => void;
}

export const ResultGrid: React.FC<ResultGridProps> = ({ images, setImages, currentUser, onPrintRequest }) => {
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const isFree = isFreeUserOnly(currentUser);

  const handleDownload = (imageUrl: string, name: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${name.replace(/\s+/g, '_')}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (images.length === 0) {
    return (
      <div className="w-full h-full min-h-[50vh] bg-slate-100 dark:bg-slate-800/30 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Kết quả sẽ hiện ở đây</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map(image => (
          <div key={image.id} className="relative group aspect-w-1 aspect-h-1">
            <img src={image.displayUrl} alt={image.name} className="w-full h-full object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-2 rounded-lg">
                <p className="text-white text-xs font-bold text-center mb-2">{image.name}</p>
                <div className="flex items-center gap-2">
                    <button onClick={() => setZoomedImageUrl(image.displayUrl)} className="px-3 py-1.5 bg-white/20 text-white text-xs font-semibold rounded-md hover:bg-white/30 backdrop-blur-sm">Xem</button>
                    {!isFree && (
                        <button onClick={() => handleDownload(image.displayUrl, image.name)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700">Tải</button>
                    )}
                    <button 
                        onClick={() => onPrintRequest(image.originalUrl, "Tạo Concept")}
                        className="p-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        title="Gửi in Lab"
                    >
                        <PrinterIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
          </div>
        ))}
      </div>
      {zoomedImageUrl && <ZoomModal imageUrl={zoomedImageUrl} onClose={() => setZoomedImageUrl(null)} />}
    </>
  );
};