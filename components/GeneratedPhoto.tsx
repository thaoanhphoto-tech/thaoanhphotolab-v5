
import React from 'react';
import { GeneratedPhoto as GeneratedPhotoType } from '../types';

interface GeneratedPhotoProps {
  photo: GeneratedPhotoType;
  onDownload: (photo: GeneratedPhotoType) => void;
  onDelete?: (photoId: string) => void; // Optional delete functionality
}

export const GeneratedPhoto: React.FC<GeneratedPhotoProps> = ({ photo, onDownload, onDelete }) => {
  const handleDownloadClick = () => {
    onDownload(photo);
  };

  return (
    <div className="relative group aspect-square">
      <img src={photo.url} alt="Generated" className="w-full h-full object-contain rounded-lg bg-slate-100 dark:bg-zinc-800" />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2 rounded-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadClick}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors"
          >
            Tải xuống
          </button>
          {onDelete && (
             <button
              onClick={() => onDelete(photo.id)}
              className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              aria-label="Delete photo"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
